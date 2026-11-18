// ESC 펌웨어 파일 다루기(화면 없음) — 원본 ESCUpdate.ProcessHexData · UpdatePreview · ESCFirmwareFileManager 목록 읽기
// hex 글자를 주소별 바이트로 펼친 뒤 128 바이트 조각으로 자른다(빈 곳은 0xFF).

export const BLOCK = 128;
const MAX_BLOCKS = 4096; // 512 KB — 원본에는 없던 안전 한도(주소가 0x08000000 같은 파일이면 원본은 멈출 만큼 메모리를 썼다)

/**
 * 원본 ProcessHexData 그대로: ':' 로 시작하는 줄만, 0x00 데이터 · 0x02 세그먼트(<<4) · 0x04 선형(<<16), 나머지 무시.
 * 반환 { blocks: Uint8Array[], totalBlocks, totalBytes } — 글자가 hex 가 아니거나 너무 크면 예외.
 */
export function parseHex(bytes) {
  const text = Array.from(bytes, (b) => (b < 128 ? String.fromCharCode(b) : "?")).join(""); // Encoding.ASCII
  const hex = (s) => {
    if (!/^[0-9a-fA-F]+$/.test(s)) throw new Error("hex 아님: " + s); // Convert.ToInt32(s, 16) 예외
    return parseInt(s, 16);
  };
  const mem = new Map();
  let maxAddress = 0, segmentBase = 0, linearBase = 0;
  for (const raw of text.split(/[\n\r]+/)) {
    if (!raw.startsWith(":")) continue;
    const line = raw.trim();
    const count = hex(line.substr(1, 2)), address = hex(line.substr(3, 4)), type = hex(line.substr(7, 2));
    if (type === 0x00) {
      for (let i = 0; i < count; i++) {
        const abs = segmentBase + linearBase + address + i;
        mem.set(abs, hex(line.substr(9 + i * 2, 2)));
        if (abs > maxAddress) maxAddress = abs;
      }
    } else if (type === 0x02) segmentBase = hex(line.substr(9, 4)) << 4;
    else if (type === 0x04) linearBase = hex(line.substr(9, 4)) << 16;
  }
  const totalBlocks = Math.floor((maxAddress + 1 + 127) / BLOCK);
  if (totalBlocks > MAX_BLOCKS) throw new Error(`너무 큰 주소(0x${maxAddress.toString(16)}) — ESC 펌웨어가 아님`);
  const lastLen = (maxAddress % BLOCK) + 1;
  const totalBytes = totalBlocks > 0 ? (totalBlocks - 1) * BLOCK + lastLen : 0;
  const blocks = [];
  for (let b = 0; b < totalBlocks; b++) {
    const blk = new Uint8Array(BLOCK).fill(0xff);
    for (let i = 0; i < BLOCK; i++) { const v = mem.get(b * BLOCK + i); if (v !== undefined) blk[i] = v; }
    blocks.push(blk);
  }
  return { blocks, totalBlocks, totalBytes };
}

/** 원본 UpdatePreview: 16 바이트씩 "주소: XX XX …  글자" 8줄 */
export function previewText(blocks, index) {
  const blk = blocks[index];
  if (!blk) return ""; // 원본은 마지막 조각을 보낸 뒤 여기서 범위 밖 예외가 났다
  const h2 = (v) => v.toString(16).toUpperCase().padStart(2, "0");
  let out = "";
  for (let row = 0; row < BLOCK; row += 16) {
    const r = blk.subarray(row, row + 16);
    out += (index * BLOCK + row).toString(16).toUpperCase().padStart(8, "0") + ": "
      + Array.from(r, (v) => h2(v) + " ").join("") + " "
      + Array.from(r, (v) => (v >= 32 && v <= 126 ? String.fromCharCode(v) : ".")).join("") + "\n";
  }
  return out;
}
