// ArduPilot / PX4 bootloader over Web Serial — the "Firmware Update" engine.
// Updates the application only (bootloader preserved); no BOOT0, standard USB
// CDC serial (no Zadig). Protocol = PX4 serial bootloader (sync/erase/prog/crc/reboot).
//
// ⚠ BETA: implemented to the documented PX4 protocol. The reboot-to-bootloader
// trigger and CRC-verify need verification on real hardware before relied upon.

import type { Log, Progress } from './dfu';

const P = {
  INSYNC: 0x12, EOC: 0x20, OK: 0x10, FAILED: 0x11, INVALID: 0x13,
  GET_SYNC: 0x21, GET_DEVICE: 0x22, CHIP_ERASE: 0x23, PROG_MULTI: 0x27,
  GET_CRC: 0x29, REBOOT: 0x30,
  INFO_BOARD_ID: 2, INFO_FLASH_SIZE: 4,
  PROG_MULTI_MAX: 252,
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// standard CRC-32 (zlib/PX4), used to verify the programmed image.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes: Uint8Array, crc = 0xffffffff): number {
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return crc >>> 0;
}

class SerialIO {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  private buf: number[] = [];
  constructor(private port: SerialPort) {
    this.reader = port.readable!.getReader();
    this.writer = port.writable!.getWriter();
  }
  async write(bytes: Uint8Array) { await this.writer.write(bytes); }
  async read(n: number, timeoutMs: number): Promise<Uint8Array> {
    const deadline = Date.now() + timeoutMs;
    while (this.buf.length < n) {
      if (Date.now() > deadline) throw new Error('시리얼 응답 타임아웃');
      const { value, done } = await Promise.race([
        this.reader.read(),
        sleep(Math.max(1, deadline - Date.now())).then(() => ({ value: undefined, done: false } as any)),
      ]);
      if (done) throw new Error('시리얼 포트가 닫혔습니다');
      if (value) for (const b of value) this.buf.push(b);
    }
    return new Uint8Array(this.buf.splice(0, n));
  }
  async release() {
    try { await this.reader.cancel(); this.reader.releaseLock(); } catch { /**/ }
    try { await this.writer.close(); this.writer.releaseLock(); } catch { /**/ }
  }
}

export class Px4Updater {
  private io: SerialIO;
  private boardId = 0;
  private flashSize = 0;
  private constructor(private port: SerialPort) { this.io = new SerialIO(port); }

  static available(): boolean {
    return typeof navigator !== 'undefined' && !!(navigator as any).serial;
  }

  static async connect(baudRate = 115200): Promise<Px4Updater> {
    if (!Px4Updater.available()) throw new Error('이 브라우저는 Web Serial을 지원하지 않습니다 (Chrome/Edge 데스크탑 필요).');
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate });
    return new Px4Updater(port);
  }

  private async getSync(timeoutMs = 1000) {
    const r = await this.io.read(2, timeoutMs);
    if (r[0] !== P.INSYNC || r[1] !== P.OK) throw new Error(`sync 실패 (0x${r[0].toString(16)} 0x${r[1].toString(16)})`);
  }
  private async cmd(bytes: number[], timeoutMs = 1000) {
    await this.io.write(new Uint8Array(bytes));
    await this.getSync(timeoutMs);
  }

  /** Poll GET_SYNC until the bootloader answers (user may need to power-cycle). */
  async waitForBootloader(log: Log, totalMs = 8000) {
    const end = Date.now() + totalMs;
    log('부트로더 대기 중 … (필요 시 보드 전원 재인가)');
    while (Date.now() < end) {
      try { await this.cmd([P.GET_SYNC, P.EOC], 400); log('부트로더 sync OK'); return; }
      catch { await sleep(200); }
    }
    throw new Error('부트로더 응답 없음 — 전원 재인가 후 다시 시도하세요.');
  }

  private async getInfo(param: number): Promise<number> {
    await this.io.write(new Uint8Array([P.GET_DEVICE, param, P.EOC]));
    const v = await this.io.read(4, 1000);
    await this.getSync();
    return (v[0] | (v[1] << 8) | (v[2] << 16) | (v[3] << 24)) >>> 0;
  }

  async identify(log: Log) {
    this.boardId = await this.getInfo(P.INFO_BOARD_ID);
    this.flashSize = await this.getInfo(P.INFO_FLASH_SIZE);
    log(`Board ID ${this.boardId}, flash ${(this.flashSize / 1024) | 0} KB`);
  }

  async erase(log: Log) {
    log('Erase app region … (수 초 소요)');
    await this.cmd([P.CHIP_ERASE, P.EOC], 20000);
    log('Erase done.');
  }

  async program(image: Uint8Array, log: Log, progress: Progress) {
    // pad to multiple of 4
    const padded = image.length % 4 ? (() => { const p = new Uint8Array(image.length + (4 - (image.length % 4))); p.set(image); p.fill(0xff, image.length); return p; })() : image;
    for (let off = 0; off < padded.length; off += P.PROG_MULTI_MAX) {
      const chunk = padded.subarray(off, Math.min(off + P.PROG_MULTI_MAX, padded.length));
      await this.cmd([P.PROG_MULTI, chunk.length, ...chunk, P.EOC], 2000);
      progress(off + chunk.length, padded.length);
    }
    log('Program complete.');
    return padded;
  }

  /** Verify via device CRC over the whole app flash padded with 0xFF. Returns match. */
  async verify(programmed: Uint8Array, log: Log): Promise<boolean> {
    if (!this.flashSize) { log('flash size 미상 — CRC 검증 건너뜀'); return true; }
    const full = new Uint8Array(this.flashSize).fill(0xff);
    full.set(programmed.subarray(0, Math.min(programmed.length, this.flashSize)));
    const local = crc32(full);
    await this.io.write(new Uint8Array([P.GET_CRC, P.EOC]));
    const v = await this.io.read(4, 5000);
    await this.getSync();
    const dev = (v[0] | (v[1] << 8) | (v[2] << 16) | (v[3] << 24)) >>> 0;
    const ok = dev === local;
    log(ok ? `CRC 검증 OK (0x${dev.toString(16)})` : `CRC 불일치: device 0x${dev.toString(16)} vs local 0x${local.toString(16)}`);
    return ok;
  }

  async reboot(log: Log) {
    log('Boot new app …');
    try { await this.io.write(new Uint8Array([P.REBOOT, P.EOC])); } catch { /**/ }
  }

  async close() {
    await this.io.release();
    try { await this.port.close(); } catch { /**/ }
  }

  /** Full flow: wait → identify → erase → program → verify → reboot. */
  async flash(image: Uint8Array, log: Log, progress: Progress) {
    await this.waitForBootloader(log);
    await this.identify(log);
    await this.erase(log);
    const programmed = await this.program(image, log, progress);
    await this.verify(programmed, log);
    await this.reboot(log);
  }
}
