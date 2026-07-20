// STM32 ROM-bootloader DFU (DfuSe) over WebUSB — the "DFU Recovery" engine.
// Flashes a full bootloader+app image (parsed Intel HEX) to absolute addresses.
// Protocol per the verified dfu-flash skill: Set Address (0x21), Erase (0x41),
// sequential DNLOAD blocks (wBlockNum >= 2), then Leave DFU.
//
// NOTE: device VID/PID 0483:DF11 is the STM32 system bootloader (BOOT0 + reset).
// Windows requires a one-time WinUSB binding (Zadig) for WebUSB to claim it.

import type { ParsedHex } from './intel-hex';

const STM_VID = 0x0483, STM_PID = 0xdf11;
const DNLOAD = 1, UPLOAD = 2, GETSTATUS = 3, CLRSTATUS = 4, ABORT = 6;
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
  /** True after an H7 flash: the boot address was set via the ROM and the board must be
   *  power-cycled (unplug/replug) to boot the app — it does NOT auto-reboot. */
  needsPowerCycle = false;

  private constructor(dev: USBDevice) { this.dev = dev; }

  static available(): boolean {
    return typeof navigator !== 'undefined' && !!(navigator as any).usb;
  }

  /** True if the browser already has an AUTHORIZED 0483:DF11 device (a board sitting in DFU).
   *  Uses getDevices() (no picker, does NOT consume the click's user-gesture), so the caller can
   *  decide "show the WebUSB picker" vs "enter DFU over serial" and still call requestDevice() after. */
  static async anyPresent(): Promise<boolean> {
    if (!STM32Dfu.available()) return false;
    try {
      const devs = await (navigator as any).usb.getDevices();
      return devs.some((d: any) => d.vendorId === STM_VID && d.productId === STM_PID);
    } catch { return false; }
  }

  /** Prompt the browser device picker (filtered to 0483:DF11) and open it. */
  static async connect(): Promise<STM32Dfu> {
    if (!STM32Dfu.available()) throw new DfuError('This browser does not support WebUSB (desktop Chrome/Edge required).');
    const dev = await (navigator as any).usb.requestDevice({ filters: [{ vendorId: STM_VID, productId: STM_PID }] });
    return STM32Dfu.open(dev);
  }

  /** Silently reconnect to an already-authorized DFU device (no picker). null if none.
   *  When several 0483:DF11 devices are authorized at once (e.g. an F4 AND an F7 both sitting
   *  in DFU), open each and return the one whose chip family matches `wantFamily`. If a family
   *  is wanted but none matches, return null — the caller then enters DFU on the INTENDED board
   *  instead of silently grabbing the wrong one (the old bug: picked F7 firmware, connected F4). */
  static async autoConnect(wantFamily?: string | null): Promise<STM32Dfu | null> {
    if (!STM32Dfu.available()) return null;
    const devs = (await (navigator as any).usb.getDevices())
      .filter((d: any) => d.vendorId === STM_VID && d.productId === STM_PID);
    if (!devs.length) return null;
    if (devs.length === 1 && !wantFamily) return STM32Dfu.open(devs[0]);
    let fallback: STM32Dfu | null = null;
    for (const d of devs) {
      let dfu: STM32Dfu | null = null;
      try { dfu = await STM32Dfu.open(d); } catch { continue; }
      if (!wantFamily || dfu.flashInfo().family === wantFamily) return dfu;   // chip match
      if (!fallback) fallback = dfu; else await dfu.close();
    }
    if (wantFamily) { if (fallback) await fallback.close(); return null; }     // wanted chip not present → don't use a wrong board
    return fallback;
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
  private async pollIdle(longWait = false) {
    for (let i = 0; i < 5000; i++) {
      const st = await this.getStatus();
      if (st.status !== 0) throw new DfuError(`device status ${st.status} (state ${st.state})`);
      if (st.state !== 4 /* dfuDNBUSY */) return;
      // Long ops (sector/bank erase): honour the device's bwPollTimeout (33–250 ms) instead of
      // hammering GETSTATUS every ~1 ms. The H7 ROM keeps dfuDNBUSY for ~15 s during its erase;
      // thousands of back-to-back WebUSB control transfers saturate WinUSB and make Chrome show
      // "page unresponsive". Short ops (write chunks / set-address) keep the fast 5 ms poll.
      await sleep(longWait ? Math.min(Math.max(st.poll || 33, 33), 250) : (st.poll > 5 ? 5 : (st.poll || 1)));
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
  private async dfuseCmd(cmd: number, addr?: number, longWait = false) {
    const payload = addr === undefined
      ? new Uint8Array([cmd])
      : new Uint8Array([cmd, addr & 0xff, (addr >>> 8) & 0xff, (addr >>> 16) & 0xff, (addr >>> 24) & 0xff]);
    await this.dnload(0, payload);
    await this.pollIdle(longWait); // wait until the command (erase / set-address) truly completes
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
    // Erase and write share ONE progress bar (0–30% erase, 30–100% write). On the STM32H7 ROM
    // DFU a per-sector step leaves the bar frozen near 0 and then jumping — most of the erase
    // time is spent inside a single Erase command (bank/bulk erase), so few visible steps fire
    // (F4 erases per sector and stepped fine). Instead creep the bar smoothly toward ~30% on a
    // timer across the whole erase phase, then snap to exactly 30% once every sector is done —
    // so the bar always moves during erase regardless of how the ROM schedules the work.
    const eraseEstMs = Math.max(3000, eraseStarts.length * 1200);
    const eraseT0 = Date.now();
    const eraseTimer = setInterval(() => {
      const frac = Math.min(0.97, (Date.now() - eraseT0) / eraseEstMs);
      progress(Math.round(frac * 300), 1000);
    }, 120);
    try {
      for (let i = 0; i < eraseStarts.length; i++) {
        await this.dfuseCmd(0x41, eraseStarts[i], true); // erase is long — poll gently so the page stays responsive
      }
    } finally {
      clearInterval(eraseTimer);
    }
    progress(300, 1000); // erase complete = 30%
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
    // STM32H7 path: verify, then set the app boot address via the ROM's @Option Bytes interface
    // (reliable — the same option-byte write CubeProgrammer's -ob does, verified on-bench). We do
    // NOT do a DFU-leave here: the leave-jump would run the firmware self-heal, whose option-byte
    // write from flash silently ~50%-fails (RWW), and BOOT_CM7_ADD0 is re-latched only at a
    // power-on reset anyway. So we end in DFU with the boot address already set and tell the user
    // to power-cycle. F4/F7 don't use BOOT_ADD0 and boot on a normal leave, so they take the
    // branch below unchanged.
    if (this.flashInfo().family === 'H7') {
      log('Verifying (read-back) …');
      await this.verify(hex, progress);
      log('Verify OK.');
      await this.abortToIdle();
      log('Checking boot address (BOOT_CM7_ADD0) …');
      const fixed = await this.setBootAddress0(0x08000000);
      await this.abortToIdle();
      if (fixed) {
        // The board entered ROM DFU via BOOT_CM7_ADD0 = 0x1FF0 (buttonless / soft DFU, e.g.
        // AF-H7E). We reset it to 0x08000000 via the ROM; that only re-latches at a power-on
        // reset, and a DFU-leave here would just run the unreliable firmware self-heal. So end
        // in DFU and have the caller tell the user to power-cycle.
        this.needsPowerCycle = true;
        log('✓ Boot address set to the app (BOOT_CM7_ADD0 → 0x08000000).');
        return;
      }
      // BOOT_CM7_ADD0 already = 0x08000000 (this H7 board did not enter DFU via the boot-address
      // option byte), so a normal leave boots the app.
    }
    log('Leaving DFU …');
    await this.leave(hex.minAddress);
  }

  private async upload(wValue: number, length: number): Promise<Uint8Array> {
    const r = await this.dev.controlTransferIn(
      { requestType: 'class', recipient: 'interface', request: UPLOAD, value: wValue, index: this.iface }, length);
    if (r.status !== 'ok') throw new DfuError(`UPLOAD failed: ${r.status}`);
    return new Uint8Array(r.data!.buffer);
  }

  /** ABORT the DfuSe state machine back to dfuIDLE (clearing a latched error first). */
  private async abortToIdle() {
    try { const st = await this.getStatus(); if (st.state === 10 /* dfuERROR */) await this.dev.controlTransferOut({ requestType: 'class', recipient: 'interface', request: CLRSTATUS, value: 0, index: this.iface }); } catch { /* ignore */ }
    try { await this.dev.controlTransferOut({ requestType: 'class', recipient: 'interface', request: ABORT, value: 0, index: this.iface }); } catch { /* ignore */ }
    try { await this.getStatus(); } catch { /* ignore */ }
  }

  /** Set the STM32H7 CM7 cold-boot address (BOOT_CM7_ADD0, used when BOOT0 is low) through the
   *  ROM's DfuSe "@Option Bytes" alt interface — the exact reliable option-byte write CubeProgrammer
   *  does over USB1 (verified on-bench via the pyusb twin, both directions, RDP preserved).
   *
   *  WHY the tool does this: the novaX firmware self-heal used to restore BOOT_CM7_ADD0=0x08000000
   *  from the bootloader after a DFU flash, but on H7 an option-byte write issued from code running
   *  in flash silently fails ~50% of the time (RWW: OPTSTART stalls the flash array for ~300 ms and
   *  any fetch voids the write). The halted ROM has no such conflict, so writing it here is
   *  deterministic. Read-modify-write: only the two BOOT_CM7 words (+0x24 BOOT7_CURR, +0x28
   *  BOOT7_PRGR) change; RDP/WRP/PCROP are read back and rewritten unchanged so protection can't be
   *  corrupted. Takes effect on the next power-on reset (re-plug). */
  private async setBootAddress0(addr: number): Promise<boolean> {
    const OB_BASE = 0x5200201c;    // DfuSe "@Option Bytes /0x5200201C/..." base (STM32H7)
    const OB_LEN = 128;
    const BOOT_OFF = 0x24;         // FLASH_BOOT7_CURR in the option window; BOOT7_PRGR at +0x28
    const add0 = (addr >>> 16) & 0xffff; // BOOT_CM7_ADD0 = addr[31:16] (0x08000000 -> 0x0800)
    await this.dev.selectAlternateInterface(this.iface, 1); // @Option Bytes
    try {
      await this.abortToIdle();
      // read the current 128-byte option block
      await this.dfuseCmd(0x21, OB_BASE);
      await this.abortToIdle();
      const blk = new Uint8Array(await this.upload(2, OB_LEN)); // fresh ArrayBuffer-backed copy
      const rd = (o: number) => (blk[o] | (blk[o + 1] << 8) | (blk[o + 2] << 16) | (blk[o + 3] << 24)) >>> 0;
      const wr = (o: number, v: number) => { blk[o] = v & 0xff; blk[o + 1] = (v >>> 8) & 0xff; blk[o + 2] = (v >>> 16) & 0xff; blk[o + 3] = (v >>> 24) & 0xff; };
      const cur = rd(BOOT_OFF);
      if ((cur & 0xffff) === add0) return false; // BOOT_ADD0 already points at the app — nothing to fix
      const nv = ((cur & 0xffff0000) | add0) >>> 0; // keep BOOT_ADD1 (high 16), set BOOT_ADD0
      wr(BOOT_OFF, nv); wr(BOOT_OFF + 4, nv);
      // write the whole block back — the ROM programs the option bytes on the transfer
      await this.abortToIdle();
      await this.dfuseCmd(0x21, OB_BASE);
      await this.abortToIdle();
      await this.dnload(2, blk);
      await this.pollIdle();
      return true;
    } finally {
      try { await this.dev.selectAlternateInterface(this.iface, 0); } catch { /* ignore */ } // back to @Internal Flash
    }
  }

  /** Read the whole image back and compare to what we wrote (mirrors flash_dfu.py do_verify).
   *  The DfuSe UPLOAD block stride equals the device wTransferSize (H7 ROM = 1024, F4/F7 = 2048),
   *  so the read chunk MUST match it — the block number (wValue) alone selects the address
   *  (addr = pointer + (blk-2)*wTransferSize). Set the read pointer once per segment, ABORT to
   *  dfuIDLE, then read sequential blocks. */
  private async verify(hex: ParsedHex, progress: Progress) {
    const XFER = this.flashInfo().family === 'H7' ? 1024 : 2048;
    let done = 0;
    for (const seg of hex.segments) {
      await this.abortToIdle();
      await this.dfuseCmd(0x21, seg.address); // set DfuSe read pointer to the segment base
      await this.abortToIdle();               // dfuIDLE before UPLOAD
      let blk = 2;
      for (let off = 0; off < seg.data.length; off += XFER) {
        const n = Math.min(XFER, seg.data.length - off);
        const rd = await this.upload(blk, n);
        for (let k = 0; k < n; k++) {
          if (rd[k] !== seg.data[off + k]) {
            throw new DfuError(
              `Verify mismatch @0x${(seg.address + off + k).toString(16)} — wrote 0x${seg.data[off + k].toString(16)}, read 0x${(((rd[k] ?? 0)) >>> 0).toString(16)}. Flash failed; re-flash before booting.`);
          }
        }
        blk++; done += n;
        progress(done, hex.totalBytes);
        // Yield to the event loop periodically so the ~2000 read-back transfers don't
        // saturate WinUSB / starve rendering → Chrome "page unresponsive" dialog.
        if ((blk & 31) === 0) await sleep(1);
      }
    }
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
