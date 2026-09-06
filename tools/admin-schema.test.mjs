import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import yaml from 'js-yaml';

test('CMS exposes the firmware routing fields without dropping existing metadata', () => {
  const config = yaml.load(readFileSync(new URL('../public/admin/config.yml', import.meta.url), 'utf8'));
  for (const collection of config.collections) {
    const firmware = collection.fields.find((field) => field.name === 'firmware');
    if (!firmware) continue;
    const names = firmware.fields.map((field) => field.name);
    for (const name of ['kind', 'file', 'version', 'sha256', 'method', 'webPath']) assert(names.includes(name));
    assert.deepEqual(firmware.fields.find((field) => field.name === 'method').options, ['dfu', 'ardupilot', 'novax-fc']);
    const pattern = new RegExp(firmware.fields.find((field) => field.name === 'webPath').pattern[0]);
    assert(pattern.test('/firmware/fc/board/image.apj'));
    for (const invalid of ['https://evil.example/image.apj', '/firmware/a?x=1', '/firmware/a#b', '/firmware/a\\b', '/firmware/%2e%2e/a']) assert(!pattern.test(invalid));
  }
});
