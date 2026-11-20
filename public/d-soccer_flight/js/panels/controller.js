// 조종기 탭 — 조종기 SETUP 메뉴와 같은 순서(LIGHT → FUNCTION → R/P · YAW · THR CURVE → CAL & RESET · 2.13.0)로 같은 값을 읽고 씀 + 드론의 충돌 자세 유지
// 원본 Unity 에는 없는 탭. 이름 = 앱 말(언어 표) + 조종기 화면 이름(작게 · 조종기 1.6.0 과 같은 글자), 틀은 다른 탭의 칸·단추·슬라이더를 그대로 씀
// LIGHT 칸과 수평 보정(LEVEL CAL)은 2.13.0 에 상태 탭에서 옮겨 옴 — 같은 일을 하는 단추가 두 곳에 있었음
// 꾸러미: DataType.Configuration — 조종기 22바이트(펌웨어 Protocol::ConfigurationController) · 드론 2바이트(Protocol::Configuration)
//         DataType.Deadzone — 조종기 3바이트(조종기 1.3.0 부터) · 옛 조종기는 답하지 않음 → 데드존 칸을 막고 그래프는 기본값
// 드론 설정(충돌 자세)은 조종기만 꽂혀 있어도 바꿀 수 있음 — 조종기 1.3.0 이 맡아 두었다가 드론과 연결되면 보냄(drone_setting.js)
import { store, on } from "../store.js";
import { t, applyStatic, onLang } from "../i18n.js";
import { send, P } from "../proto.js";
import { notify } from "../shell.js";
import { sliderRow, buttonTransition } from "../widgets.js";
import { drawCalib, calibPick } from "./stick_curve.js";
import { startDroneSetting, stepText, Step } from "../drone_setting.js";

const OPT = P.raw.ConfigurationOption;
// 충돌 자세 유지 세기 0 ~ 100(드론 1.11.0 · 조종기 1.5.0) — 꾸러미: 첫 바이트 = 가장 가까운 옛 단계(옛 드론은 이것만) · 둘째 = 0x80 | 세기
const HOLD_FLAG = 0x80;
const holdMode = (s) => (s === 0 ? 0 : s <= 50 ? 1 : 2);
const holdOf = (m) => (m.reserved & HOLD_FLAG ? m.reserved & 0x7f : [0, 50, 100][m.modeCrashHold] ?? null);   // 옛 드론은 단계만 → 0 · 50 · 100
// 고르기 단추 하나 = 옵션 비트 하나: [꾸러미에서 읽기, 꾸러미에 쓰기]
const bit = (mask, onFirst) => [(c) => (((c.option & mask) !== 0) === onFirst ? 0 : 1), (c, i) => { c.option = (i === 0) === onFirst ? c.option | mask : c.option & ~mask; }];
// 기능 줄: [앱 이름(언어 표 번호), 조종기 화면 이름, 값 글자들, 꾸러미에서 읽기, 꾸러미에 쓰기] — 조종기 FUNCTION 과 같은 순서
const FUNC = [
  [232, "FHSS", ["A", "X"], ...bit(OPT.FhssAOff, false)],
  [233, "BACKLIGHT", ["O", "X"], ...bit(OPT.Backlight, true)],
  [234, "SOUND", ["O", "X"], ...bit(OPT.Buzzer, true)],
  [235, "VIBRATION", ["O", "X"], ...bit(OPT.Vibrator, true)],
  [236, "PAIR HINT", ["O", "X"], ...bit(OPT.PairAlarm, true)],
  [237, "STICK MODE", ["1", "2"], ...bit(OPT.JoystickMode1, true)],
  [238, "SPEED", ["1(40%)", "2(70%)", "3(100%)"], (c) => c.controlSpeed - 1, (c, i) => { c.controlSpeed = i + 1; }],
];
// 곡선: [앱 이름(언어 표 번호), 조종기 화면 이름, 꾸러미 칸]
const CURVES = [[240, "R/P CURVE", "rnp"], [241, "YAW CURVE", "yaw"], [242, "THR CURVE", "thr"]];
// LIGHT 포지션 색 — 조종기 LIGHT > POSITION 목록과 같은 순서(GREEN · PINK · YELLOW · CYAN · WHITE) · n = 원본 LEDSetting 번호 · 색 = 상태 탭에 있던 그대로
const POS = [
  { n: 2, rgb: [0, 255, 0], c: "#31cd31", h: "#2fc52f", p: "#24a024" }, { n: 6, rgb: [255, 0, 255], c: "#f42bf4", h: "#ea29ea", p: "#bf1fbf" },
  { n: 3, rgb: [255, 255, 0], c: "#fefe00", h: "#f4f400", p: "#c7c700" }, { n: 4, rgb: [0, 255, 255], c: "#00fefe", h: "#00f4f4", p: "#00c7c7" },
  { n: 5, rgb: [255, 255, 255], c: "#ffffff", h: "#f5f5f5", p: "#c8c8c8" },
];
const KEYS = ["option", "controlSpeed", "position", "team", ...CURVES.flatMap(([, , k]) => [1, 2, 3, 4, 5, 6].map((n) => k + n))];
// 데드존 세 줄(조종기 1.6.0 곡선 화면 첫 줄 DZ 와 같은 값) — 꾸러미 칸 · 최대 % · 기본(옛 조종기 그래프) · 그래프 색(PID 탭 축 색)
const DZ = [
  { key: "rollPitch", curve: "rnp", max: 30, def: 9, color: "#ed1c24" },
  { key: "yaw", curve: "yaw", max: 30, def: 9, color: "#3ebfff" },
  { key: "throttle", curve: "thr", max: 20, def: 7, color: "#54dc91" },
];

// 스틱 곡선 칸: 곡선마다 한 줄(조종기 CURVE 화면처럼 왼쪽 그래프 + 오른쪽 S1~S6 값 · 그래프 가로:세로 = 조종기 칸 64:37) — 줄 위쪽 끝(px)
const ROW = (r) => 70 + r * 162;
const FROW = (i) => 70 + i * 58;   // 기능 줄 위쪽 끝(px)

const seg = (id, items) => `<div class="seg" id="${id}">${items.map((s, i) => `<button data-i="${i}">${s}</button>`).join("")}</div>`;

export function initController(root) {
  root.innerHTML = `
    <div id="ct-light" class="box ct-ctl"><h3><span data-i18n="228"></span><span class="ct-lcd">LIGHT</span></h3><div class="rule"></div>
      <div class="ct-k" style="top:74px" data-fit><span data-i18n="229"></span><span class="ct-lcd">TEAM</span></div>
      <div class="team"><div class="red" data-c="0">RED</div><div class="blue" data-c="1">BLUE</div></div>
      <div class="ct-k" style="top:150px" data-fit><span data-i18n="230"></span><span class="ct-lcd">POSITION</span></div>
      ${POS.map((p, i) => `<div class="pos" data-n="${p.n}" style="left:${230 + i * 52}px;top:147px;--c:${p.c};--h:${p.h};--p:${p.p}"></div>`).join("")}
    </div>
    <div id="ct-func" class="box"><h3><span data-i18n="231"></span><span class="ct-lcd">FUNCTION</span></h3><div class="rule"></div>
      ${FUNC.map(([no, lcd, vals], i) => `<div class="ct-k ct-ctl" style="top:${FROW(i)}px" data-fit><span data-i18n="${no}"></span><span class="ct-lcd">${lcd}</span></div><div class="ct-ctl" style="position:absolute;left:230px;top:${FROW(i)}px">${seg("ct-f" + i, vals)}</div>`).join("")}
      <div class="ct-k" style="top:${FROW(7)}px"><span data-i18n="239"></span><span class="ct-lcd">C.HOLD</span>&nbsp;<span class="ct-help" id="ct-hold-help">ⓘ</span></div><div id="ct-hold" style="position:absolute;left:230px;top:${FROW(7) + 5}px"></div>
      <div class="ct-note" id="ct-hold-note"></div>
      <div class="ct-note ct-pend" id="ct-hold-pend"></div>
    </div>
    <div id="ct-curve" class="box"><h3><span data-i18n="191"></span><span class="ct-lcd">CURVE</span></h3><div class="rule"></div>
      ${CURVES.map(([no, lcd], r) => `<div class="ct-c ct-c2" style="top:${ROW(r)}px" data-fit><span data-i18n="${no}"></span><span class="ct-lcd">${lcd}</span></div><canvas class="ct-cal" id="ct-cal${r}" width="520" height="300" style="top:${ROW(r)}px"></canvas>`).join("")}
      ${DZ.map((d, r) => `<div class="ct-dzk" style="top:${ROW(r) + 40}px" data-fit><span data-i18n="243"></span><span class="ct-lcd">DZ</span>${r === 0 ? ' <span class="ct-help" id="ct-dz-help">ⓘ</span>' : ""}</div>`).join("")}
      <div class="ct-legend" data-i18n="223"></div>
      <div class="ct-dzold" id="ct-dz-old" data-i18n="214"></div>
      <button class="btn-line" id="ct-apply" data-i18n="192"></button>
    </div>
    <div id="ct-reset" class="box"><h3><span data-i18n="244"></span><span class="ct-lcd">CAL &amp; RESET</span></h3><div class="rule"></div>
      <button class="btn-line" id="ct-imu"><span data-i18n="245"></span><span class="ct-lcd">LEVEL CAL</span></button><span class="ct-help" id="ct-imu-help">ⓘ</span><button class="btn-line" id="ct-joy"><span data-i18n="246"></span><span class="ct-lcd">STICK CAL</span></button><button class="btn-line" id="ct-def"><span data-i18n="247"></span><span class="ct-lcd">FACTORY RST</span></button>
    </div>
    <div id="ct-block" class="box hidden"><span data-i18n="193"></span></div>`;
  applyStatic(root);
  const $ = (s) => root.querySelector(s);
  // 조종기 화면 이름이 앱 이름과 같으면(영어 Sound · SOUND 등) 작은 이름은 숨김 — 언어를 바꿀 때마다
  const norm = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const same = (a, b) => a !== "" && (a === b || a === b + "S");   // Functions · FUNCTION 도 같은 말로 봄
  const lcdDup = () => root.querySelectorAll(".ct-lcd").forEach((el) => (el.hidden = same(norm(el.previousElementSibling?.textContent), norm(el.textContent))));
  onLang(lcdDup);
  lcdDup();
  const toCtl = P.DeviceType.Controller, toDrone = P.DeviceType.Drone;
  startDroneSetting();

  // ── 스틱 곡선: 곡선마다 그래프(왼쪽) + S1~S6 값(오른쪽 세로 · - + 는 조종기 ▲▼ 와 같은 한 칸) — 조종기 CURVE 화면 배치 ──
  const rows = {}, labs = {};
  const sel = [0, 0, 0];   // 곡선마다 고른 점(조종기 화면 첫 자리 = S1)
  CURVES.forEach(([, , k], c) => [1, 2, 3, 4, 5, 6].forEach((n) => {
    const top = ROW(c) + (n - 1) * 25;   // 조종기 화면처럼 S1~S6 을 세로로(그래프 높이 150 에 6줄)
    const el = sliderRow({ min: 0, max: 100, step: 1, decimals: 0 });
    el.classList.add("ct-row2");
    el.style.left = "472px"; el.style.top = top + "px";
    $("#ct-curve").appendChild(el);
    rows[k + n] = el;
    el.addEventListener("change", () => drawAll());
    el.addEventListener("pointerdown", () => { sel[c] = n - 1; drawAll(); });   // 값 칸을 만지면 그 점을 고름
    const lab = document.createElement("div");
    lab.className = "ct-s"; lab.textContent = "S" + n;
    lab.style.left = "436px"; lab.style.top = top + "px";
    $("#ct-curve").appendChild(lab);
    labs[k + n] = lab;
  }));

  // ── 데드존 값: 곡선 줄마다 이름 밑(그래프에 회색 띠로 보임 — 따로 그래프 칸을 두지 않음 · 이사님 #ob6f2f758) ──
  const dzRows = DZ.map((d, i) => {
    const el = sliderRow({ min: 0, max: d.max, step: 1, decimals: 0 });
    el.classList.add("ct-row2", "ct-dzrow");
    el.style.left = "24px";
    el.style.top = ROW(i) + 66 + "px";
    $("#ct-curve").appendChild(el);
    el.addEventListener("change", () => drawAll());
    return el;
  });
  $("#ct-dz-help").title = t(213);

  // ── 조종기 설정: 읽기 → 화면 · 화면 → 쓰기(바꾼 칸만 고친 22바이트 전체) ──
  let cfg = null;  // 조종기가 마지막으로 알려 준 값
  let dz = null;   // 조종기 데드존(옛 조종기 = null)
  const bytes = (c) => KEYS.map((k) => c[k] & 0xff);
  const mark = (id, i) => root.querySelectorAll(`#${id} button`).forEach((b, k) => b.classList.toggle("sel", k === i));
  const curveNow = (k) => [1, 2, 3, 4, 5, 6].map((n) => parseInt(rows[k + n].get()) || 0);
  const dzNow = (i) => (dz ? +dzRows[i].get() || 0 : DZ[i].def);
  function drawAll() {
    DZ.forEach((d, i) => {
      drawCalib($("#ct-cal" + i), { kind: d.curve, dz: dzNow(i), curve: curveNow(d.curve), sel: sel[i], color: d.color });
      [1, 2, 3, 4, 5, 6].forEach((n) => labs[d.curve + n].classList.toggle("on", n - 1 === sel[i]));
    });
  }
  // 그래프에서 점을 눌러 고름(조종기 ◀▶ 와 같은 일)
  DZ.forEach((d, i) => ($("#ct-cal" + i).onclick = (e) => {
    const cv = e.currentTarget, r = cv.getBoundingClientRect();
    sel[i] = calibPick(cv, e.clientX - r.left, d.curve, dzNow(i));
    drawAll();
  }));
  const render = () => {
    FUNC.forEach(([, , , get], i) => mark("ct-f" + i, cfg ? get(cfg) : -1));
    if (cfg) CURVES.forEach(([, , k]) => [1, 2, 3, 4, 5, 6].forEach((n) => rows[k + n].set(cfg[k + n])));
    drawAll();
  };
  // 데드존 칸 막기 · 안내만(값은 그대로) — 조종기 설정 답이 올 때마다 부름. 값까지 바꾸면 '적용' 전에 고친 데드존이 지워짐
  const markDz = () => {
    dzRows.forEach((el) => el.classList.toggle("ct-off", !dz));
    $("#ct-dz-old").classList.toggle("hidden", !!dz || !cfg);   // 옛 조종기(설정은 읽었는데 데드존 답 없음)일 때만 안내
    drawAll();
  };
  // 조종기가 알려 준 데드존을 칸에 넣음 — 데드존 답이 왔을 때 · 연결이 끊겼을 때만
  const renderDz = () => {
    DZ.forEach((d, i) => dzRows[i].set(dz ? dz[d.key] : d.def));   // 옛 조종기는 기본값을 막은 채 보여 줌
    markDz();
  };
  const write = (c) => send(P.DataType.Configuration, bytes(c), toCtl); // 조종기는 적용한 뒤의 값을 돌려줌 → on("ConfigurationController")
  FUNC.forEach(([, , , , set], i) => root.querySelectorAll(`#ct-f${i} button`).forEach((b) => (b.onclick = () => {
    if (!cfg) return;
    const c = { ...cfg }; set(c, +b.dataset.i); write(c);
  })));
  $("#ct-apply").onclick = () => {
    if (!cfg) return;
    const c = { ...cfg };
    CURVES.forEach(([, , k]) => [1, 2, 3, 4, 5, 6].forEach((n) => (c[k + n] = parseInt(rows[k + n].get()) || 0)));
    // 조종기 메뉴와 같은 조건: 뒤로 갈수록 커지거나 같아야 함 — 아니면 조종기가 거부(값이 그대로 돌아옴)
    // 데드존은 누른 순간의 값을 잡아 둠 — 조종기 설정 답(0.15초 안)이 화면을 다시 그린 뒤에 읽으면 옛 값이 나감(2.9.0 HP 실기에서 잡음)
    const dzNew = DZ.map((d, i) => Math.min(d.max, Math.max(0, parseInt(dzRows[i].get()) || 0)));
    write(c);
    if (dz) setTimeout(() => send(P.DataType.Deadzone, dzNew, toCtl), 150);
    notify(106);
  };
  on("ConfigurationController", (m) => { cfg = m; render(); markDz(); });
  on("Deadzone", (m) => { dz = m; renderDz(); });

  // ── 보정·초기화 세 가지(조종기 CAL & RESET 과 같은 함수를 부르는 명령) ──
  const cmd = (type, note) => { send(P.DataType.Command, [type, 0], toCtl); setTimeout(ask, 300); notify(note); };
  // 수평 보정(LEVEL CAL) = 드론 가속도계 교정 — 지금 연결된 장치로 보냄(드론만 꽂아도 됨 · 조종기면 조종기가 드론에 넘김 · 2.12 까지 상태 탭 단추와 같은 명령)
  $("#ct-imu").onclick = () => { send(P.DataType.Command, [P.CommandType.ClearBias, 0]); notify(104); };
  const imuHelp = () => ($("#ct-imu-help").title = t(20) + "\n" + t(21));
  onLang(imuHelp);
  imuHelp();
  $("#ct-joy").onclick = () => cmd(P.CommandType.ClearJoystick, 248);
  $("#ct-def").onclick = () => cmd(P.CommandType.SetDefault, 249);
  [$("#ct-apply"), $("#ct-imu"), $("#ct-joy"), $("#ct-def")].forEach(buttonTransition);

  // ── LIGHT: 팀 색 · 포지션 색(조종기 LIGHT 와 같은 값 · 조종기를 꽂았을 때만 — 드론만이면 가림) ──
  const team = [...root.querySelectorAll("#ct-light .team div")], pos = [...root.querySelectorAll("#ct-light .pos")];
  const markTeam = (i) => team.forEach((el, k) => el.classList.toggle("sel", k === i));
  const markPos = (n) => pos.forEach((el) => el.classList.toggle("sel", +el.dataset.n === n));
  markTeam(0); // 원본 첫 화면: RED 가 골라진 모습
  team.forEach((el) => (el.onclick = () => {
    const c = +el.dataset.c; markTeam(c);
    send(P.DataType.LightMode, [P.LedMode.TeamRgbHold, 255, 0, c ? 0 : 255, 0, c ? 255 : 0], toCtl);
  }));
  pos.forEach((el) => (el.onclick = () => {
    const p = POS.find((x) => x.n === +el.dataset.n); markPos(p.n);
    send(P.DataType.LightMode, [P.LedMode.PositionHold, 255, 0, ...p.rgb], toCtl);
  }));
  on("LightMode", (m) => {
    if (m.mode === P.LedMode.TeamRgbHold || m.mode === P.LedMode.TeamRgbFlicker) markTeam(m.r === 255 ? 0 : m.b === 255 ? 1 : -1);
    else if (m.mode === P.LedMode.PositionHold) markPos(POS.find((p) => p.rgb.join() === [m.r, m.g, m.b].join())?.n ?? -1);
  });

  // ── 충돌 자세 유지 세기 0 ~ 100(드론 값 — 조종기를 거쳐도, 드론에 바로 꽂아도 같은 꾸러미) ──
  // 조종기 1.3.0 부터 드론과 연결이 안 돼 있어도 받아 맡아 둠 → 드론 값을 몰라도 고를 수 있음
  // 옛 드론(1.10.x)은 첫 바이트(단계)만 받음 → 0 · 50 · 100 이 아닌 값은 가장 가까운 단계로 들어가고 그 값(50 등)으로 돌아옴
  let hold = null, holdTimer = null, holdSetting = false;   // holdSetting: 받은 값을 칸에 넣는 중(그때의 change 는 보내지 않음)
  const holdRow = sliderRow({ min: 0, max: 100, step: 1, decimals: 0, w: 150 });
  holdRow.classList.add("ct-holdrow");
  $("#ct-hold").appendChild(holdRow);
  const renderHold = () => {
    const usable = hold !== null || !!(store.isController && store.droneSetting);   // 드론 값을 알거나 조종기가 맡아 둘 수 있음
    holdRow.classList.toggle("ct-off", !usable);
    if (hold !== null) { holdSetting = true; holdRow.set(hold); holdSetting = false; }
    const note = $("#ct-hold-note");
    note.textContent = hold === null ? t(194) : hold === 0 ? t(227) : t(hold <= 50 ? 225 : 226).replace("{v}", hold);
    const s = store.isController ? store.droneSetting : null;
    const n = s ? stepText(s.crashHold, s.link) : null;
    $("#ct-hold-pend").textContent = n !== null && s.crashHold !== Step.Done ? t(n) : "";
    $("#ct-hold-help").title = t(224);
  };
  holdRow.addEventListener("change", () => {
    if (holdSetting) return;
    // 끌어 움직이는 동안은 보내지 않고 멈춘 뒤 0.3초에 한 번(조종기 · 드론 저장을 여러 번 하지 않게)
    const v = Math.min(100, Math.max(0, parseInt(holdRow.get()) || 0));
    if (hold === null && !(store.isController && store.droneSetting)) return; // 드론 값을 모르고 맡길 수도 없음(옛 드론 · 옛 조종기 · 연결 전)
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      send(P.DataType.Configuration, [holdMode(v), HOLD_FLAG | v], toDrone);
      setTimeout(() => send(P.DataType.Request, [P.DataType.Configuration], toDrone), 200);
    }, 300);
  });
  on("Configuration", (m) => { hold = holdOf(m); renderHold(); });
  on("droneSetting", renderHold);
  onLang(renderHold);

  // ── 연결·탭 ──
  function ask() {
    if (!store.connected) return;
    if (store.isController) {
      send(P.DataType.Request, [P.DataType.Configuration], toCtl);
      setTimeout(() => send(P.DataType.Request, [P.DataType.Deadzone], toCtl), 150); // 조종기는 USB 답을 하나씩 — 바로 이어 물으면 두 번째 답이 버려질 수 있음
    }
    send(P.DataType.Request, [P.DataType.Configuration], toDrone);
  }
  const block = $("#ct-block");
  on("link", ({ now }) => {
    if (now.state !== "connected") { cfg = null; dz = null; hold = null; render(); renderDz(); renderHold(); }
    const droneOnly = store.connected && store.isDrone;
    block.classList.toggle("hidden", !droneOnly); root.classList.toggle("ct-drone-only", droneOnly); // 드론만 꽂았으면 조종기 칸을 가림(상태 탭 LED 와 같은 규칙)
  });
  on("page", (p) => { if (p === "controller") ask(); });
  render(); renderDz(); renderHold();
}
