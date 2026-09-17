import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
  assert.match(spec(product('fc', 'AF-F4-T10-nano'), 'PWM Output'), /^8 motor\/servo channels \+ 1 LED/);
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

test('X20D is a separate R3 engineering product with its own heading contract', () => {
  const x20 = product('gnss', 'AP-RTK-X20D');
  assert.equal(x20.name, 'AP-RTK X20D');
  assert.equal(x20.order, 22);
  assert.match(x20.image, /gnss_AP-RTK-X20D\.png$/, 'card image = case render');
  assert.ok(x20.gallery.some((g) => /X20D_R3_top_isometric\.png$/.test(g)), 'gallery keeps the R3 PCB renders');
  assert.match(spec(x20, 'Update Rate'), /requires measurement/);
  assert.match(x20.configNotes, /ANT1 \/ RF_IN_1 at the rear; ANT2 \/ RF_IN_2 at the front/);
  assert.equal(x20.configParams.find(p => p.name === 'GPS1_MB_TYPE').value, '0');
  assert.match(x20.firmwareNotes, /engineering release/);
  assert.match(x20.firmwareNotes, /6205/);
  assert.match(x20.firmwareNotes, /upstream AP_Periph numeric version remains 1\.8/);
  assert.equal(x20.firmware.length, 4);
  for (const fw of x20.firmware) {
    assert.equal(fw.version, '1.0.1');
    assert.match(fw.file, /^\/firmware\/gnss\/AP-RTK-X20D\/AP-RTK_X20D-v1\.0\.1/);
    assert.match(fw.sha256, /^[0-9a-f]{64}$/);
    assert.equal(fw.method, undefined, 'Do not enable an unqualified browser-flash target');
  }
});

test('X20D pin table matches the R3 netlist (CAN/UART/PPS pin 1 = GND, DEBUG pin 1 = 5 V)', () => {
  const table = product('gnss', 'AP-RTK-X20D').pinTable;
  const signals = (name) => table.find((c) => c.name === name).pins.map((p) => p.signal);
  assert.deepEqual(signals('CAN'), ['GND', 'CAN_L', 'CAN_H', '5V']);
  assert.deepEqual(signals('UART'), ['GND', 'TX', 'RX', '5V']);
  assert.deepEqual(signals('DEBUG'), ['5V', 'SWDIO', 'SWCLK', 'RX', 'TX', 'GND']);
  assert.deepEqual(signals('PPS'), ['GND', 'EVENT', 'GND', 'PPS']);
  assert.deepEqual(signals('ANT1 · ANT2'), ['RF_IN_1', 'RF_IN_2']);
});

test('catalog status flags: G5H withdrawn, X20D and AF-H7E Lite announced as coming soon', () => {
  assert.equal(product('gnss', 'AP-RTK-G5H').hidden, true);
  assert.equal(product('gnss', 'AP-RTK-X20D').comingSoon, true);
  const lite = product('fc', 'AF-H7E-Lite');
  assert.equal(lite.comingSoon, true);
  assert.equal(lite.order, product('fc', 'AF-H7E').order + 1, 'Lite card sits right after AF-H7E');
  // Firmware for a board still in development is published (2026-09-17, user request) but must say it is preliminary.
  assert.ok(lite.firmware.every((fw) => /Preliminary/.test(fw.notes)), 'unreleased-board firmware is labelled preliminary');
});

test('AF-H7E Lite pin table follows the Pixhawk connector convention and ArduPilot defaults', () => {
  const table = product('fc', 'AF-H7E-Lite').pinTable;
  const names = table.map((c) => c.name);
  assert.equal(new Set(names).size, names.length, 'connector names are unique');
  // UART n is ArduPilot SERIALn, so UART 1-2 come up as telemetry and UART 3-4 as GPS without setup.
  for (let n = 1; n <= 6; n++) {
    const uart = table.find((c) => c.name === `UART ${n}`);
    assert.match(uart.mapping, new RegExp(`^SERIAL${n} `));
  }
  for (const n of [1, 2]) assert.match(table.find((c) => c.name === `UART ${n}`).mapping, /MAVLink2/);
  for (const n of [3, 4]) assert.match(table.find((c) => c.name === `UART ${n}`).mapping, /GPS/);
  // Flow control is only claimed on the 6-pin ports.
  for (const c of table.filter((c) => /^UART/.test(c.name))) {
    const hasFlow = c.pins.some((p) => p.signal === 'RTS');
    assert.equal(hasFlow, c.pins.length === 6, `${c.name} flow-control pins match its pin count`);
  }
  // JST supply/ground convention: pin 1 carries supply, last pin is GND.
  for (const c of table.filter((c) => /^JST/.test(c.type ?? '') && c.name !== 'ETHERNET')) {
    assert.match(c.pins[0].signal, /^(VCC|VCC_IN|VREF)$/, `${c.name} pin 1`);
    assert.equal(c.pins.at(-1).signal, 'GND', `${c.name} last pin`);
  }
  // Removed on the Lite: IOMCU aux outputs, CAN power input, dedicated GPS/safety port.
  for (const gone of ['AUX', 'POWER C1', 'POWER C2', 'GPS', 'SAFETY', 'IO DEBUG']) {
    assert.ok(!names.some((n) => n.startsWith(gone)), `${gone} is not on the Lite`);
  }
  assert.ok(names.includes('POWER 1') && names.includes('POWER 2'), 'dual power inputs');
  // RC IN = AF-H7E (V6X J21) 5-pin pinout: 5 V · RC signal · RSSI · switched 3.3 V for DSM satellites · GND.
  const rc = table.find((c) => c.name === 'RC IN');
  assert.equal(rc.type, 'JST-GH 5P');
  assert.deepEqual(rc.pins.map((p) => p.signal), ['VCC', 'RC_IN', 'RSSI', 'VCC_3V3', 'GND']);
  // 3-pin header = 13 columns: M1–M12 PWM + SB (SBUS out from USART6 / SERIAL8) — never labelled M13.
  const sb = table.find((c) => c.name.startsWith('SB'));
  assert.ok(sb && /SERIAL8/.test(sb.mapping) && /USART6/.test(sb.mapping), 'SB = SBUS out on SERIAL8 (USART6)');
  assert.ok(sb.pins.some((p) => p.signal === 'SBUS_OUT'), 'SB signal pin');
  assert.ok(!names.some((n) => /M13/.test(n)), 'the 13th column is SB, not M13');
});

test('AF-H7E Lite firmware ships Copter and Plane for board ID 6207 from its own release tag', () => {
  const lite = product('fc', 'AF-H7E-Lite');
  assert.equal(lite.firmware.length, 4);
  for (const fw of lite.firmware) {
    assert.match(fw.file, /\/releases\/download\/AF-H7E_Lite-v0\.1\.0\/AF-H7E_Lite-v0\.1\.0-(Copter|Plane)(\.apj|_with_bl\.hex)$/);
    assert.equal(fw.webPath, '/firmware/' + fw.file.split('/').pop());
    const bytes = readFileSync(new URL(`../public${fw.webPath}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), fw.sha256);
    if (fw.webPath.endsWith('.apj')) assert.equal(JSON.parse(bytes.toString()).board_id, 6207);
  }
  assert.match(lite.firmwareNotes, /Preliminary/);
  assert.match(spec(lite, 'MCU'), /STM32H753/);
});
