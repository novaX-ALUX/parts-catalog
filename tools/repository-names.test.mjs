import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    const full = path.join(dir, item.name);
    return item.isDirectory() ? filesUnder(full) : [full];
  });
}
test('active catalog and CMS do not use predecessor repository names', () => {
  const files = [...filesUnder(path.join(root, 'src/content')), path.join(root, 'public/admin/config.yml')];
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /novaX-ALUX\/(?:fc-boards|esc-am32|esc-f280049c|esc-bluejay|esc-drv8300|rc-axtx|rc-novax-x7|D6Pro)\b/i, file);
  }
});
test('family-hosted firmware retains every previously published byte', () => {
  const { mirrors } = JSON.parse(readFileSync(path.join(root, 'tools/release-mirror-provenance.json')));
  assert.equal(mirrors.length, 9);
  for (const item of mirrors) {
    assert.match(item.target, /^\/firmware\/(esc|gnss)\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
    const bytes = readFileSync(path.join(root, 'public', item.target));
    assert.equal(bytes.length, item.bytes, item.target);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.target);
  }
});
