// ArduPilot .apj parser. An .apj is JSON: { board_id, image_size, image }
// where `image` is base64( gzip( raw app binary ) ). Returns the raw app bytes
// to feed the PX4 bootloader. A plain .bin is returned as-is.

export interface AppImage { boardId?: number; bytes: Uint8Array; }

async function gunzip(data: Uint8Array): Promise<Uint8Array> {
  // Browser-native gzip inflate (Chrome/Edge desktop).
  const ds = new (globalThis as any).DecompressionStream('gzip');
  const stream = new Blob([data]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function parseApj(text: string): Promise<AppImage> {
  const j = JSON.parse(text);
  if (typeof j.image !== 'string') throw new Error('.apj 형식 오류: image 필드 없음');
  const compressed = Uint8Array.from(atob(j.image), (c) => c.charCodeAt(0));
  const bytes = await gunzip(compressed);
  return { boardId: j.board_id, bytes };
}

export function parseBin(buf: ArrayBuffer): AppImage {
  return { bytes: new Uint8Array(buf) };
}
