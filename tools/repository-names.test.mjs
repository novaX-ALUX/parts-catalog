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
    assert.doesNotMatch(readFileSync(file, 'utf8'), /novaX-ALUX\/(?:fc-boards|esc-am32|esc-f280049c|esc-bluejay|esc-drv8300|rc-axtx|rc-novax-x7|D6Pro|novax-x7|axtx|rc|AE-12S-80A-FOC-G4)\b/i, file);
  }
});
// 공개 규칙(2026-11-24): 소스 저장소는 비공개 — 공개 페이지는 공개 저장소만 가리킨다(비공개를 가리키면 누구나 404).
// 이 목록은 39_gitNovaX tools/workspace-repositories.json 의 publicRepositories 와 같아야 한다.
const PUBLIC_REPOSITORIES = new Set(['parts-catalog', 'tool-configurator', 'am32', 'esc-am32', 'ardupilot', 'config']);
test('public pages link only public novaX-ALUX repositories', () => {
  const dirs = ['src/content', 'src/pages', 'src/components', 'src/layouts'].map(d => path.join(root, d));
  const files = [...dirs.flatMap(d => filesUnder(d)), path.join(root, 'public/admin/config.yml')];
  for (const file of files) {
    for (const m of readFileSync(file, 'utf8').matchAll(/github\.com\/novaX-ALUX\/([A-Za-z0-9_.-]+?)(?:\.git)?(?=[\/\s"')#?.,]|$)/g)) {
      assert.ok(PUBLIC_REPOSITORIES.has(m[1]), `${file}: links private repository novaX-ALUX/${m[1]}`);
    }
  }
});
// 제품군 먼저 → 제품: 펌웨어 파일은 /firmware/<제품군>/… 아래에만 둔다(맨 위에 흩어 두지 않는다).
test('firmware files live under a product-family folder', () => {
  const base = path.join(root, 'public/firmware');
  const families = new Set(['fc', 'gnss', 'esc', 'rc', 'pmu', 'motor', 'charger', 'camera', 'gimbal', 'dsoccer']);
  for (const item of readdirSync(base, { withFileTypes: true }).filter(i => !i.name.startsWith('.'))) {   // .omc 같은 로컬 도구 자리는 빼고
    assert.ok(item.isDirectory(), `loose firmware file at /firmware/${item.name}`);
    assert.ok(families.has(item.name), `unknown firmware family folder /firmware/${item.name}`);
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
