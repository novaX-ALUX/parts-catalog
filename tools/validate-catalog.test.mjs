import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import { exactFile, sha256, validateApj, validateHex, validateManifest } from './validate-catalog.mjs';

test('asset paths reject missing files, Windows-only case matches and traversal', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'novax-catalog-test-'));
  try {
    mkdirSync(path.join(root, 'images'));
    writeFileSync(path.join(root, 'images', 'Product.png'), 'fixture');
    assert.equal(exactFile(root, '/images/Product.png'), path.join(root, 'images', 'Product.png'));
    for (const value of ['/images/product.png', '/images/missing.png', '/../secret', '/%2e%2e/secret', '/images\\secret']) {
      assert.throws(() => exactFile(root, value));
    }
  } finally { rmSync(root, { recursive: true }); }
});

test('Intel HEX rejects corruption, truncation and trailing records', () => {
  const valid = ':0400000001020304F2\n:00000001FF\n';
  assert.doesNotThrow(() => validateHex(valid));
  assert.throws(() => validateHex(valid.replace('F2', 'F3')));
  assert.throws(() => validateHex(valid.split('\n')[0]));
  assert.throws(() => validateHex(valid + ':00000001FF'));
});

test('APJ checks decompression and declared firmware size', () => {
  const bytes = Buffer.from([1, 2, 3, 4]);
  const fixture = { board_id: 6204, image_size: bytes.length, image: deflateSync(bytes).toString('base64') };
  assert.deepEqual(validateApj(JSON.stringify(fixture)), { boardId: 6204, bytes });
  assert.throws(() => validateApj(JSON.stringify({ ...fixture, image_size: 5 })));
  assert.throws(() => validateApj(JSON.stringify({ ...fixture, image: 'broken' })));
});

test('release signature rejects tampered firmware, metadata and another key', () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const bytes = Buffer.from('firmware fixture');
  const manifest = { schema: 'af-f4-t10-fw-integrity/1', file: 'fixture.bin', size: bytes.length,
    hash_alg: 'SHA-256', sha256: sha256(bytes), sig_alg: 'Ed25519', signature: sign(null, bytes, privateKey).toString('base64') };
  assert.doesNotThrow(() => validateManifest(manifest, bytes, publicKey, 'fixture.bin'));
  assert.throws(() => validateManifest(manifest, Buffer.from('tampered'), publicKey, 'fixture.bin'));
  assert.throws(() => validateManifest({ ...manifest, size: 0 }, bytes, publicKey, 'fixture.bin'));
  assert.throws(() => validateManifest(manifest, bytes, generateKeyPairSync('ed25519').publicKey, 'fixture.bin'));
});
