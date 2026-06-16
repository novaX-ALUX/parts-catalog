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
const XFER = 1024; // safe chunk; STM32 bootloader accepts >= this
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Log = (msg: string) => void;
export type Progress = (done: number, total: number) => void;

interface Sector { start: number; size: number; }

export class DfuError extends Error {}

export class STM32Dfu {
  private dev: USBDevice;
  private iface = 0;
  private sectors: Sector[] = [];

  private constructor(dev: USBDevice) { this.dev = dev; }

  static available(): boolean {
    return typeof navigator !== 'undefined' && !!(navigator as any).usb;
  }

  /** Prompt the browser device picker and open the DFU interface. */
  static async connect(): Promise<STM32Dfu> {
    if (!STM32Dfu.available()) throw new DfuError('이 브라우저는 WebUSB를 지원하지 않습니다 (Chrome/Edge 데스크탑 필요).');
    const dev = await (navigator as any).usb.requestDevice({ filters: [{ vendorId: STM_VID, productId: STM_PID }] });
    const self = new STM32Dfu(dev);
    await dev.open();
    if (dev.configuration === null) await dev.selectConfiguration(1);
    // DFU is interface 0; alt 0 = "Internal Flash"
    const cfg = dev.configuration!;
    const ifc = cfg.interfaces.find((i) => i.alternates.some((a) => a.interfaceClass === 0xfe)) || cfg.interfaces[0];
    self.iface = ifc.interfaceNumber;
    await dev.claimInterface(self.iface);
    await dev.selectAlternateInterface(self.iface, 0);
    self.sectors = parseMemoryLayout(ifc.alternates[0].interfaceName || '');
    await self.clearIfError();
    return self;
  }

  deviceLabel(): string {
    return `${this.dev.manufacturerName ?? 'STM32'} ${this.dev.productName ?? 'BOOTLOADER'} (0483:DF11)`;
  }

  private async dnload(wValue: number, data?: BufferSource) {
    const r = await this.dev.controlTransferOut(
      { requestType: 'class', recipient: 'interface', request: DNLOAD, value: wValue, index: this.iface },
      data as any
    );
    if (r.status !== 'ok') throw new DfuError(`DNLOAD 실패: ${r.status}`);
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

  /** DfuSe special command (Set Address 0x21 / Erase page 0x41). */
  private async dfuseCmd(cmd: number, addr?: number) {
    const payload = addr === undefined
      ? new Uint8Array([cmd])
      : new Uint8Array([cmd, addr & 0xff, (addr >>> 8) & 0xff, (addr >>> 16) & 0xff, (addr >>> 24) & 0xff]);
    await this.dnload(0, payload);
    let st = await this.getStatus();        // -> dfuDNBUSY, with poll timeout
    await sleep(st.poll);
    st = await this.getStatus();            // -> dfuDNLOAD_IDLE
    if (st.status !== 0) throw new DfuError(`DfuSe 명령 실패 (cmd 0x${cmd.toString(16)}, status ${st.status})`);
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
    const eraseStarts = this.sectorsInRange(hex.minAddress, hex.maxAddress);
    log(`Erase ${eraseStarts.length} sector(s) over 0x${hex.minAddress.toString(16)}–0x${hex.maxAddress.toString(16)} …`);
    for (const s of eraseStarts) await this.dfuseCmd(0x41, s);
    log('Erase done.');

    let written = 0;
    for (const seg of hex.segments) {
      await this.dfuseCmd(0x21, seg.address); // set address pointer
      let block = 2;
      for (let off = 0; off < seg.data.length; off += XFER) {
        const chunk = seg.data.subarray(off, Math.min(off + XFER, seg.data.length));
        await this.dnload(block, chunk);
        let st = await this.getStatus();
        await sleep(st.poll);
        st = await this.getStatus();
        if (st.status !== 0) throw new DfuError(`쓰기 실패 @0x${(seg.address + off).toString(16)} (status ${st.status})`);
        block++;
        written += chunk.length;
        progress(written, hex.totalBytes);
      }
    }
    log('Program complete. Leaving DFU …');
    await this.leave(hex.minAddress);
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
