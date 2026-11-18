// 상태 탭 — 원본 Setup_Content (DroneInformationState · LEDSetting · Motor_Graph · DroneMove)
import { api } from "../api.js";
import { store, on } from "../store.js";
import { t, onLang, applyStatic } from "../i18n.js";
import { Drone3D } from "../drone3d.js";
import { AttitudeGraph } from "../graph.js";
import { send, P } from "../proto.js";
import { notify } from "../shell.js";
import { dropList, buttonTransition } from "../widgets.js";

const ROWS = [ // [글자 번호, 값 함수]
  [24, (s) => s.state && ({ 16: t(67), 17: t(68), 18: t(69), 19: t(70) }[s.state.modeFlight] ?? "-")],
  [25, (s) => s.state && s.state.batteryPercent + "%"],
  [26, (s) => s.state && +(s.state.batteryVoltage * 0.1).toFixed(1) + "V"],
  [27, (s) => s.state && s.state.avgSpeed + "m/s"],
  // 조종기를 거치면 조종기가 응답률(%)로 바꿔 보냄 · 드론에 바로 꽂으면 드론이 1초에 받은 꾸러미 수(255 에서 잘림)를 보냄 — 그때는 %가 아니라 "/s"
  [28, (s) => s.state && (store.isDrone ? (s.state.receivedRf >= 255 ? "255+/s" : s.state.receivedRf + "/s") : s.state.receivedRf + "%")],
  [86, (s) => s.count && s.count.timeRunFlightSec + "s"],
  [87, (s) => s.count && s.count.countTakeOff],
  [88, (s) => s.count && s.count.countLanding],
  [89, (s) => s.count && s.count.countAccident],
  [0, null], // 펌웨어 + 업데이트 확인 버튼
  // 판 = 주.부.수 — 펌웨어 판 칸은 [수 u16 · 부 · 주](낮은 바이트 먼저)를 큰 바이트 먼저로 읽은 값이라 수 = 위 두 바이트를 뒤집어 읽음
  [29, (s) => s.info && `v${s.info.version & 0xff}.${(s.info.version >> 8) & 0xff}.${((s.info.version >>> 24) & 0xff) | (((s.info.version >>> 16) & 0xff) << 8)}`],
  [30, (s) => s.info && `${s.info.year}.${s.info.month}.${s.info.day}`],
];
const POS = [ // 원본 위치(칸 기준 중심)와 색(배포판 Image m_Color) — LEDSetting.Change_PositionLED 번호 2~6
  // h · p = ColorTint 올림 × 0.961 · 누름 × 0.784 (선형 색 공간 곱 — tools/unity_tint.mjs) → states.css .pos
  { n: 2, c: "#31cd31", h: "#2fc52f", p: "#24a024", x: 53, y: 362 }, { n: 3, c: "#fefe00", h: "#f4f400", p: "#c7c700", x: 138, y: 362 },
  { n: 4, c: "#00fefe", h: "#00f4f4", p: "#00c7c7", x: 223, y: 362 },
  { n: 5, c: "#ffffff", h: "#f5f5f5", p: "#c8c8c8", x: 96, y: 433 }, { n: 6, c: "#f42bf4", h: "#ea29ea", p: "#bf1fbf", x: 181, y: 433 },
];

export function initStatus(root) {
  root.innerHTML = `
    <div id="st-info" class="box"><h3 data-i18n="23">드론 정보</h3><div class="rule"></div><div class="info-rows"></div></div>
    <div id="st-led" class="box"><h3>LED</h3><div class="rule"></div>
      <div class="led-sub" style="top:89px" data-i18n="109">팀</div>
      <div class="team"><div class="red" data-c="0">RED</div><div class="blue" data-c="1">BLUE</div></div>
      <div class="led-sub" style="top:272px" data-i18n="110">포지션</div>
      ${POS.map((p) => `<div class="pos" data-n="${p.n}" style="left:${p.x - 23}px;top:${p.y - 23}px;--c:${p.c};--h:${p.h};--p:${p.p}"></div>`).join("")}
      <div class="led-block hidden"><span data-i18n="98,99"></span></div>
    </div>
    <div id="st-graph" class="box"><h3 data-i18n="31">그래프</h3><div class="rule"></div><canvas></canvas>
      <div class="g-rate s9 s-rb2" title="갱신 간격"><span class="g-rate-v">10</span><span class="g-rate-ms">ms</span><i class="g-rate-arrow"></i></div>
      <div class="g-legend"><span style="color:#f55e5e">Roll<b>-</b></span><span style="color:#5e90f5">Pitch<b>-</b></span><span style="color:#7de298">Yaw<b>-</b></span></div>
    </div>
    <div id="st-cal" class="box"><h3 data-i18n="18">캘리브레이션</h3><div class="rule"></div>
      <button class="btn-line" id="btnCal" data-i18n="19">가속도계 교정</button>
      <div class="cal-text" data-i18n="20,21"></div>
    </div>
    <div id="st-3d" class="box"><div class="view3d"></div>
      <div class="att"><div class="att-k">Roll
Pitch
Yaw</div><div class="att-v">:        -
:        -
:        -</div></div>
      <div class="offset s9" id="btnOffset"></div>
    </div>`;
  applyStatic(root);

  // ── 드론 정보 ──
  const rows = root.querySelector(".info-rows");
  rows.innerHTML = ROWS.map(([no, f]) => f
    ? `<div class="info-row"><span class="k" data-i18n="${no}" data-fit></span><span class="v">-</span></div>`
    : `<div class="info-row fw"><span class="k" data-i18n="${no}" data-fit></span><button class="btn-line" id="btnFwCheck" data-i18n="94"></button></div>`).join("");
  applyStatic(rows);
  const vals = [...rows.querySelectorAll(".info-row")];
  const renderInfo = () => ROWS.forEach(([, f], i) => { if (f) vals[i].querySelector(".v").textContent = store.connected ? (f(store) ?? "-") : "-"; });
  ["State", "Count", "Information", "link"].forEach((k) => on(k, renderInfo));
  onLang(renderInfo);
  renderInfo();
  [root.querySelector("#btnCal"), root.querySelector("#btnFwCheck")].forEach(buttonTransition); // 원본 ButtonTransition
  root.querySelector("#btnFwCheck").onclick = () => import("./firmware.js").then((m) => m.openFirmware?.()).catch(() => {});

  // ── LED (컨트롤러와 연결했을 때만 — 드론만 연결이면 가림막 98·99) ──
  const team = [...root.querySelectorAll(".team div")], pos = [...root.querySelectorAll(".pos")];
  let teamColor = "red";
  const markTeam = (i) => team.forEach((el, k) => el.classList.toggle("sel", k === i));
  const markPos = (n) => pos.forEach((el) => el.classList.toggle("sel", +el.dataset.n === n));
  markTeam(0); // 원본 첫 화면: RED 가 골라진 모습(Image_Red 빨강 · Text_Red 굵게)
  team.forEach((el) => (el.onclick = () => {
    const c = +el.dataset.c; markTeam(c);
    send(P.DataType.LightMode, [P.LedMode.TeamRgbHold, 255, 0, c ? 0 : 255, 0, c ? 255 : 0], P.DeviceType.Controller);
  }));
  pos.forEach((el) => (el.onclick = () => {
    const n = +el.dataset.n; markPos(n);
    const rgb = { 2: [0, 255, 0], 3: [255, 255, 0], 4: [0, 255, 255], 5: [255, 255, 255], 6: [255, 0, 255] }[n];
    send(P.DataType.LightMode, [P.LedMode.PositionHold, 255, 0, ...rgb], P.DeviceType.Controller);
  }));
  on("LightMode", (m) => {
    if (m.mode === P.LedMode.TeamRgbHold || m.mode === P.LedMode.TeamRgbFlicker) {
      markTeam(m.r === 255 ? 0 : m.b === 255 ? 1 : -1);
      if (m.r === 255 || m.b === 255) teamColor = m.r === 255 ? "red" : "blue"; // 원본 TeamLED_Check: 둘 다 아니면 그대로
      viewer?.setTeamColor(teamColor);
    } else if (m.mode === P.LedMode.PositionHold) {
      const key = `${m.r},${m.g},${m.b}`;
      markPos({ "0,255,0": 2, "255,255,0": 3, "0,255,255": 4, "255,255,255": 5, "255,0,255": 6 }[key] ?? -1);
      viewer?.setPositionRgb(m.r, m.g, m.b); // 원본 PositionLED_Check → 3D 위 FC LED 60개
    }
  });
  const ledBlock = root.querySelector(".led-block");
  on("link", () => ledBlock.classList.toggle("hidden", !(store.connected && store.isDrone)));

  // ── 그래프 ──
  const graph = new AttitudeGraph(root.querySelector("#st-graph canvas"));
  const legend = [...root.querySelectorAll(".g-legend b")];
  // 원본 Graph/Text/Refresh/Dropdown: 항목 10·20·30·40·50·100·250·500·1000 ms, 처음 0번(10) — 펼친 목록은 Template(어두운 칸 · 항목 20 · 여백 4 · 최대 150 · 2 겹침)
  const RATES = [10, 20, 30, 40, 50, 100, 250, 500, 1000], gRate = root.querySelector(".g-rate");
  gRate.onclick = () => dropList(gRate, { items: RATES.map(String), selected: RATES.indexOf(graph.rateMs), cls: "graph", itemH: 20, pad: 4, maxH: 150, overlap: 2,
    onPick: (i) => { graph.rateMs = RATES[i]; root.querySelector(".g-rate-v").textContent = graph.rateMs; } });

  // ── 캘리브레이션 · Z축 초기화 (원본 DroneMove.AccelerometerSettings · OnOffset) ──
  root.querySelector("#btnCal").onclick = () => { send(P.DataType.Command, [P.CommandType.ClearBias, 0]); notify(104); };
  const offsetBtn = root.querySelector("#btnOffset");
  let yawOffset = 0;
  const renderOffset = () => (offsetBtn.textContent = `${t(33)} : ${yawOffset.toFixed(2)}°`);
  offsetBtn.onclick = () => {
    yawOffset = store.state?.degreeYaw ?? 0;
    viewer?.setYawOffset(yawOffset);
    renderOffset();
    send(P.DataType.Command, [P.CommandType.FlightEvent, P.FlightEvent.ResetHeading]);
    notify(105);
  };
  onLang(renderOffset);
  renderOffset();

  // ── 3D ──
  let viewer = null;
  // 원본 DroneMove: 값이 있으면 ":   " + 값(F2), 없으면 ":        -" (공백 수까지 그대로 — 배포판 글자 확인)
  const attV = root.querySelector(".att-v");
  const setAtt = (...v) => (attV.textContent = v.map((x) => (x === "-" ? ":        -" : ":   " + x)).join("\n"));
  const v3 = root.querySelector(".view3d");
  viewer = new Drone3D(v3);
  window.__viewer = viewer; // 자동 시험·원본 맞대기용(tools·target/cmp)
  viewer.load().then(() => { viewer.setTeamColor(teamColor); viewer.setConnected(store.connected); window.__ready3d = true; });
  on("State", (s) => {
    viewer.setAttitude(s.degreeRoll, s.degreePitch, s.degreeYaw);
    setAtt(s.degreeRoll.toFixed(2), s.degreePitch.toFixed(2), (s.degreeYaw - yawOffset).toFixed(2));
    graph.push(s.degreeRoll, s.degreePitch, s.degreeYaw);
    legend[0].textContent = s.degreeRoll.toFixed(2);
    legend[1].textContent = s.degreePitch.toFixed(2);
    legend[2].textContent = s.degreeYaw.toFixed(2);
  });
  on("link", ({ now }) => {
    viewer.setConnected(now.state === "connected"); // 원본 ButtonManager.SerialConnect: 연결 = 3D(빛 번짐) · 끊김 = RawCamera 그림
    if (now.state !== "connected") {
      setAtt("-", "-", "-");
      legend.forEach((b) => (b.textContent = "-"));
      viewer.resetAttitude();
      graph.clear();
    }
  });
}
