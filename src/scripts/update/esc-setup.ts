// ESC Setup handheld (ESC-Setup-Portable, USB 1209:0001) over Web Serial — the "🎛 ESC Setup" tab.
// The device speaks a line protocol on its USB test port (firmware/core/testport.c in esc/ESC-Setup-Portable):
// every answer ends with "ok" or "err <why>".
//   ver                                   -> "ver 0.0.20"
//   img info                              -> "img stored <size> B  product AE14S  version 1.63  name …" | "img none"
//   img begin <size> <name> · img <off> <hex> · img end     store an ESC motor-chip file in the device flash
//   dev begin <size> <crc32> · dev <off> <hex> · dev end · dev apply   replace the device's own firmware
// No driver: it is a plain USB CDC serial port. Chrome / Edge desktop.

const VID = 0x1209, PID = 0x0001, CHUNK = 128;
export type Log = (m: string, cls?: string) => void;
export type Progress = (done: number, total: number) => void;

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let k = 0; k < 8; k++) c = (c & 1) ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

export async function sha256hex(data: Uint8Array): Promise<string> {
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', data)));
}

export class EscSetup {
  private port: any;
  private reader: any = null;
  private writer: any = null;
  private buf = '';
  private closed = false;
  private pending: Promise<any> | null = null;

  private constructor(port: any) { this.port = port; }

  static supported(): boolean { return 'serial' in navigator; }

  /** Connect: a handheld this browser was allowed to use before opens directly (it is the only device with this
   *  VID/PID, so there is no wrong board to grab); the first time, or with several granted, the picker asks. */
  static async request(): Promise<EscSetup> {
    const ports = ((await (navigator as any).serial.getPorts()) as any[])
      .filter((p) => { const i = p.getInfo(); return i.usbVendorId === VID && i.usbProductId === PID; });
    const port = ports.length === 1 ? ports[0]
      : await (navigator as any).serial.requestPort({ filters: [{ usbVendorId: VID, usbProductId: PID }] });
    return EscSetup.open(port);
  }

  /** A device granted before, without a picker (used after the device restarts itself). */
  static async granted(): Promise<any | null> {
    const ports = await (navigator as any).serial.getPorts();
    return ports.find((p: any) => { const i = p.getInfo(); return i.usbVendorId === VID && i.usbProductId === PID; }) ?? null;
  }

  static async open(port: any): Promise<EscSetup> {
    await port.open({ baudRate: 115200 });
    await port.setSignals({ dataTerminalReady: true });   // TinyUSB counts the port as connected only with DTR
    const d = new EscSetup(port);
    d.writer = port.writable.getWriter();
    d.reader = port.readable.getReader();
    await sleep(150);
    return d;
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    try { await this.reader?.cancel(); } catch { /* gone */ }
    try { this.reader?.releaseLock(); } catch { /* gone */ }
    try { this.writer?.releaseLock(); } catch { /* gone */ }
    try { await this.port.close(); } catch { /* the device may have restarted already */ }
  }

  /** One command; resolves with the lines before "ok", rejects on "err …" or timeout. */
  async cmd(line: string, timeoutMs = 5000): Promise<string[]> {
    await this.writer.write(new TextEncoder().encode(line + '\n'));
    const out: string[] = [];
    const t0 = performance.now();
    for (;;) {
      let nl: number;
      while ((nl = this.buf.indexOf('\n')) >= 0) {
        const l = this.buf.slice(0, nl).replace(/\r$/, '');
        this.buf = this.buf.slice(nl + 1);
        if (l === 'ok') return out;
        if (l.startsWith('err')) throw new Error(l);
        if (l) out.push(l);
      }
      const left = timeoutMs - (performance.now() - t0);
      if (left <= 0) throw new Error(`no answer to "${line.split(' ').slice(0, 2).join(' ')}"`);
      // one read in flight at a time: a timed-out read is kept and awaited next time, never dropped
      this.pending ??= this.reader.read();
      const r = await Promise.race([this.pending, sleep(left).then(() => ({ timeout: true }))]) as any;
      if (r.timeout) continue;
      this.pending = null;
      if (r.done) throw new Error('the device closed the port');
      this.buf += new TextDecoder().decode(r.value);
    }
  }

  async version(): Promise<string> { return (await this.cmd('ver'))[0]?.replace(/^ver\s+/, '') ?? '?'; }

  /** What file the device keeps now: "AE14S V1.63 (name)" or null */
  async stored(): Promise<string | null> {
    const l = (await this.cmd('img info'))[0] ?? '';
    const m = l.match(/product\s+(\S+)\s+version\s+(\S+)\s+name\s+(\S+)/);
    return m ? `${m[1]} V${m[2]} (${m[3]})` : null;
  }

  /** Store an ESC motor-chip file (make_ota_bin .bin) in the device flash; the device checks it. */
  async storeEscFile(data: Uint8Array, name: string, progress: Progress): Promise<string> {
    await this.cmd(`img begin ${data.length} ${name}`, 8000);          // erases the flash sector first
    for (let off = 0; off < data.length; off += CHUNK) {
      await this.cmd(`img ${off} ${hex(data.subarray(off, off + CHUNK))}`);
      progress(Math.min(off + CHUNK, data.length), data.length);
    }
    return (await this.cmd('img end'))[0] ?? '';
  }

  /** Replace the device's own firmware. Returns after "dev apply"; the device restarts by itself. */
  async updateSelf(data: Uint8Array, progress: Progress): Promise<string> {
    const crc = crc32(data);
    await this.cmd(`dev begin ${data.length} ${crc.toString(16).padStart(8, '0')}`, 8000);
    for (let off = 0; off < data.length; off += CHUNK) {
      await this.cmd(`dev ${off} ${hex(data.subarray(off, off + CHUNK))}`);
      progress(Math.min(off + CHUNK, data.length), data.length);
    }
    const ok = (await this.cmd('dev end'))[0] ?? '';
    try { await this.cmd('dev apply', 3000); } catch { /* the port drops as the device restarts */ }
    await this.close();
    return ok;
  }
}

/** After a self-update: wait for the device to come back on USB and reopen it without a picker. */
export async function reopenAfterRestart(log: Log, tries = 40): Promise<EscSetup | null> {
  for (let i = 0; i < tries; i++) {
    await sleep(500);
    try {
      const p = await EscSetup.granted();
      if (p) return await EscSetup.open(p);
    } catch { /* not back yet */ }
  }
  log('The device did not come back on USB. Re-plug it and press Connect.', 'err');
  return null;
}
