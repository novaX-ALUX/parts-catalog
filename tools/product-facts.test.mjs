import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import yaml from 'js-yaml';

function product(category, name) {
  const source = readFileSync(new URL(`../src/content/${category}/${name}.md`, import.meta.url), 'utf8');
  return yaml.load(source.split(/^---\s*$/m)[1]);
}
function spec(product, key) { return product.specs.find(row => row.key === key)?.value; }

test('FC catalog separates actual PWM channels, LED and auxiliary channels', () => {
  assert.match(spec(product('fc', 'AF-F4-nano-v2'), 'PWM Output'), /^5 channels/);
  assert.match(spec(product('fc', 'AF-F4-nano'), 'PWM Output'), /^8 motor\/servo channels \+ 1 LED/);
  assert.match(spec(product('fc', 'AF-H7-nano'), 'PWM Output'), /^10 motor\/servo channels \+ 1 WS2812/);
  assert.match(spec(product('fc', 'AF-F7-mini'), 'PWM Output'), /^8 FMU channels \+ 3 auxiliary/);
  assert.match(spec(product('fc', 'AF-H7E'), 'PWM Output'), /^8 FMU \+ 8 IOMCU/);
});

test('H7 nano uses its own firmware target and current GPS/RC port mapping', () => {
  const h7 = product('fc', 'AF-H7-nano');
  assert.match(h7.firmwareNotes, /AF-H7_nano.*6200/);
  assert.doesNotMatch(h7.firmwareNotes, /MATEKH743|MatekH743|out of the box/);
  assert.match(h7.pinoutNotes, /GPS connector is USART3/);
  assert.match(h7.pinoutNotes, /ELRS\/RC connector is USART6/);
  assert.match(h7.pinoutImage, /fc_AF-H7_nano_firmware_ports\.svg$/);
});

test('F4 nano v2 external GPS and board-ID protection limits stay explicit', () => {
  const f4 = product('fc', 'AF-F4-nano-v2');
  assert.match(f4.description, /GNSS and compass are external/);
  assert.match(f4.description, /raw DFU and SWD flashing do not provide that protection/);
  for (const entry of f4.firmware) assert.doesNotMatch(entry.notes, /onboard MAX-M10S/);
});

test('GNSS receiver limits are not presented as measured end-to-end rates', () => {
  const g5 = product('gnss', 'AP-RTK-G5H');
  assert.match(spec(g5, 'Update Rate'), /requires measurement/);
  assert.match(spec(g5, 'I/O Ports'), /combined current below 150 mA/);
});
