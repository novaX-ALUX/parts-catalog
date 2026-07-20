// Minimal Intel HEX parser → absolute-addressed binary segments.
// Supports record types 00 (data), 01 (EOF), 02/04 (segment/linear address),
// 03/05 (start address, ignored). Used by the DFU engine to flash *_with_bl.hex.

export interface HexSegment { address: number; data: Uint8Array; }
export interface ParsedHex {
  segments: HexSegment[]; // merged, sorted, gap-free runs
  minAddress: number;
  maxAddress: number;    // exclusive end of the highest segment
  totalBytes: number;
}

function hb(s: string, i: number): number {
  return parseInt(s.substr(i, 2), 16);
}

export async function parseIntelHex(text: string): Promise<ParsedHex> {
  const raw: HexSegment[] = [];
  let upper = 0; // upper 16 bits from type 04 (linear) — type 02 is <<4
  const lines = text.split(/\r?\n/);
  for (let ln = 0; ln < lines.length; ln++) {
    const line = lines[ln].trim();
    if (!line || line[0] !== ':') continue;
    const len = hb(line, 1);
    const offset = (hb(line, 3) << 8) | hb(line, 5);
    const type = hb(line, 7);
    // checksum validation
    let sum = 0;
    for (let i = 1; i < 9 + len * 2; i += 2) sum = (sum + hb(line, i)) & 0xff;
    if (((sum + hb(line, 9 + len * 2)) & 0xff) !== 0) {
      throw new Error(`Intel HEX checksum error at line ${ln + 1}`);
    }
    if (type === 0x00) {
      const data = new Uint8Array(len);
      for (let i = 0; i < len; i++) data[i] = hb(line, 9 + i * 2);
      raw.push({ address: (upper + offset) >>> 0, data });
    } else if (type === 0x01) {
      break; // EOF
    } else if (type === 0x04) {
      upper = ((hb(line, 9) << 8) | hb(line, 11)) * 0x10000;
    } else if (type === 0x02) {
      upper = ((hb(line, 9) << 8) | hb(line, 11)) * 16;
    }
    // 0x03 / 0x05 (start address) intentionally ignored
    // Yield every ~16k lines so a multi-MB hex (H7 _with_bl.hex ≈ 5 MB text / 130k records)
    // doesn't stall the main thread → Chrome "page unresponsive (Wait / Exit)" dialog.
    if ((ln & 0x3fff) === 0) await new Promise((r) => setTimeout(r, 0));
  }
  if (raw.length === 0) throw new Error('No data records found in HEX file');

  // sort, then merge contiguous runs in O(n). The old per-record grow-and-copy
  // (new Uint8Array(last+seg); set(last); set(seg)) recopied the whole accumulated run on
  // EVERY record → O(n²): ~130k contiguous 16 B records = tens of GB copied = a multi-second
  // to minute main-thread freeze = the "page unresponsive" dialog. Here each byte is copied
  // exactly once: collect a run's member arrays, allocate its buffer once, then blit them in.
  raw.sort((a, b) => a.address - b.address);
  const segments: HexSegment[] = [];
  let members: Uint8Array[] = [];
  let runAddr = raw[0].address;
  let runLen = 0;
  let expect = raw[0].address;
  const flush = () => {
    if (!members.length) return;
    const buf = new Uint8Array(runLen);
    let o = 0;
    for (const m of members) { buf.set(m, o); o += m.length; }
    segments.push({ address: runAddr, data: buf });
  };
  for (const seg of raw) {
    if (seg.address === expect) {
      members.push(seg.data); runLen += seg.data.length; expect += seg.data.length;
    } else {
      flush();
      runAddr = seg.address; members = [seg.data]; runLen = seg.data.length; expect = seg.address + seg.data.length;
    }
  }
  flush();
  const minAddress = segments[0].address;
  const lastSeg = segments[segments.length - 1];
  const maxAddress = lastSeg.address + lastSeg.data.length;
  const totalBytes = segments.reduce((n, s) => n + s.data.length, 0);
  return { segments, minAddress, maxAddress, totalBytes };
}
