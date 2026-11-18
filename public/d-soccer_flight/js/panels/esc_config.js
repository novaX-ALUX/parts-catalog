// ESC 설정 칸 — 원본 ESCNovaX · ESCBLHeli_S(공통 값 + ESC 1~4 칸) · ESCObjectsManager(칸 켜기/끄기·진행 글자)
// 값을 받으면 그 ESC 칸을 그 종류로 켜고 값을 채운다. 보낼 때는 "마지막으로 받은 값"에 화면 값을 덮어써서 보낸다(원본 그대로).
import { t, onLang, applyStatic } from "../i18n.js";
import { api } from "../api.js";
import { NOVAX, BLHELI } from "./esc_keys.js";
import { sliderRow, selectBox, dropList } from "../widgets.js";
import { NX, NX_SECTIONS, BL, UNIT } from "./esc_layout.js";

// 기본 생성자 값(설정 초기화 · 받은 값이 없을 때)
const zip = (keys, vals) => Object.fromEntries(keys.map((k, i) => [k, vals[i]]));
const NOVAX_DEF = zip(NOVAX, [0, 0x00, 0x10, 0x15, 0x01, 0xFF, 0x1A, 0x09, 0x60, 0x01, 0xFF, 0x04, 0x3C, 0x50, 0x05, 0x02, 0x00, 0x00, 0x00]);
const BLHELI_DEF = zip(BLHELI, [0, 0x00, 0x10, 0x07, 0x09, 0xFF, 0x01, 0x03, 0x25, 0xD0, 0x28, 0x50, 0x04, 0x02, 0x07, 0x00, 0x00]);
// 드롭다운 항목(Main.unity 그대로)
const O = {
  demag: ["Off", "Low", "High"], temp: ["Disabled", "80C", "90C", "100C", "110C", "120C", "130C", "140C"],
  beacon: ["30 seconds", "1 minutes", "2 minutes", "5 minutes", "10 minutes", "Infinite"],
  dir: ["Normal", "Reversed"], led: ["Off", "Blue", "Green", "Red", "Cyan", "Magenta", "Yellow", "White"],
  startup: ["0.031", "0.047", "0.063", "0.094", "0.125", "0.188", "0.25", "0.38", "0.50", "0.75", "1.00", "1.25", "1.50"],
};
const UNIT_TOP = [0, 215, 429.6, 644.7]; // 원본 ESC1~4 T130 · 345 · 559.6 · 774.7
const R = Math.round; // Mathf.RoundToInt (슬라이더가 정수라 같음)

export function initEscConfig(common, unitsHost) {
  // ── 칸 만들기 — 자리는 모두 원본(esc_layout.js · tools/esc_layout.mjs 가 shipped_ui.json 에서 뽑음) ──
  const px = (v) => v + "px";
  const at = (el, [x, y, w, h], parent) => { Object.assign(el.style, { left: px(x), top: px(y), width: px(w), height: px(h) }); parent?.appendChild(el); return el; };
  const div = (cls, html = "") => Object.assign(document.createElement("div"), { className: cls, innerHTML: html });
  // 이름 글(Text1) — 원본 정렬: 3 = 가운데 왼쪽, 0 = 위 왼쪽 · 크기 = 원본 글자 크기 × 배율
  const AL = ["flex-start", "center", "flex-end"];
  const text = (parent, L, s, cls = "esc-lab") => {
    const d = at(div(cls), L.r, parent);
    Object.assign(d.style, { fontSize: px(L.size), justifyContent: AL[L.align % 3], alignItems: AL[Math.floor(L.align / 3)] });
    d.textContent = s;
    return d;
  };
  // ? (원본 Help: 회색 동그라미 22 × 0.8 + "?" NotoSansKR-Medium 16 × 0.8) — 올리면 말풍선(아래 bubble)
  const helps = [];
  const helpAt = (parent, r, nums, side) => { const h = at(div("help", "?"), r, parent); h.dataset.h = nums; h.dataset.side = side; helps.push(h); return h; };
  // 줄: 값 칸 · − · 슬라이더 · + — 줄 자리 = 값 칸 왼쪽 위, 나머지는 그 기준 상대 자리
  const row = (parent, L, name, nums, min, max, base = 0, mul = 1) => {
    const r = sliderRow({ min, max, step: 1, decimals: 0, w: L.slider[2], base, mul, bubble: true });
    const [vx, vy] = L.value, rel = (q, dx = 0, dw = 0) => [q[0] - vx + dx, q[1] - vy, q[2] + dw, q[3]];
    at(r, [vx, vy, L.up[0] + L.up[2] - vx, L.value[3]], parent);
    const { minus, plus, range, box } = r.btns;
    at(box, rel(L.value)); at(minus, rel(L.down)); at(plus, rel(L.up));
    at(range, rel(L.slider, -10, 20)); // 원본 손잡이가 트랙 0~170 전체를 움직임 → 양쪽 10 넓게(PID 와 같은 규칙)
    text(parent, L.label, name);
    helpAt(parent, L.help, nums, "left");
    return r;
  };
  // 드롭다운: 원본 Dropdown(UISprite 흰 칸 · 배율 0.8) · 안 글자 Label · 화살표 · 옆 이름 Text1 (1)
  const dd = (parent, L, name, nums, opts, side = "left") => {
    const s = at(selectBox(opts, "dd"), L.box, parent);
    at(div("dd-bg"), L.box, parent); // 칸(UISprite) — select 바로 뒤(올림 색: .dd:hover + .dd-bg)
    Object.assign(s.style, { paddingLeft: px(L.label.r[0] - L.box[0]), fontSize: px(L.label.size),
      backgroundPosition: `${L.arrow[0] - L.box[0]}px ${L.arrow[1] - L.box[1]}px`, backgroundSize: `${L.arrow[2]}px ${L.arrow[3]}px` });
    text(parent, L.text, name);
    helpAt(parent, L.help, nums, side);
    return s;
  };
  // 켜고 끄기: 원본 Toggle Background(UISprite 흰 칸 36) + Checkmark(24, 켜질 때)
  const toggle = (parent, L, name, nums) => {
    const b = at(div("esc-tg"), L.bg, parent);
    b.setAttribute("role", "checkbox");
    if (L.check) at(div("esc-ck"), [L.check[0] - L.bg[0], L.check[1] - L.bg[1], L.check[2], L.check[3]], b);
    b.onclick = () => b.classList.toggle("on");
    b.get = () => b.classList.contains("on");
    b.set = (on) => b.classList.toggle("on", !!on);
    text(parent, L.text, name);
    helpAt(parent, L.help, nums, "left");
    return b;
  };
  const section = (parent, S) => { const d = text(parent, S.title, S.title.text, "esc-sec"); at(div("esc-line"), S.line, parent); return d; };

  common.insertAdjacentHTML("beforeend", `<div class="esc-cp nx hidden"></div><div class="esc-cp bl hidden"></div>`);
  const nxEl = common.querySelector(".esc-cp.nx"), blEl = common.querySelector(".esc-cp.bl");
  const nx = { // ESCNovaX 공통 (이름 = 원본 필드)
    minStartupPower: row(nxEl, NX.minStartupPower, "Minimum Startup Power (Boost)", "121,122,123", 0, 25, 1000, 4),
    maxStartupPower: row(nxEl, NX.maxStartupPower, "Maximum Startup Power (Protection)", "124,125,126", 0, 50, 1000, 4),
    motorTiming: row(nxEl, NX.motorTiming, "Motor Timing", "127,128,129", 0, 31),
    rpmPowerProtection: row(nxEl, NX.rpmPowerProtection, "RPM Power Protection", "130,131,132", 0, 100),
    demagComp: dd(nxEl, NX.demagComp, "Demag Compenstation", "133,134", O.demag),
    beepStrenth: row(nxEl, NX.beepStrenth, "Beep Strength", "135,136", 0, 255),
    beaconDelay: dd(nxEl, NX.beaconDelay, "Beacon Delay", "137,138", O.beacon),
    temperatureProtection: dd(nxEl, NX.temperatureProtection, "Temperature Protection", "139,140", O.temp),
    brakeOnstop: toggle(nxEl, NX.brakeOnstop, "Brake On Stop", "141,142"),
    maximumBrakingStrength: row(nxEl, NX.maximumBrakingStrength, "Maximum Breaking Strength", "181,182,183", 0, 255),
  };
  NX_SECTIONS.forEach((S) => section(nxEl, S));
  const bl = { // ESCBLHeli_S 공통
    startupPower: dd(blEl, BL.startupPower, "Startup Power", "149,150", O.startup),
    tempProtection: dd(blEl, BL.tempProtection, "Temperature Protection", "139,140", O.temp),
    brakeOnStop: toggle(blEl, BL.brakeOnStop, "Brake On Stop", "141,142"),
    demagComp: dd(blEl, BL.demagComp, "Demag Compensation", "133,134", O.demag),
    motorTiming: row(blEl, BL.motorTiming, "Motor Timing", "127,128,129", 0, 31),
    beepStrength: row(blEl, BL.beepStrength, "Beep Strength", "135,136", 0, 255),
    beaconStrength: row(blEl, BL.beaconStrength, "Beacon Strength", "151,152", 0, 255),
    BeaconDelay: dd(blEl, BL.BeaconDelay, "Beacon Delay", "137,138", O.beacon),
  };
  for (const [g, o] of [["nx", nx], ["bl", bl]]) for (const [k, el] of Object.entries(o)) el.dataset.key = `${g}.${k}`; // 찾기·시험용 이름(원본 필드명)

  // ── ESC 1~4 칸 ──
  unitsHost.innerHTML = UNIT_TOP.map((top, i) => `
    <div class="box esc-unit" id="esc-u${i}" style="top:${top}px">
      <div class="esc-title">ESC :</div><div class="rule"></div>
      <div class="esc-in nx hidden"></div><div class="esc-in bl hidden"></div>
      <button class="esc-b esc-upd" id="esc-upd-${i}" data-i18n="${157 + i}"></button>
      <div class="esc-bar hidden"><i></i></div><div class="esc-stat hidden"></div>
    </div>`).join("");
  applyStatic(unitsHost);
  const units = [0, 1, 2, 3].map((i) => {
    const u = unitsHost.querySelector("#esc-u" + i);
    const n = u.querySelector(".esc-in.nx"), b = u.querySelector(".esc-in.bl");
    // PPM: 원본 SliderManager_ESC — 슬라이더만(−/+ 없음), 아래 투명 값 칸(흰 글자 가운데) + "µs"
    const ppm = (L, name, nums, max, base) => {
      const r = sliderRow({ min: 0, max, step: 1, decimals: 0, w: L.slider[2], base, mul: 4 });
      r.classList.add("esc-ppm");
      const [sx, sy] = L.slider;
      at(r, [sx, sy, L.slider[2], L.value[1] + L.value[3] - sy], b);
      const { minus, plus, range, box } = r.btns;
      minus.remove(); plus.remove();
      at(range, [-10, 0, L.slider[2] + 20, L.slider[3]]);
      at(box, [L.value[0] - sx, L.value[1] - sy, L.value[2], L.value[3]]);
      text(b, L.unit, "µs", "esc-unit-us");
      text(b, L.label, name);
      helpAt(b, L.help, nums, "below");
      return r;
    };
    return {
      el: u, nx: n, bl: b, title: u.querySelector(".esc-title"),
      bar: u.querySelector(".esc-bar"), stat: u.querySelector(".esc-stat"), statNum: 188,
      nxDir: dd(n, UNIT.nxDir, "Motor Direction", "146,147", O.dir, "below"),
      nxLed: dd(n, UNIT.nxLed, "LED Configuration", "148", O.led, "below"),
      blDir: dd(b, UNIT.blDir, "Motor Direction", "146,147", O.dir, "below"),
      blLed: dd(b, UNIT.blLed, "LED Configuration", "148", O.led, "below"),
      ppmMin: ppm(UNIT.ppmMin, "PPM Min Throttle", "153", 125, 1000),
      ppmMax: ppm(UNIT.ppmMax, "PPM Max Throttle", "154", 129, 1504),
    };
  });

  // ── 도움 말풍선(원본 ESCHelper · Canvas/Help Bubble(Left)·(Right)) ──
  // 공통 칸(anchorPosition 1) = Left 말풍선: ? 가운데 + (0.23, 0) 월드 = 오른쪽 24.84px — 왼쪽을 가리키는 삼각형 40×32, 상자 360×90 은 +19.9 부터
  // ESC 칸(anchorPosition 0) = Right 말풍선: ? 가운데 + (0, −0.14) 월드 = 아래 15.12px — 90° 돌린 삼각형 20×26(위를 가리킴),
  //   상자 360×60 은 왼쪽 313.1 · 아래 41.6 이 상자 왼쪽 가운데. 글: NotoSansKR-Medium 16 검정 가운데 · 줄바꿈 없음. 색 (0.804, 0.851, 0.847)
  // 캔버스 1 월드 = 108 무대 px(Main Camera 직교 크기 5). 나가면 화면 밖으로(= 숨김).
  const bubble = Object.assign(document.createElement("div"), { id: "escBubble", className: "abs hidden" });
  bubble.innerHTML = `<i class="cone"></i><div class="box"><span></span></div>`;
  document.getElementById("stage").appendChild(bubble);
  const center = (el) => { const s = document.getElementById("stage").getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / 1920;
    return [(r.left + r.width / 2 - s.left) / k, (r.top + r.height / 2 - s.top) / k]; };
  for (const h of helps) {
    h.onpointerenter = () => {
      bubble.querySelector("span").textContent = h.dataset.h.split(",").map((n) => t(+n)).join("\n");
      const [cx, cy] = center(h), below = h.dataset.side === "below";
      bubble.className = "abs " + (below ? "right" : "left");
      bubble.style.left = px(below ? cx : cx + 24.84);
      bubble.style.top = px(below ? cy + 15.12 : cy);
    };
    h.onpointerleave = () => bubble.classList.add("hidden");
  }

  // ── 드롭다운 펼친 목록(원본 Dropdown (Legacy)/Template — Unity 기본: 항목 32 · 여백 2 · 최대 400 · 1.6 겹침) — 창(OS) 목록 대신 ──
  for (const sel of [...common.querySelectorAll("select.dd"), ...unitsHost.querySelectorAll("select.dd")]) {
    const open = () => dropList(sel, { items: [...sel.options].map((o) => o.textContent), selected: sel.selectedIndex, cls: "esc", itemH: 32, pad: 2, maxH: 400, overlap: 1.6,
      onPick: (i) => { if (i !== sel.selectedIndex) { sel.selectedIndex = i; sel.dispatchEvent(new Event("change", { bubbles: true })); } } });
    sel.addEventListener("mousedown", (ev) => { ev.preventDefault(); open(); });
    sel.addEventListener("keydown", (ev) => { if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); open(); } });
  }

  // ── ESCObjectsManager ──
  const latest = { nx: null, bl: null }; // SerialManager.EscConfigNovaX / EscConfigBLHeli_S (마지막으로 받은 값 — 보낼 때 고쳐 씀)
  const setKind = (i, kind) => { units[i].nx.classList.toggle("hidden", kind !== "nx"); units[i].bl.classList.toggle("hidden", kind !== "bl"); };
  const has = (i, kind) => !units[i][kind].classList.contains("hidden");
  const showCommon = (kind) => { nxEl.classList.toggle("hidden", kind !== "nx"); blEl.classList.toggle("hidden", kind !== "bl"); };
  function statusSet(i, num) { const u = units[i]; u.statNum = num; u.stat.textContent = t(num); u.stat.classList.remove("hidden"); } // EscStatusSet
  function statusOff(i) { units[i].bar.classList.add("hidden"); units[i].stat.classList.add("hidden"); } // EscStatusOff
  onLang(() => units.forEach((u) => { if (u.statNum) u.stat.textContent = t(u.statNum); }));

  return {
    units, latest, statusSet, statusOff, has,
    hasContent: (i) => has(i, "nx") || has(i, "bl"),
    /** 원본 IsAllEscSame: 한 종류가 넷 다 켜져 있고 다른 종류는 하나도 없을 때만 참 */
    isAllEscSame() {
      const all = (k) => units.every((_, i) => has(i, k)), none = (k) => units.every((_, i) => !has(i, k));
      return (all("bl") && none("nx")) || (all("nx") && none("bl"));
    },
    /** 진행 막대(ESC 업데이트) — value 0~1, 글자는 그대로(원본 EscStatusSliders · EscStatusTexts) */
    progress(i, value, text) {
      const u = units[i];
      u.bar.classList.remove("hidden"); u.bar.firstElementChild.style.width = Math.min(1, Math.max(0, value)) * 100 + "%";
      u.stat.classList.remove("hidden"); u.stat.textContent = text; u.statNum = 0;
    },
    progressText(i, value, text) { const u = units[i]; u.bar.firstElementChild.style.width = Math.min(1, Math.max(0, value)) * 100 + "%"; u.stat.textContent = text; u.statNum = 0; },
    hideCommon: () => showCommon(null),
    /** EscConfigNovaX 받음 → UpdateCurrentData(0) → ESCNovaX.UpdateData(+UpdateData2) */
    onNovaX(m) {
      const i = m.motorIndex;
      latest.nx = { ...m };
      showCommon("nx");
      if (!units[i]) return; // 원본은 범위 밖 번호면 예외
      setKind(i, "nx");
      if (m.Eep_FW_Main_Revision === 0xFF && m.Eep_FW_Sub_Revision === 0xFF) statusSet(i, 180); // 업데이트하다 멈춘 듯
      nx.minStartupPower.setValue(m.Eep_Pgm_Startup_Power_Min); nx.maxStartupPower.setValue(m.Eep_Pgm_Startup_Power_Max);
      nx.motorTiming.setValue(m.Eep_Pgm_Comm_Timing); nx.rpmPowerProtection.setValue(m.Eep_Pgm_Rpm_Power_Slope);
      nx.demagComp.set(m.Eep_Pgm_Demag_Comp - 1); nx.beepStrenth.setValue(m.Eep_Pgm_Beep_Strength); nx.beaconDelay.set(m.Eep_Pgm_Beacon_Delay);
      nx.temperatureProtection.set(m.Eep_Pgm_Temp_Prot_Enable); nx.brakeOnstop.set(m.Eep_Pgm_Brake_On_Stop !== 0);
      nx.maximumBrakingStrength.setValue(m.Eep_Pgm_Braking_Strength);
      units[i].title.textContent = `ESC ${i + 1}: NovaX, v${m.Eep_FW_Main_Revision}.${m.Eep_FW_Sub_Revision}, ${m.Eep_Pgm_Pwm_Freq}kHz`;
      units[i].nxDir.set(m.Eep_Pgm_Direction - 1); units[i].nxLed.set(m.Eep_Pgm_LED_Control);
    },
    /** EscConfigBLHeliS 받음 → UpdateCurrentData(1) → ESCBLHeli_S.UpdateData(+UpdateData2) */
    onBLHeli(m) {
      const i = m.motorIndex;
      latest.bl = { ...m };
      showCommon("bl");
      if (!units[i]) return;
      setKind(i, "bl");
      if (m.Eep_FW_Main_Revision === 0xFF && m.Eep_FW_Sub_Revision === 0xFF) statusSet(i, 180);
      bl.startupPower.set(m.Eep_Pgm_Startup_Pwr - 1); bl.tempProtection.set(m.Eep_Pgm_Temp_Prot_Enable);
      bl.brakeOnStop.set(m.Eep_Pgm_Brake_On_Stop !== 0); bl.demagComp.set(m.Eep_Pgm_Demag_Comp - 1);
      bl.motorTiming.setValue(m.Eep_Pgm_Comm_Timing); bl.beepStrength.setValue(m.Eep_Pgm_Beep_Strength);
      bl.beaconStrength.setValue(m.Eep_Pgm_Beacon_Strength); bl.BeaconDelay.set(m.Eep_Pgm_Beacon_Delay);
      units[i].title.textContent = `ESC ${i + 1}: BLHeli_S, v${m.Eep_FW_Main_Revision}.${m.Eep_FW_Sub_Revision}`;
      units[i].blDir.set(m.Eep_Pgm_Direction - 1); units[i].blLed.set(m.Eep_Pgm_LED_Control);
      units[i].ppmMin.setValue(m.Eep_Pgm_Min_Throttle); units[i].ppmMax.setValue(m.Eep_Pgm_Max_Throttle - 126);
    },
    /** ESCNovaX.SendESCData(num) — 방향은 ESC 값 그대로 1 = Normal · 2 = Reversed(받을 때 -1 했으므로 보낼 때 +1). 설정을 쓰고 되읽은 묶음을 돌려줌 */
    sendNovaX(num) {
      const e = (latest.nx ??= { ...NOVAX_DEF }), u = units[num];
      Object.assign(e, {
        motorIndex: num, Eep_Pgm_Startup_Power_Min: R(nx.minStartupPower.value()), Eep_Pgm_Startup_Power_Max: R(nx.maxStartupPower.value()),
        Eep_Pgm_Rpm_Power_Slope: R(nx.rpmPowerProtection.value()), Eep_Pgm_Direction: R(u.nxDir.get()) + 1,
        Eep_Pgm_Braking_Strength: R(nx.maximumBrakingStrength.value()), Eep_Pgm_Comm_Timing: R(nx.motorTiming.value()),
        Eep_Pgm_Beep_Strength: R(nx.beepStrenth.value()), Eep_Pgm_Beacon_Delay: nx.beaconDelay.get(), Eep_Pgm_Demag_Comp: nx.demagComp.get() + 1,
        Eep_Pgm_Temp_Prot_Enable: nx.temperatureProtection.get(), Eep_Pgm_Brake_On_Stop: nx.brakeOnstop.get() ? 1 : 0, Eep_Pgm_LED_Control: R(u.nxLed.get()),
      });
      return api.escConfig(NOVAX.map((k) => e[k] & 0xff));
    },
    /** ESCBLHeli_S.SendESCData(num) */
    sendBLHeli(num) {
      const e = (latest.bl ??= { ...BLHELI_DEF }), u = units[num];
      Object.assign(e, {
        motorIndex: num, Eep_Pgm_Startup_Pwr: R(bl.startupPower.get()) + 1, Eep_Pgm_Temp_Prot_Enable: bl.tempProtection.get(),
        Eep_Pgm_Brake_On_Stop: bl.brakeOnStop.get() ? 1 : 0, Eep_Pgm_Demag_Comp: bl.demagComp.get() + 1,
        Eep_Pgm_Comm_Timing: Math.trunc(bl.motorTiming.value()), Eep_Pgm_Beep_Strength: Math.trunc(bl.beepStrength.value()),
        Eep_Pgm_Beacon_Strength: Math.trunc(bl.beaconStrength.value()), Eep_Pgm_Beacon_Delay: bl.BeaconDelay.get(),
        Eep_Pgm_Direction: u.blDir.get() + 1, Eep_Pgm_LED_Control: u.blLed.get(),
        Eep_Pgm_Min_Throttle: R(u.ppmMin.value()), Eep_Pgm_Max_Throttle: R(u.ppmMax.value() + 126),
      });
      return api.escConfig(BLHELI.map((k) => e[k] & 0xff));
    },
    /** ESCNovaX.ResetData + ESCBLHeli_S.ResetData — 기본 생성자 값으로(보내지는 않음) */
    resetData() {
      const n = NOVAX_DEF, b = BLHELI_DEF;
      nx.minStartupPower.setValue(n.Eep_Pgm_Startup_Power_Min); nx.maxStartupPower.setValue(n.Eep_Pgm_Startup_Power_Max);
      nx.motorTiming.setValue(n.Eep_Pgm_Comm_Timing); nx.rpmPowerProtection.setValue(n.Eep_Pgm_Rpm_Power_Slope);
      nx.demagComp.set(n.Eep_Pgm_Demag_Comp - 1); nx.beepStrenth.setValue(n.Eep_Pgm_Beep_Strength); nx.beaconDelay.set(n.Eep_Pgm_Beacon_Delay);
      nx.temperatureProtection.set(n.Eep_Pgm_Temp_Prot_Enable); nx.brakeOnstop.set(n.Eep_Pgm_Brake_On_Stop !== 0);
      nx.maximumBrakingStrength.setValue(n.Eep_Pgm_Braking_Strength);
      bl.startupPower.set(b.Eep_Pgm_Startup_Pwr - 1); bl.tempProtection.set(b.Eep_Pgm_Temp_Prot_Enable); bl.brakeOnStop.set(b.Eep_Pgm_Brake_On_Stop !== 0);
      bl.demagComp.set(b.Eep_Pgm_Demag_Comp - 1); bl.motorTiming.setValue(b.Eep_Pgm_Comm_Timing); bl.beepStrength.setValue(b.Eep_Pgm_Beep_Strength);
      bl.beaconStrength.setValue(b.Eep_Pgm_Beacon_Strength); bl.BeaconDelay.set(b.Eep_Pgm_Beacon_Delay);
      for (const u of units) {
        u.nxDir.set(n.Eep_Pgm_Direction - 1); u.nxLed.set(n.Eep_Pgm_LED_Control);
        u.blDir.set(b.Eep_Pgm_Direction - 1); u.blLed.set(b.Eep_Pgm_LED_Control);
        u.ppmMin.setValue(b.Eep_Pgm_Min_Throttle); u.ppmMax.setValue(b.Eep_Pgm_Max_Throttle - 126);
      }
    },
    /** ESCManager.ResetPanels: 공통 칸 숨김 · ESC 칸 8개 끔 · 이름 "ESC :" */
    resetPanels() {
      showCommon(null);
      units.forEach((u, i) => { setKind(i, null); u.title.textContent = "ESC :"; });
    },
  };
}
