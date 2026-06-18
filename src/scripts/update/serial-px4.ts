// ArduPilot / PX4 bootloader over Web Serial — the "Firmware Update" engine.
// Updates the application only (bootloader preserved); no BOOT0, standard USB
// CDC serial (no Zadig). Protocol = PX4 serial bootloader (sync/erase/prog/crc/reboot).
//
// Verified on real hardware against the CLI twin (serial_update.py): the PX4 CRC, the
// MAVLink reboot-to-bootloader frame, and the post-reboot re-enumeration (the bootloader
// comes back on the SAME USB VID/PID/serial, so the browser reopens it without a re-pick).
// ⚠ CRITICAL ORDER: a freshly-entered bootloader REJECTS CHIP_ERASE with INVALID (0x13)
// until the device-info handshake — specifically GET_DEVICE INFO_BL_REV — has completed.
// Proven: erase WITHOUT BL_REV stayed INVALID through +3.5s of retries; WITH BL_REV it
// succeeded at +1.37s. So identify() MUST query INFO_BL_REV before erase().

import type { Log, Progress } from './dfu';

const P = {
  INSYNC: 0x12, EOC: 0x20, OK: 0x10, FAILED: 0x11, INVALID: 0x13,
  GET_SYNC: 0x21, GET_DEVICE: 0x22, CHIP_ERASE: 0x23, PROG_MULTI: 0x27,
  GET_CRC: 0x29, REBOOT: 0x30,
  INFO_BL_REV: 1, INFO_BOARD_ID: 2, INFO_FLASH_SIZE: 4,
  PROG_MULTI_MAX: 252,
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// MAVLink1 COMMAND_LONG: MAV_CMD_PREFLIGHT_REBOOT_SHUTDOWN(246) param1=3 (reboot to
// bootloader), target_system=1. Exact frame captured from pymavlink — proven on hardware.
const REBOOT_BL_MAVLINK = new Uint8Array([
  0xfe, 0x21, 0x00, 0xff, 0x00, 0x4c,                          // STX,len=33,seq,sys=255,comp,msgid=76
  0x00, 0x00, 0x40, 0x40,                                      // param1 = 3.0
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // param2..7
  0xf6, 0x00, 0x01, 0x00, 0x00,                                // cmd=246, tsys=1, tcomp=0, conf=0
  0x26, 0xd2,                                                  // X.25 checksum
]);

// PX4 bootloader CRC-32: poly 0xedb88320, init=0, NO final XOR. Verified against the device
// on real hardware (zlib's init 0xFFFFFFFF + final XOR mismatches).
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes: Uint8Array, crc = 0): number {
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return crc >>> 0;
}

class SerialIO {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  private buf: number[] = [];
  private closed = false;
  constructor(private port: SerialPort) {
    this.reader = port.readable!.getReader();
    this.writer = port.writable!.getWriter();
    this.pump(); // continuous background read so no bytes are lost across timeouts
  }
  private async pump() {
    try {
      for (;;) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) for (let i = 0; i < value.length; i++) this.buf.push(value[i]);
      }
    } catch { /* cancelled / disconnected */ }
    this.closed = true;
  }
  /** Discard any buffered RX bytes — mirrors pyserial reset_input_buffer() before a sync,
   *  so a stray/duplicate response can never desync the next command. */
  drain() { this.buf.length = 0; }
  async write(bytes: Uint8Array) { await this.writer.write(bytes); }
  async read(n: number, timeoutMs: number): Promise<Uint8Array> {
    const deadline = Date.now() + timeoutMs;
    while (this.buf.length < n) {
      if (this.closed) throw new Error('Serial port closed');
      if (Date.now() > deadline) throw new Error('Serial response timeout');
      await sleep(4);
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
  private blRev = 0;
  private constructor(private port: SerialPort) { this.io = new SerialIO(port); }

  static available(): boolean {
    return typeof navigator !== 'undefined' && !!(navigator as any).serial;
  }

  static async connect(baudRate = 115200): Promise<Px4Updater> {
    if (!Px4Updater.available()) throw new Error('This browser does not support Web Serial (desktop Chrome/Edge required).');
    // An already-authorized port can be opened with no picker — try that first so a single
    // Connect click connects instantly (no dialog). Fall back to the picker otherwise.
    try {
      const granted = await (navigator as any).serial.getPorts();
      if (granted.length) { await granted[0].open({ baudRate }); return new Px4Updater(granted[0]); }
    } catch { /* not openable (already open / gone) — fall through to picker */ }
    const filters: any[] = []; // Optional VID/PID filter narrows the picker once novaX IDs are known.
    const port = await (navigator as any).serial.requestPort(filters.length ? { filters } : undefined);
    await port.open({ baudRate });
    return new Px4Updater(port);
  }

  /** Is there a port the user has previously authorized? (Does NOT open it — opening
   *  blindly would seize an arbitrary COM port and falsely claim a verified connection.) */
  static async hasGrantedPort(): Promise<boolean> {
    if (!Px4Updater.available()) return false;
    try { return (await (navigator as any).serial.getPorts()).length > 0; } catch { return false; }
  }

  private async getSync(timeoutMs = 1000) {
    const r = await this.io.read(2, timeoutMs);
    if (r[0] !== P.INSYNC || r[1] !== P.OK) throw new Error(`sync failed (0x${r[0].toString(16)} 0x${r[1].toString(16)})`);
  }
  private async cmd(bytes: number[], timeoutMs = 1000) {
    await this.io.write(new Uint8Array(bytes));
    await this.getSync(timeoutMs);
  }

  /** Poll GET_SYNC until the bootloader answers (user may need to power-cycle). */
  async waitForBootloader(log: Log, totalMs = 8000) {
    const end = Date.now() + totalMs;
    log('Waiting for bootloader … (power-cycle the board if needed)');
    while (Date.now() < end) {
      this.io.drain(); // clear stale bytes before each sync attempt (CLI reset_input_buffer parity)
      try { await this.cmd([P.GET_SYNC, P.EOC], 400); log('Bootloader sync OK'); return; }
      catch { await sleep(200); }
    }
    throw new Error('No bootloader response — power-cycle the board and retry.');
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
    // INFO_BL_REV is REQUIRED before erase: a fresh bootloader rejects CHIP_ERASE with
    // INVALID until this device-info handshake completes (verified on hardware).
    this.blRev = await this.getInfo(P.INFO_BL_REV);
    log(`Board ID ${this.boardId}, flash ${(this.flashSize / 1024) | 0} KB, BL rev ${this.blRev}`);
  }

  async erase(log: Log) {
    log('Erase app region … (takes a few seconds)');
    try {
      await this.cmd([P.CHIP_ERASE, P.EOC], 20000);
    } catch (e) {
      // Defense-in-depth: if the bootloader still rejects erase (INVALID), redo the
      // device-info handshake (re-queries INFO_BL_REV) and retry once.
      log('Erase rejected — retrying handshake …');
      await this.identify(log);
      await this.cmd([P.CHIP_ERASE, P.EOC], 20000);
    }
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
    if (!this.flashSize) { log('flash size unknown — skipping CRC verify'); return true; }
    const full = new Uint8Array(this.flashSize).fill(0xff);
    full.set(programmed.subarray(0, Math.min(programmed.length, this.flashSize)));
    const local = crc32(full);
    await this.io.write(new Uint8Array([P.GET_CRC, P.EOC]));
    const v = await this.io.read(4, 5000);
    await this.getSync();
    const dev = (v[0] | (v[1] << 8) | (v[2] << 16) | (v[3] << 24)) >>> 0;
    const ok = dev === local;
    log(ok ? `CRC verify OK (0x${dev.toString(16)})` : `CRC mismatch: device 0x${dev.toString(16)} vs local 0x${local.toString(16)}`);
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

  /** Quick check: is the device already in the PX4 bootloader (responds to GET_SYNC)? */
  private async trySync(): Promise<boolean> {
    this.io.drain(); // clear any stale bytes first (mirrors CLI reset_input_buffer)
    try { await this.cmd([P.GET_SYNC, P.EOC], 500); return true; } catch { return false; }
  }

  /** Reboot the running ArduPilot app into its bootloader via a MAVLink reboot command. */
  private async rebootToBootloader(log: Log) {
    log('App mode → rebooting to bootloader (MAVLink REBOOT_SHUTDOWN) …');
    try { await this.io.write(REBOOT_BL_MAVLINK); } catch { /* port may drop immediately */ }
    await sleep(500);
  }

  /** After the device resets, re-acquire the bootloader port. The bootloader may
   *  re-enumerate as the SAME USB device (same SerialPort re-opens) OR a DIFFERENT one
   *  (a separate granted port). Mirrors the CLI find_bl: try the same port, then any other
   *  already-granted port, retrying until one opens AND answers GET_SYNC. */
  private async reacquire(log: Log, baudRate = 115200) {
    await this.io.release();
    try { await this.port.close(); } catch { /**/ }
    log('Waiting for port to re-enumerate …');
    // The ArduPilot bootloader's serial window is SHORT (a few seconds) before it jumps
    // back to the app, so re-grab as fast as possible: a 'connect' event fires the instant
    // the device re-enumerates; also poll tightly (120ms) as a fallback.
    let appeared: SerialPort | null = null;
    const onConnect = (e: any) => { appeared = appeared || e.target || e.port || null; };
    try { (navigator as any).serial.addEventListener('connect', onConnect); } catch { /**/ }
    const end = Date.now() + 15000;
    try {
      while (Date.now() < end) {
        const candidates: SerialPort[] = [];
        if (appeared) candidates.push(appeared);
        candidates.push(this.port);
        try {
          for (const p of await (navigator as any).serial.getPorts()) if (!candidates.includes(p)) candidates.push(p);
        } catch { /* getPorts unavailable */ }
        for (const p of candidates) {
          try {
            await p.open({ baudRate });
            this.port = p; this.io = new SerialIO(p);
            if (await this.trySync()) { log('Bootloader reconnected OK'); return; }
            await this.io.release(); try { await p.close(); } catch { /**/ }
          } catch { /* not ready / wrong port */ }
        }
        await sleep(120);
      }
    } finally {
      try { (navigator as any).serial.removeEventListener('connect', onConnect); } catch { /**/ }
    }
    throw new Error('Missed the brief bootloader window — click Connect again to select the bootloader, or use DFU Recovery / CLI tools/serial_update.py.');
  }

  /** Full flow: reboot→bootloader if needed → identify → GUARD (capacity + board_id) → erase →
   *  program → verify → reboot. The guards run BEFORE erase so a wrong/oversized image is rejected
   *  without wiping the board (it reboots back into the still-intact app). */
  async flash(image: Uint8Array, log: Log, progress: Progress, expectedBoardId?: number) {
    if (await this.trySync()) {
      log('Already in bootloader mode');
    } else {
      await this.rebootToBootloader(log);
      await this.reacquire(log);
      await this.waitForBootloader(log);
    }
    await this.identify(log);
    // ---- Compatibility guards — MUST run BEFORE erase, or a wrong pick wipes the board ----
    // board_id is the ArduPilot-native discriminator, so it's the PRIMARY check; the capacity
    // check is only a fallback for a .bin (which carries no board_id).
    if (expectedBoardId && this.boardId !== expectedBoardId) {
      await this.reboot(log); // leave bootloader → boot the still-intact app
      throw new Error(`Wrong firmware — flash aborted, nothing erased. This firmware is for board ID ${expectedBoardId}, but the connected board is ID ${this.boardId}. Select the firmware that matches this board.`);
    }
    if (this.flashSize && image.length > this.flashSize) {
      await this.reboot(log); // leave bootloader → boot the still-intact app
      throw new Error(`Image too large — flash aborted, nothing erased. Firmware is ${(image.length / 1024) | 0} KB but this chip has only ${(this.flashSize / 1024) | 0} KB flash. Wrong firmware for this board.`);
    }
    await this.erase(log);
    const programmed = await this.program(image, log, progress);
    if (!(await this.verify(programmed, log))) throw new Error('CRC verify failed — flash mismatch');
    await this.reboot(log);
  }
}
