// Read-only release gate: validate the entire catalog, not just a few sample URLs.
import { createHash, createPublicKey, verify } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync, inflateSync } from 'node:zlib';
import yaml from 'js-yaml';
import { parse } from 'parse5';

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

// Windows accepts wrong case; GitHub Pages does not. Check every path component.
export function exactFile(root, name) {
  const parts = decodeURIComponent(name).replace(/^\/+/, '').split('/');
  if (parts.some((p) => !p || p === '.' || p === '..' || /[\\:]/.test(p))) {
    throw new Error(`Unsafe asset path: ${name}`);
  }
  let current = root;
  for (const part of parts) {
    if (!readdirSync(current).includes(part)) throw new Error(`Missing/case-mismatched asset: ${name}`);
    current = path.join(current, part);
  }
  if (!statSync(current).isFile()) throw new Error(`Not a file: ${name}`);
  return current;
}

export function validateHex(text) {
  let eof = false;
  for (const line of text.trim().split(/\r?\n/)) {
    if (eof || !/^:(?:[0-9a-fA-F]{2})+$/.test(line)) throw new Error('Invalid Intel HEX record');
    const bytes = Buffer.from(line.slice(1), 'hex');
    if (bytes.length !== bytes[0] + 5 || bytes.reduce((a, b) => a + b, 0) % 256 !== 0) {
      throw new Error('Intel HEX length/checksum mismatch');
    }
    eof = bytes[3] === 1;
    if (eof && (bytes[0] !== 0 || bytes[1] !== 0 || bytes[2] !== 0)) throw new Error('Invalid Intel HEX EOF');
  }
  if (!eof) throw new Error('Missing Intel HEX EOF');
}

export function validateApj(text) {
  const apj = JSON.parse(text);
  if (!Number.isInteger(apj.board_id) || typeof apj.image !== 'string') throw new Error('Invalid APJ metadata');
  const compressed = Buffer.from(apj.image, 'base64');
  const bytes = compressed[0] === 0x1f && compressed[1] === 0x8b ? gunzipSync(compressed) : inflateSync(compressed);
  if (!bytes.length || bytes.length !== apj.image_size) throw new Error('APJ decompressed size mismatch');
  return { boardId: apj.board_id, bytes };
}

export function validateManifest(manifest, bytes, publicKey, filename) {
  if (manifest.schema !== 'af-f4-t10-fw-integrity/1' || manifest.hash_alg !== 'SHA-256'
      || manifest.sig_alg !== 'Ed25519' || manifest.file !== filename
      || manifest.size !== bytes.length || manifest.sha256 !== sha256(bytes)) {
    throw new Error(`Signature manifest metadata/hash mismatch: ${filename}`);
  }
  if (!verify(null, bytes, publicKey, Buffer.from(manifest.signature, 'base64'))) {
    throw new Error(`Invalid Ed25519 signature: ${filename}`);
  }
}

function filesUnder(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });
}

function* elements(node) {
  if (node.tagName) yield node;
  for (const child of node.childNodes ?? []) yield* elements(child);
  if (node.content) yield* elements(node.content);
}

export async function validateCatalog(root, { remote = false } = {}) {
  const { default: config } = await import(new URL('../astro.config.mjs', import.meta.url));
  const base = config.base.replace(/\/$/, '');
  const origin = new URL(config.site).origin;
  const publicRoot = path.join(root, 'public');
  const distRoot = path.join(root, 'dist');
  const errors = [];
  const checked = new Set();
  const downloads = new Map();
  const expectedRows = new Map();
  const counts = { products: 0, assets: 0, firmware: 0, signatures: 0, pages: 0, links: 0, updaterRows: 0, remote: 0 };
  const check = (label, fn) => { try { return fn(); } catch (error) { errors.push(`${label}: ${error.message}`); } };
  const publicAsset = (name) => {
    if (!name.startsWith('/') || name.startsWith('//')) throw new Error(`Expected site-relative asset: ${name}`);
    const full = exactFile(publicRoot, name);
    const deployed = exactFile(distRoot, name);
    const bytes = readFileSync(full);
    if (sha256(bytes) !== sha256(readFileSync(deployed))) throw new Error(`Built asset differs from public/: ${name}`);
    checked.add(name);
    return bytes;
  };

  for (const file of filesUnder(path.join(root, 'src/content')).filter((f) => f.endsWith('.md'))) {
    check(path.relative(root, file), () => {
      const match = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error('Missing YAML frontmatter');
      const data = yaml.load(match[1]);
      counts.products++;
      const images = [data.image, data.datasheet, data.pinoutImage, ...(data.pinoutImages ?? []),
        ...(data.gallery ?? []), ...(data.configImages ?? []).map((i) => typeof i === 'string' ? i : i.src)].filter(Boolean);
      for (const name of images) check(`${data.name} asset`, () => publicAsset(name));
      for (const fw of data.firmware ?? []) {
        counts.firmware++;
        check(`${data.name} ${fw.kind}`, () => {
          if (Boolean(fw.method) !== Boolean(fw.webPath)) throw new Error('method and webPath must be specified together');
          let bytes;
          if (fw.file.startsWith('/')) bytes = publicAsset(fw.file);
          else if (!/^https:\/\//.test(fw.file)) throw new Error('Download URL must use HTTPS');
          if (bytes && fw.file.endsWith('.hex')) validateHex(bytes.toString());
          if (bytes && fw.file.endsWith('.apj')) validateApj(bytes.toString());
          if (fw.webPath) {
            const mirror = publicAsset(fw.webPath);
            if (bytes && sha256(bytes) !== sha256(mirror)) throw new Error('Download/mirror mismatch');
            bytes = mirror;
            if (fw.webPath.endsWith('.apj')) validateApj(bytes.toString());
            if (fw.webPath.endsWith('.hex')) validateHex(bytes.toString());
            // This existing product is required to stay signed after a move.
            if (path.basename(file) === 'AF-F4-nano-v2.md') publicAsset(fw.webPath + '.aff4t10.json');
            const mcu = data.specs?.find((s) => s.key === 'MCU')?.value ?? '';
            if (/[FH][47]/i.test(mcu)) expectedRows.set(base + fw.webPath, fw);
          }
          if (bytes && fw.sha256 && sha256(bytes) !== fw.sha256.toLowerCase()) throw new Error('Catalog SHA-256 mismatch');
          if (fw.file.startsWith('https://')) {
            const expected = bytes ? sha256(bytes) : fw.sha256;
            if (downloads.has(fw.file) && downloads.get(fw.file) !== expected) throw new Error('Conflicting download hashes');
            downloads.set(fw.file, expected);
          }
        });
      }
    });
  }

  const publicKey = createPublicKey(readFileSync(path.join(root, 'tools/keys/af_f4_t10_fw_public_key.pem')));
  const updaterSource = readFileSync(path.join(root, 'src/pages/update.astro'), 'utf8');
  const embeddedKey = updaterSource.match(/AFF4T10_PUBKEY_SPKI\s*=\s*'([^']+)'/)?.[1];
  if (publicKey.export({ type: 'spki', format: 'der' }).toString('base64') !== embeddedKey) errors.push('Browser/CLI signing public keys differ');
  for (const file of filesUnder(path.join(publicRoot, 'firmware')).filter((f) => f.endsWith('.aff4t10.json'))) {
    check(path.relative(root, file), () => {
      const firmwareFile = file.slice(0, -'.aff4t10.json'.length);
      const name = '/' + path.relative(publicRoot, firmwareFile).split(path.sep).join('/');
      const bytes = publicAsset(name);
      publicAsset(name + '.aff4t10.json');
      validateManifest(JSON.parse(readFileSync(file, 'utf8')), bytes, publicKey, path.basename(firmwareFile));
      counts.signatures++;
    });
  }

  const actualRows = new Set();
  for (const file of filesUnder(distRoot).filter((f) => f.endsWith('.html'))) {
    counts.pages++;
    const relative = path.relative(distRoot, file).split(path.sep).join('/');
    const pageUrl = new URL(`${base}/${relative}`, origin);
    for (const node of elements(parse(readFileSync(file, 'utf8')))) {
      const attrs = Object.fromEntries((node.attrs ?? []).map((a) => [a.name, a.value]));
      for (const key of ['src', 'href', 'poster', 'data-path']) {
        const value = attrs[key];
        if (!value || value.startsWith('#') || /^(data:|mailto:|tel:|javascript:)/i.test(value)) continue;
        check(`${relative} ${key}=${value}`, () => {
          const url = new URL(value, pageUrl);
          if (url.origin !== origin) return;
          if (url.pathname !== base && !url.pathname.startsWith(base + '/')) throw new Error('URL is outside the configured Pages base');
          let target = url.pathname.slice(base.length) || '/';
          if (target.endsWith('/')) target += 'index.html';
          else if (!path.posix.extname(target)) target += '/index.html';
          exactFile(distRoot, target);
          counts.links++;
        });
      }
      if (attrs['data-method'] && attrs['data-path']) {
        counts.updaterRows++;
        actualRows.add(attrs['data-path']);
        check(`${relative} updater ${attrs['data-path']}`, () => {
          const fw = expectedRows.get(attrs['data-path']);
          if (!fw || fw.method !== attrs['data-method']) throw new Error('Unexpected firmware/method in updater');
          const signed = existsSync(path.join(publicRoot, fw.webPath + '.aff4t10.json'));
          if (attrs['data-signed'] !== (signed ? '1' : '0')) throw new Error('Built updater signature requirement differs from disk');
          const hasSize = [...elements(node)].some((el) => el.attrs?.some((a) => a.name === 'class' && a.value === 'fsize'));
          if (!hasSize) throw new Error('Built updater file size is missing');
        });
      }
    }
  }
  for (const name of expectedRows.keys()) if (!actualRows.has(name)) errors.push(`Firmware missing from built updater: ${name}`);
  if (!counts.products || !counts.firmware || !counts.pages || !counts.updaterRows) errors.push('Catalog validation coverage is unexpectedly empty');
  counts.assets = checked.size;

  if (remote) {
    const queue = [...downloads];
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const [url, expected] = queue.shift();
        let failure;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const bytes = Buffer.from(await response.arrayBuffer());
            if (!bytes.length || /text\/html/.test(response.headers.get('content-type') ?? '')) throw new Error('Not a firmware download');
            if (expected && sha256(bytes) !== expected.toLowerCase()) throw new Error('Remote release/mirror SHA-256 mismatch');
            counts.remote++;
            failure = null;
            break;
          } catch (error) { failure = error; }
        }
        if (failure) errors.push(`${url}: ${failure.message}`);
      }
    }));
  }
  return { counts, errors };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const result = await validateCatalog(root, { remote: process.argv.includes('--remote') });
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}
