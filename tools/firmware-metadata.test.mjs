import assert from 'node:assert/strict';
import { test } from 'node:test';
import { statSync } from 'node:fs';
import { readFirmwareMetadata } from '../src/lib/firmware-metadata.mjs';

const publicDir = new URL('../public/', import.meta.url);
test('firmware metadata uses the explicit public root and preserves signed/unsigned distinction', () => {
  const signed = '/firmware/AF-F4_nano_v2-v1.0.11.apj';
  assert.deepEqual(readFirmwareMetadata(publicDir, signed), {
    size: `${Math.round(statSync(new URL(`.${signed}`, publicDir)).size / 1024).toLocaleString('en-US')} KB`,
    signed: true,
  });
  assert.equal(readFirmwareMetadata(publicDir, '/firmware/AF-F4_nano-v1.2.3.apj').signed, false);
});
test('missing assets and paths outside the firmware directory fail the build', () => {
  for (const path of ['/firmware/missing.apj', '/firmware/', '/firmware/../../package.json', '/firmware/../admin/index.html', '/firmware/%2e%2e/secret', '/firmware/..\\secret', 'https://evil.example/fw.apj']) {
    assert.throws(() => readFirmwareMetadata(publicDir, path));
  }
});
