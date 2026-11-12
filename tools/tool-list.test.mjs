// Tool page list (src/content/tools/*.json): each release's files sit in the GitHub release its
// notes link points to, carry that version in their name, and releases stay newest first.
// The bytes themselves are checked by `npm run validate:remote` (download + SHA-256).
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const dir = new URL('../src/content/tools/', import.meta.url);
const tools = readdirSync(dir).filter((f) => f.endsWith('.json'))
  .map((f) => ({ f, t: JSON.parse(readFileSync(new URL(f, dir), 'utf8')) }));
const REL = 'https://github.com/novaX-ALUX/parts-catalog/releases/';

test('tool list: at least one program with a download', () => {
  assert.ok(tools.some(({ t }) => t.releases?.length), 'no program has a release');
});

test('tool list: files live in the release the notes link names', () => {
  for (const { f, t } of tools) for (const r of t.releases ?? []) {
    assert.ok(r.notes.startsWith(REL + 'tag/'), `${f} ${r.version} notes`);
    const tag = r.notes.slice((REL + 'tag/').length);
    assert.ok(tag.endsWith(`-v${r.version}`), `${f} tag ${tag} vs ${r.version}`);
    const kinds = new Set();
    for (const x of r.files) {
      const m = x.file.match(/^https:\/\/github\.com\/novaX-ALUX\/parts-catalog\/releases\/download\/([^/]+)\/([^/\s]+)$/);
      assert.ok(m, `${f} ${x.file}`);
      assert.equal(m[1], tag, `${f} ${x.file} not in ${tag}`);
      assert.ok(m[2].includes(r.version), `${f} ${m[2]} lacks ${r.version}`);
      assert.match(x.sha256, /^[0-9a-f]{64}$/, `${f} ${m[2]}`);
      assert.ok(!kinds.has(x.kind), `${f} ${r.version} repeats ${x.kind}`);
      kinds.add(x.kind);
    }
  }
});

test('tool list: every side-tab icon and screenshot is a file in public/', () => {
  for (const { f, t } of tools) {
    for (const src of [t.icon, ...(t.shots ?? []).map((s) => s.src)]) {
      assert.ok(src && existsSync(new URL('../public' + src, import.meta.url)), `${f} ${src}`);
    }
  }
});

test('tool list: releases newest first, a program without one is Coming soon', () => {
  for (const { f, t } of tools) {
    const dates = (t.releases ?? []).map((r) => r.date);
    assert.deepEqual(dates, [...dates].sort().reverse(), f);
    if (!dates.length) assert.equal(t.comingSoon, true, `${f} has no release and is not Coming soon`);
  }
});
