// STM32 ROM-bootloader DFU (DfuSe) over WebUSB — the "DFU Recovery" engine.
// Flashes a full bootloader+app image (parsed Intel HEX) to absolute addresses.
// Protocol per the verified dfu-flash skill: Set Address (0x21), Erase (0x41),
// sequential DNLOAD blocks (wBlockNum >= 2), then Leave DFU.
//
// NOTE: device VID/PID 0483:DF11 is the STM32 system bootloader (BOOT0 + reset).
// Windows requires a one-time WinUSB binding (Zadig) for WebUSB to claim it.

import type { ParsedHex } from './intel-hex';

const STM_VID = 0x0483, STM_PID = 0xdf11;
const DNLOAD = 1, GETSTATUS = 3, CLRSTATUS = 4, ABORT = 6;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Log = (msg: string) => void;
export type Progress = (done: number, total: number) => void;

interface Sector { start: number; size: number; }

export class DfuError extends Error {}

/** True for USB-level transfer failures: WebUSB throws a DOMException "NetworkError:
 *  A transfer error has occurred", or DNLOAD returns a non-ok (stall/babble) status.
 *  These drive the adaptive chunk-size fallback in flash(). */
function isXferError(e: any): boolean {
  const name = e?.name ?? '';
  const msg = String(e?.message ?? e ?? '');
  return name === 'NetworkError' || /transfer error|stall|babble|DNLOAD/i.test(msg);
}

export class STM32Dfu {
  private dev: USBDevice;
  private iface = 0;
  private sectors: Sector[] = [];

  private constructor(dev: USBDevice) { this.dev = dev; }

  static available(): boolean {
    return typeof navigator !== 'undefined' && !!(navigator as any).usb;
  }

  /** Prompt the browser device picker (filtered to 0483:DF11) and open it. */
  static async connect(): Promise<STM32Dfu> {
    if (!STM32Dfu.available()) throw new DfuError('This browser does not support WebUSB (desktop Chrome/Edge required).');
    const dev = await (navigator as any).usb.requestDevice({ filters: [{ vendorId: STM_VID, productId: STM_PID }] });
    return STM32Dfu.open(dev);
  }

  /** Silently reconnect to an already-authorized DFU device (no picker). null if none. */
  static async autoConnect(): Promise<STM32Dfu | null> {
    if (!STM32Dfu.available()) return null;
    const devs = await (navigator as any).usb.getDevices();
    const dev = devs.find((d: any) => d.vendorId === STM_VID && d.productId === STM_PID);
    return dev ? STM32Dfu.open(dev) : null;
  }

  private static async open(dev: USBDevice): Promise<STM32Dfu> {
    const self = new STM32Dfu(dev);
    await dev.open();
    if (dev.configuration === null) await dev.selectConfiguration(1);
    // DFU is interface 0; alt 0 = "Internal Flash"
    const cfg = dev.configuration!;
    const ifc = cfg.interfaces.find((i) => i.alternates.some((a) => a.interfaceClass === 0xfe)) || cfg.interfaces[0];
    self.iface = ifc.interfaceNumber;
    await dev.claimInterface(self.iface);
    await dev.selectAlternateInterface(self.iface, 0);
    self.sectors = await STM32Dfu.resolveLayout(dev, ifc);
    await self.clearIfError();
    return self;
  }

  /** Read a USB STRING descriptor by index via a raw control transfer (langid 0x0409 en-US).
   *  Mirrors flash_dfu.py's get_string(): WebUSB's `alternate.interfaceName` comes back EMPTY
   *  for some bootloaders (verified on the STM32F405 ROM DFU — the descriptor is present at
   *  index 4 but Chrome surfaces it as ''), so we fetch it directly. */
  private static async readString(dev: USBDevice, index: number): Promise<string> {
    if (!index) return '';
    try {
      const r = await dev.controlTransferIn(
        { requestType: 'standard', recipient: 'device', request: 6 /* GET_DESCRIPTOR */,
          value: (0x03 << 8) | index, index: 0x0409 }, 255);
      if (r.status !== 'ok' || !r.data || r.data.byteLength < 2) return '';
      const b = new Uint8Array(r.data.buffer);
      let s = '';
      for (let i = 2; i + 1 < b[0]; i += 2) s += String.fromCharCode(b[i] | (b[i + 1] << 8));
      return s;
    } catch { return ''; }
  }

  /** Resolve the DfuSe Internal-Flash sector map. Prefer WebUSB's alt-0 interfaceName, but
   *  when it is empty (STM32F405 ROM DFU) scan raw string descriptors for the "@Internal Flash
   *  /0x08000000/…" line. Restoring the real layout keeps the chip-capacity / cross-family
   *  guards working instead of falsely reporting "0 KB flash". */
  private static async resolveLayout(dev: USBDevice, ifc: any): Promise<Sector[]> {
    let layout = parseMemoryLayout(ifc.alternates[0].interfaceName || '');
    if (layout.length) return layout;
    for (let idx = 1; idx <= 8; idx++) {
      const s = await STM32Dfu.readString(dev, idx);
      if (/\/0x08000000\//.test(s)) {
        layout = parseMemoryLayout(s);
        if (layout.length) return layout;
      }
    }
    return layout; // still empty -> sectorsInRange()'s F4 fallback + capacity warning apply
  }

  deviceLabel(): string {
    return `${this.dev.manufacturerName ?? 'STM32'} ${this.dev.productName ?? 'BOOTLOADER'} (0483:DF11)`;
  }

  /** Internal-flash geometry from the DfuSe descriptor (alt 0): base address + total size. */
  flashInfo(): { base: number; totalSize: number; family: 'F4' | 'F7' | 'H7' | 'unknown' } {
    const base = this.sectors.length ? this.sectors[0].start : 0x08000000;
    const totalSize = this.sectors.reduce((a, s) => a + s.size, 0);
    return { base, totalSize, family: this.classifyFamily() };
  }

  /** Classify the STM32 family from the flash SECTOR SIGNATURE — the only chip identity the
   *  ROM DFU bootloader exposes. (DBGMCU_IDCODE is NOT readable over DfuSe: Set Address to
   *  0xE0042000 stalls with a Pipe error — verified on hardware. Only the 4 declared regions
   *  — Internal Flash / Option Bytes / OTP / Device Feature — are accessible.)
   *   F4 (F405): 16K boot sectors + 64K + 128K  ·  F7 (F765): 32K boot + 128K + 256K
   *   H7 (H743/H753): uniform 128K sectors. */
  private classifyFamily(): 'F4' | 'F7' | 'H7' | 'unknown' {
    const sizes = this.sectors.map((s) => s.size);
    if (!sizes.length) return 'unknown';
    const K = 1024;
    const min = Math.min(...sizes), max = Math.max(...sizes);
    if (min === 16 * K) return 'F4';
    if (min === 32 * K || max === 256 * K) return 'F7';
    if (sizes.every((s) => s === 128 * K)) return 'H7';
    return 'unknown';
  }

  /** Human label like CubeProgrammer's device line — derived from the descriptor layout
   *  (NOT a silicon-ID read, which the DFU bootloader forbids). */
  chipLabel(): string {
    const { totalSize, family } = this.flashInfo();
    const name = family === 'unknown' ? 'STM32 (unrecognized layout)' : `STM32${family}-class`;
    return `${name} · ${(totalSize / 1024) | 0} KB flash`;
  }

  private async dnload(wValue: number, data?: BufferSource) {
    const r = await this.dev.controlTransferOut(
      { requestType: 'class', recipient: 'interface', request: DNLOAD, value: wValue, index: this.iface },
      data as any
    );
    if (r.status !== 'ok') throw new DfuError(`DNLOAD failed: ${r.status}`);
  }
  private async getStatus(): Promise<{ status: number; poll: number; state: number }> {
    const r = await this.dev.controlTransferIn(
      { requestType: 'class', recipient: 'interface', request: GETSTATUS, value: 0, index: this.iface }, 6);
    const d = new Uint8Array(r.data!.buffer);
    return { status: d[0], poll: d[1] | (d[2] << 8) | (d[3] << 16), state: d[4] };
  }
  private async clearIfError() {
    try {
      const st = await this.getStatus();
      if (st.state === 10 /* dfuERROR */) {
        await this.dev.controlTransferOut({ requestType: 'class', recipient: 'interface', request: CLRSTATUS, value: 0, index: this.iface });
      }
    } catch { /* ignore */ }
  }

  /** Poll GETSTATUS until the device leaves dfuDNBUSY (operation truly complete); throw on
   *  error. Critical: a command's first GETSTATUS returns dfuDNBUSY+poll — if we send the
   *  next transfer before the device returns to idle it stalls ("transfer error"). */
  private async pollIdle() {
    for (let i = 0; i < 5000; i++) {
      const st = await this.getStatus();
      if (st.status !== 0) throw new DfuError(`device status ${st.status} (state ${st.state})`);
      if (st.state !== 4 /* dfuDNBUSY */) return;
      await sleep(st.poll > 5 ? 5 : (st.poll || 1));
    }
    throw new DfuError('status poll timeout');
  }

  /** Best-effort: clear a latched error and ABORT back to idle after a failed transfer. */
  private async recover() {
    try {
      const st = await this.getStatus();
      if (st.state === 10) await this.dev.controlTransferOut({ requestType: 'class', recipient: 'interface', request: CLRSTATUS, value: 0, index: this.iface });
    } catch { /* ignore */ }
    try { await this.dev.controlTransferOut({ requestType: 'class', recipient: 'interface', request: ABORT, value: 0, index: this.iface }); } catch { /* ignore */ }
    try { await this.getStatus(); } catch { /* ignore */ }
  }

  /** DfuSe special command (Set Address 0x21 / Erase page 0x41). */
  private async dfuseCmd(cmd: number, addr?: number) {
    const payload = addr === undefined
      ? new Uint8Array([cmd])
      : new Uint8Array([cmd, addr & 0xff, (addr >>> 8) & 0xff, (addr >>> 16) & 0xff, (addr >>> 24) & 0xff]);
    await this.dnload(0, payload);
    await this.pollIdle(); // wait until the command (erase / set-address) truly completes
  }

  private sectorsInRange(start: number, end: number): number[] {
    if (this.sectors.length === 0) {
      // fallback: assume STM32F4 layout from 0x08000000
      const f4 = [16384, 16384, 16384, 16384, 65536, 131072, 131072, 131072, 131072, 131072, 131072, 131072];
      let a = 0x08000000; this.sectors = f4.map((s) => { const o = { start: a, size: s }; a += s; return o; });
    }
    const out: number[] = [];
    for (const s of this.sectors) if (s.start < end && s.start + s.size > start) out.push(s.start);
    return out;
  }

  /** Erase → program → verify-by-leave for the parsed HEX image. */
  async flash(hex: ParsedHex, log: Log, progress: Progress) {
    // Full-chip erase: wipe EVERY internal-flash sector, not just the ones this image
    // covers, so any leftover firmware/parameters in the sectors above the new image are
    // removed. DFU Recovery always flashes a full bootloader+app (_with_bl.hex), so a clean
    // whole-chip wipe is correct. (The DfuSe ROM bootloader has no single mass-erase command,
    // so we erase every sector in the layout; 0x08000000–0xffffffff selects them all.)
    const eraseStarts = this.sectorsInRange(0x08000000, 0xffffffff);
    const last = this.sectors[this.sectors.length - 1];
    const end = last.start + last.size;
    log(`Erase ${eraseStarts.length} sector(s) — full chip 0x${(0x08000000).toString(16)}–0x${end.toString(16)} …`);
    for (let i = 0; i < eraseStarts.length; i++) {
      await this.dfuseCmd(0x41, eraseStarts[i]);
      progress(Math.round(((i + 1) / eraseStarts.length) * 300), 1000); // erase = first 0–30%
    }
    log('Erase done.');

    // Each block sets the address pointer explicitly (wBlockNum stays 2), so the chunk
    // size is free — addressing never depends on the device's wTransferSize stride.
    // Start at 1024 B and, on any USB transfer error, recover + halve the chunk and retry
    // the SAME offset: self-tunes to whatever this WebUSB/WinUSB stack actually accepts.
    let cap = 1024;
    log(`Write ${hex.totalBytes} bytes …`);
    let written = 0;
    for (const seg of hex.segments) {
      let off = 0;
      while (off < seg.data.length) {
        const size = Math.min(cap, seg.data.length - off);
        const addr = seg.address + off;
        const chunk = new Uint8Array(seg.data.subarray(off, off + size)); // clean standalone buffer
        try {
          await this.setAddress(addr);
          await this.dnload(2, chunk);
          await this.pollIdle(); // wait for this block's program to finish before the next
          off += size; written += size;
          progress(300 + Math.round((written / hex.totalBytes) * 700), 1000); // write = 30–100%
        } catch (e) {
          if (isXferError(e) && cap > 64) {
            cap = cap >> 1;
            log(`Transfer error — retrying with smaller ${cap}B chunks …`);
            await this.recover();
            continue; // retry the same offset with the smaller cap
          }
          throw e;
        }
      }
    }
    log(`(used ${cap}B chunks)`);
    log('Program complete. Leaving DFU …');
    await this.leave(hex.minAddress);
  }

  /** DfuSe Set Address Pointer (0x21) with a single status poll. */
  private async setAddress(addr: number) {
    await this.dnload(0, new Uint8Array([0x21, addr & 0xff, (addr >>> 8) & 0xff, (addr >>> 16) & 0xff, (addr >>> 24) & 0xff]));
    await this.pollIdle(); // MUST wait for idle before the next write, else it stalls (transfer error)
  }

  /** Leave DFU: Set Address to image base → zero-length DNLOAD → GETSTATUS (device resets). */
  private async leave(baseAddr: number) {
    try {
      await this.dfuseCmd(0x21, baseAddr);
      await this.dnload(2, new Uint8Array(0));
      await this.getStatus(); // triggers manifestation; device resets (may throw on disconnect)
    } catch { /* device reset/disconnect is expected */ }
  }

  async close() { try { await this.dev.close(); } catch { /* ignore */ } }
}

/** Parse a DfuSe interface name e.g. "@Internal Flash /0x08000000/04*016Kg,01*064Kg,07*128Kg". */
function parseMemoryLayout(name: string): Sector[] {
  const m = name.match(/\/0x([0-9a-fA-F]+)\/(.+)$/);
  if (!m) return [];
  let addr = parseInt(m[1], 16);
  const out: Sector[] = [];
  for (const part of m[2].split(',')) {
    const sm = part.match(/(\d+)\*(\d+)([KMB])/);
    if (!sm) continue;
    const count = parseInt(sm[1], 10);
    const unit = sm[3] === 'K' ? 1024 : sm[3] === 'M' ? 1024 * 1024 : 1;
    const size = parseInt(sm[2], 10) * unit;
    for (let i = 0; i < count; i++) { out.push({ start: addr, size }); addr += size; }
  }
  return out;
}
