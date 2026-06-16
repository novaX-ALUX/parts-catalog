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

export function parseIntelHex(text: string): ParsedHex {
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
  }
  if (raw.length === 0) throw new Error('No data records found in HEX file');

  // sort + merge contiguous runs
  raw.sort((a, b) => a.address - b.address);
  const segments: HexSegment[] = [];
  for (const seg of raw) {
    const last = segments[segments.length - 1];
    if (last && seg.address === last.address + last.data.length) {
      const merged = new Uint8Array(last.data.length + seg.data.length);
      merged.set(last.data, 0);
      merged.set(seg.data, last.data.length);
      last.data = merged;
    } else {
      segments.push({ address: seg.address, data: new Uint8Array(seg.data) });
    }
  }
  const minAddress = segments[0].address;
  const lastSeg = segments[segments.length - 1];
  const maxAddress = lastSeg.address + lastSeg.data.length;
  const totalBytes = segments.reduce((n, s) => n + s.data.length, 0);
  return { segments, minAddress, maxAddress, totalBytes };
}
