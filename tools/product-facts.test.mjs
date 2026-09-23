import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
  // firmware v1.0.6+: same antenna layout and autopilot parameters as AP-RTK dual (RelPosHeading, GPS1_MB_OFS)
  assert.match(x20.configNotes, /ANT1 Master at the front, ANT2 Slave at the rear/);
  assert.match(x20.configNotes, /firmware v1\.0\.6/);
  const pv = (p) => p.configParams.map((c) => [c.name, c.value]);
  assert.deepEqual(pv(x20), pv(product('gnss', 'AP-RTK-dual')), 'X20D uses the AP-RTK dual parameter set');
  assert.match(x20.firmwareNotes, /engineering release/);
  assert.match(x20.firmwareNotes, /6205/);
  assert.match(x20.firmwareNotes, /upstream AP_Periph numeric version remains 1\.8/);
  assert.equal(x20.firmware.length, 4);
  for (const fw of x20.firmware) {
    assert.equal(fw.version, '1.0.6');
    assert.match(fw.file, /^\/firmware\/gnss\/AP-RTK-X20D\/AP-RTK_X20D-v1\.0\.6/);
    assert.match(fw.sha256, /^[0-9a-f]{64}$/);
    assert.equal(fw.method, undefined, 'Do not enable an unqualified browser-flash target');
  }
});

test('X20D pinout matches the R3 netlist in the AP-RTK dual form (pin N → pin 1; CAN/UART/PPS pin 1 = GND, DEBUG pin 1 = 5 V)', () => {
  const x20 = product('gnss', 'AP-RTK-X20D');
  assert.match(x20.pinoutImage, /gnss_AP-RTK-X20D_pinout\.png$/);
  assert.equal(x20.pinTable, undefined, 'same Pinout tab form as AP-RTK dual: drawing + one-line notes');
  for (const pins of ['① UART (5V · RX · TX · GND)', '② CAN (5V · CAN_H · CAN_L · GND)',
                      '③ DEBUG (GND · TX · RX · SWCLK · SWDIO · 5V)', '④ PPS (PPS · GND · EVENT · GND)']) {
    assert.ok(x20.pinoutNotes.includes(pins), pins);
  }
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
  // UART n is ArduPilot SERIALn. SERIAL3 · SERIAL5 come out as the 6-pin GPS 1 · GPS 2 ports (UART + I2C).
  // 커넥터 이름은 픽스호크 관례(TELEM n · GPS n). MCU 페리페럴 번호와 겹치지 않게 이름에 UART 를 쓰지 않는다.
  // 이름은 우리가 용도를 권장하는 포트(전자식 퓨즈)만 TELEM · GPS 로, 범용 포트는 SERIALn 그대로(2026-09-23 사용자)
  const serialPort = { 1: 'TELEM 1', 2: 'TELEM 2', 3: 'GPS 1', 4: 'SERIAL4', 5: 'GPS 2', 6: 'SERIAL6' };
  // 각 포트 mapping 은 "SERIALn · <MCU 페리페럴> …" 로 적어 hwdef 와 대조된다(2026-09-23 박재량 요청)
  const peripheral = { 'TELEM 1': 'UART7', 'TELEM 2': 'UART5', 'GPS 1': 'USART1', SERIAL4: 'UART8',
                       'GPS 2': 'USART2', SERIAL6: 'UART4', DEBUG: 'USART3' };
  for (const [name, per] of Object.entries(peripheral)) {
    assert.ok(table.find((c) => c.name === name).mapping.includes(per), `${name} names its MCU peripheral (${per})`);
  }
  for (const [n, name] of Object.entries(serialPort)) {
    assert.match(table.find((c) => c.name === name).mapping, new RegExp(`^SERIAL${n} `), `${name} = SERIAL${n}`);
  }
  for (const n of [1, 2]) assert.match(table.find((c) => c.name === `TELEM ${n}`).mapping, /MAVLink2/);
  for (const n of ['GPS 1', 'GPS 2', 'SERIAL4']) assert.match(table.find((c) => c.name === n).mapping, /GPS/);
  // GPS 1 · 2 are Pixhawk 6-pin GPS ports: UART plus the I2C bus shared with the matching I2C port.
  for (const [gps, i2c] of [['GPS 1', 'I2C A'], ['GPS 2', 'I2C B']]) {
    const c = table.find((x) => x.name === gps);
    assert.deepEqual(c.pins.map((p) => p.signal), ['VCC', 'TX', 'RX', 'SCL', 'SDA', 'GND'], `${gps} pinout`);
    const bus = table.find((x) => x.name === i2c).mapping;
    assert.ok(c.mapping.includes(bus), `${gps} shares its I2C bus with ${i2c}`);
  }
  // I2C-only devices need their own ports — never fold these back into the GPS ports.
  for (const n of ['I2C A', 'I2C B']) {
    assert.deepEqual(table.find((c) => c.name === n).pins.map((p) => p.signal), ['VCC', 'SCL', 'SDA', 'GND'], `${n} pinout`);
  }
  // 흐름제어는 6핀 TELEM 에만 있다. GPS 포트는 6핀이지만 4·5번이 SCL/SDA 라 RTS/CTS 가 없다.
  for (const c of table.filter((c) => /^TELEM /.test(c.name))) {
    const hasFlow = c.pins.some((p) => p.signal === 'RTS');
    assert.equal(hasFlow, c.pins.length === 6, `${c.name} flow-control pins match its pin count`);
  }
  // JST supply/ground convention: pin 1 carries supply, last pin is GND.
  for (const c of table.filter((c) => /^JST/.test(c.type ?? '') && c.name !== 'ETHERNET')) {
    assert.match(c.pins[0].signal, /^(VCC|VCC_IN|VREF)$/, `${c.name} pin 1`);
    assert.equal(c.pins.at(-1).signal, 'GND', `${c.name} last pin`);
  }
  // Removed on the Lite: IOMCU aux outputs, CAN power input, dedicated GPS/safety port.
  for (const gone of ['AUX', 'POWER C1', 'POWER C2', 'GPS & SAFETY', 'SAFETY', 'IO DEBUG']) {
    assert.ok(!names.some((n) => n.startsWith(gone)), `${gone} is not on the Lite`);
  }
  assert.ok(names.includes('POWER 1') && names.includes('POWER 2'), 'dual power inputs');
  // RC IN = AF-H7E (V6X J21) 5-pin pinout: 5 V · RC signal · RSSI · switched 3.3 V for DSM satellites · GND.
  const rc = table.find((c) => c.name === 'RC IN');
  // 2026-09-21: RC IN / UART 4 / UART 6 은 맨 뒤 아랫면에서 뒤로 꽂고, 그 윗면이 POWER 1 · 2(잠금이 뒷벽 쪽)다.
  assert.equal(rc.type, 'JST-GH 5P · rear edge');
  for (const n of ['SERIAL4', 'SERIAL6']) assert.match(table.find((c) => c.name === n).type, /· rear edge$/, `${n} sits on the rear edge with RC IN`);
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

test('APMU-12S 100A: coming soon, power-port pins from the V2 board, INA228 address set explicitly', () => {
  const p = product('pmu', 'APMU-12S-100A');
  assert.equal(p.comingSoon, true);
  assert.match(spec(p, 'Continuous Current'), /target.*not yet rated/, '100 A is the next-version target, not a V2 rating');
  const signals = (name) => p.pinTable.find((c) => c.name === name).pins.map((x) => x.signal);
  assert.deepEqual(signals('POWER I2C'), ['5V', '5V', 'SCL', 'SDA', 'GND', 'GND']);
  assert.deepEqual(signals('POWER ANALOG'), ['5V', '5V', 'CURRENT', 'VOLTAGE', 'GND', 'GND']);
  const param = (name) => p.configParams.filter((c) => c.name === name).map((c) => c.value);
  // With BATT_I2C_ADDR 0 ArduPilot probes only 0x41/0x44/0x45 (AP_BattMonitor_INA2xx); this INA228 sits at 0x40.
  assert.deepEqual(param('BATT_I2C_ADDR'), ['64']);
  assert.deepEqual(param('BATT_SHUNT'), ['0.0003']);
  assert.ok(Number(param('BATT_MAX_AMPS')[0]) >= 100, 'INA228 full scale covers the 100 A target');
  assert.deepEqual(param('BATT_VOLT_MULT'), ['21.0']);
  assert.deepEqual(param('BATT_AMP_PERVLT'), ['55.56']);
});

test('APMU-12S 120A: coming soon, FC port and button pins from the schematic, INA228 at 0x40 on a 0.1 mΩ shunt', () => {
  const p = product('pmu', 'APMU-12S-120A');
  assert.equal(p.comingSoon, true);
  assert.match(spec(p, 'Continuous Current'), /target.*to be confirmed/, '120 A is a design target until the thermal test');
  const signals = (name) => p.pinTable.find((c) => c.name === name).pins.map((x) => x.signal);
  // J301 / J901 pin order of the SKiDL truth (pmu/APMU-12S_120A hardware/circuits).
  assert.deepEqual(signals('POWER I2C'), ['5V', '5V', 'SCL', 'SDA', 'GND', 'GND']);
  assert.deepEqual(signals('BUTTON'), ['BTN', 'GND', 'LED_A', 'LED1', 'LED2', 'LED3', 'LED4']);
  assert.deepEqual(signals('ESC OUT ×5'), ['OUT', 'GND']);
  // J1201 / J1202 / J1203 and J302-J308 of the SKiDL truth (circuits/apmu_nav.py, apmu_sense.build_can).
  assert.deepEqual(signals('NAV LEFT'), ['5V_LED', '5V_LED', 'WHITE', 'RED']);
  assert.deepEqual(signals('NAV RIGHT'), ['5V_LED', '5V_LED', 'WHITE', 'BLUE']);
  assert.deepEqual(signals('NAV PWM IN'), ['PWM', 'GND']);
  assert.deepEqual(signals('CAN ×7'), ['5V', 'CAN_H', 'CAN_L', 'GND']);
  assert.match(spec(p, 'Navigation Lights'), /59 times a minute.*40–100 per minute/, 'blink rate inside 14 CFR 25.1401');
  assert.ok(!p.pinTable.some((c) => c.name === 'LED 5V'), 'the LED 5 V XT30 gave its place to the light plugs');
  const param = (name) => p.configParams.filter((c) => c.name === name).map((c) => c.value);
  assert.deepEqual(param('BATT_MONITOR'), ['21']);
  assert.deepEqual(param('BATT_I2C_ADDR'), ['64']);
  assert.deepEqual(param('BATT_SHUNT'), ['0.0001']);
  // INA228 ADCRANGE 0 (±163.84 mV) over 0.1 mΩ reads ±1638 A; BATT_MAX_AMPS sets ArduPilot's reporting full scale.
  assert.ok(Number(param('BATT_MAX_AMPS')[0]) >= 120, 'reporting full scale covers the 120 A target');
  assert.deepEqual(p.gallery.map((g) => g.caption), ['Isometric', 'Front', 'Back', 'Left', 'Right', 'Top', 'Bottom']);
});

test('every PMU product is registered completely (name, card, specs, pin table, 3D model)', () => {
  const files = readdirSync(new URL('../src/content/pmu/', import.meta.url)).filter((f) => f.endsWith('.md'));
  assert.ok(files.length >= 1, 'the PMU category has products');
  const config = readFileSync(new URL('../src/content.config.ts', import.meta.url), 'utf8');
  assert.match(config, /pmu: 'PMU'/, 'category label is PMU');
  for (const f of files) {
    const p = product('pmu', f.replace(/\.md$/, ''));
    // Family naming rule APMU-<cells>S_<continuous A>A, shown with a space on the page.
    assert.match(p.name, /^APMU-\d+S \d+A$/, `${f} name`);
    assert.equal(f.replace(/\.md$/, ''), p.name.replace(' ', '-'), `${f} file name follows the product name`);
    assert.match(p.image, new RegExp(`^/images/products/pmu_${f.replace(/\.md$/, '')}\.png$`), `${f} card image`);
    for (const key of ['Battery Input', 'Continuous Current', 'Validation Status']) assert.ok(spec(p, key), `${f} spec ${key}`);
    assert.ok(p.pinTable?.some((c) => /^POWER /.test(c.name)), `${f} lists its FC power port(s)`);
    if (p.model3d) {
      assert.equal(p.model3d, `/models/pmu/${f.replace(/\.md$/, '.glb')}`, `${f} 3D model path`);
      const glb = readFileSync(new URL(`../public${p.model3d}`, import.meta.url));
      assert.equal(glb.subarray(0, 4).toString(), 'glTF', `${f} 3D model is a glTF binary`);
      assert.ok(glb.length < 5e6, `${f} 3D model stays under 5 MB for the web`);
    }
  }
  assert.ok(product('pmu', 'APMU-12S-100A').model3d, 'APMU-12S 100A has its 3D PCBA');
  assert.ok(product('pmu', 'APMU-12S-120A').model3d, 'APMU-12S 120A has its 3D PCBA');
});

// 2026-09-23 박재량: "uart 로만 써 있어 serial 몇 번인지 알 수가 없다" → FC 카탈로그마다 Serial Mapping 을 적는다.
// 기대값은 각 보드 정의(hwdef.dat)의 SERIAL_ORDER 에서 뽑은 것이고, 같은 작업트리에 보드 정의가 있으면 한 번 더 대조한다
// (이 저장소만 체크아웃하는 CI 에는 fc/boards 가 없으므로 파일이 있을 때만).
test('every FC product states its ArduPilot serial mapping (SERIAL_ORDER in the board definition)', () => {
  const expected = {
    'AF-F4-nano': 'SERIAL1 = USART1 · SERIAL2 = USART2 · SERIAL3 = USART3 · SERIAL4 = UART4 · SERIAL5 = UART5 · SERIAL6 = USART6 (USB = SERIAL0)',
    'AF-F4-nano-v2': 'SERIAL1 = USART3 · SERIAL2 = USART1 · SERIAL3 = USART2 (USB = SERIAL0)',
    'AF-F4-T10-nano': 'SERIAL1 = USART1 · SERIAL2 = USART2 · SERIAL3 = USART3 · SERIAL4 = UART4 · SERIAL5 = UART5 · SERIAL6 = USART6 (USB = SERIAL0)',
    'AF-F7-mini': 'SERIAL1 = USART2 · SERIAL2 = USART3 · SERIAL3 = USART1 · SERIAL4 = UART4 · SERIAL5 = USART6 · SERIAL6 = UART7 (USB = SERIAL0)',
    'AF-H7E': 'SERIAL1 = UART7 · SERIAL2 = UART5 · SERIAL3 = USART1 · SERIAL4 = UART8 · SERIAL5 = USART2 · SERIAL6 = UART4 · SERIAL7 = USART3 (USB = SERIAL0)',
    'AF-H7E-Lite': 'SERIAL1 = UART7 · SERIAL2 = UART5 · SERIAL3 = USART1 · SERIAL4 = UART8 · SERIAL5 = USART2 · SERIAL6 = UART4 · SERIAL7 = USART3 · SERIAL8 = USART6 (USB = SERIAL0)',
    'AF-H7-nano': 'SERIAL1 = USART1 · SERIAL2 = USART2 · SERIAL3 = USART3 · SERIAL4 = UART4 · SERIAL6 = USART6 · SERIAL7 = UART7 · SERIAL8 = UART8 (USB = SERIAL0)'
  };
  const board = { 'AF-F4-nano': 'AF-F4_nano', 'AF-F4-nano-v2': 'AF-F4_nano_v2', 'AF-F4-T10-nano': 'AF-F4_T10_nano',
                  'AF-F7-mini': 'AF-F7_mini', 'AF-H7E': 'AF-H7E', 'AF-H7E-Lite': 'AF-H7E_Lite', 'AF-H7-nano': 'AF-H7_nano' };
  for (const [prod, want] of Object.entries(expected)) {
    assert.equal(spec(product('fc', prod), 'Serial Mapping'), want, `${prod} serial mapping`);
    const hwdefUrl = new URL(`../../../fc/boards/${board[prod]}/ardupilot/hwdef.dat`, import.meta.url);
    if (!existsSync(hwdefUrl)) continue;                   // 카탈로그만 있는 환경(CI)에서는 건너뛴다
    const order = readFileSync(hwdefUrl, 'utf8').match(/^SERIAL_ORDER (.+)$/m)[1].trim().split(/\s+/);
    const fromHwdef = order.map((per, i) => [i, per])
      .filter(([, per]) => per !== 'EMPTY' && !per.startsWith('OTG'))
      .map(([i, per]) => `SERIAL${i} = ${per}`).join(' · ') + ' (USB = SERIAL0)';
    assert.equal(want, fromHwdef, `${prod} expectation still matches hwdef.dat`);
  }
});
