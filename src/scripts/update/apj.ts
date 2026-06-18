// ArduPilot .apj parser. An .apj is JSON: { board_id, image_size, image }
// where `image` is base64( gzip( raw app binary ) ). Returns the raw app bytes
// to feed the PX4 bootloader. A plain .bin is returned as-is.

export interface AppImage { boardId?: number; bytes: Uint8Array; }

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  // ArduPilot .apj compresses the image with zlib (RFC 1950, magic 0x78). The browser's
  // DecompressionStream calls that 'deflate'; gzip (magic 0x1f 0x8b) is 'gzip'. Pick by magic.
  const fmt = data[0] === 0x1f && data[1] === 0x8b ? 'gzip' : 'deflate';
  const ds = new (globalThis as any).DecompressionStream(fmt);
  const stream = new Blob([data]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function parseApj(text: string): Promise<AppImage> {
  const j = JSON.parse(text);
  if (typeof j.image !== 'string') throw new Error('.apj format error: missing image field');
  const compressed = Uint8Array.from(atob(j.image), (c) => c.charCodeAt(0));
  const bytes = await inflate(compressed);
  return { boardId: j.board_id, bytes };
}

export function parseBin(buf: ArrayBuffer): AppImage {
  return { bytes: new Uint8Array(buf) };
}
