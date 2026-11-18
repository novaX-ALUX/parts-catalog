// PID 튜닝 탭 — 원본 PIDTunning · ProfileData · SliderManager(F2) · SliderValue · ButtonManager.OnProfiles
import { api } from "../api.js";
import { store, on } from "../store.js";
import { t, applyStatic, onLang } from "../i18n.js";
import { send, P } from "../proto.js";
import { notify } from "../shell.js";
import { startDroneSetting, stepText } from "../drone_setting.js";
import { sliderRow, f32Trunc, f32DivTrunc, fmt1, fmt2, fld, buttonTransition } from "../widgets.js";

// 프로파일 기본값 = 드론 기본값(드론 1.10.0 PID.config.h · 2026-11-17 실비행 값) — 원본 앱(7·5·0.1 등)을 그대로 두면 새 프로파일로
// '적용 및 저장'을 누를 때 드론의 좋은 값을 옛 값으로 덮어씀. TPA 는 2.7.1 에서 뺌(드론 1.9.1 이 무시 · 보낼 때 0)
const DEFAULT = { file: " ", note: "", rollData: [12, 10, 0.6], pitchData: [10, 10, 0.6], yawData: [2, 10, 0],
  degreeRange: 58, rotateSpeed: 360, dynamicStability: 0, thrustLinear: 100, throttleAssist: 0, language: "Korean" };
// 추력 직선(%) — 드론 1.10.0 부터 실측 모터 곡선으로 펴는 몫 · 0 = 끔 · 100 = 실측 곡선 그대로(기본)
// (2.7.x 의 같은 칸은 근사식 세기 · 기본 65 — 뜻이 달라 2.7.x 프로파일 값은 쓰지 않고 기본값으로)
const TL = { min: 0, max: 100, def: 100 };
// 스로틀 보조(%) — 드론 1.10.0 부터(옛 '자세 우선') · 0 = 스로틀은 막대 그대로(기본 · 안 뜸) · 100 = 큰 동작 때 스로틀을 올려 자세 유지(뜸)
const TA = { min: 0, max: 100, def: 0 };
// 슬라이더 범위(2.7.0) — 드론 기본값이 가운데쯤 오게: 롤·피치 RateP 10 · RateD 0.6 이 예전 막대(1~10 · 0~0.6) 끝이라 넓힘,
// 요 DegreeP 는 드론이 4 로 자르므로 0~4, 동적 안정성은 드론 상한 10
const GT = { min: 0, max: 10 };
const AX = [
  // y = 줄의 값 상자 위(설정 칸 기준) — 원본 Base/Content/Roll·Pitch·Yaw (색도 원본: 설정 칸은 PITCH 초록 · YAW 파랑)
  { key: "rollData", name: "ROLL", color: "#ed1c24", y: 376.9, rng: [[2, 15], [1, 20], [0, 1.2]] },
  { key: "pitchData", name: "PITCH", color: "#54dc91", y: 436.9, rng: [[2, 15], [1, 20], [0, 1.2]] },
  { key: "yawData", name: "YAW", color: "#3ebfff", y: 496.9, rng: [[0, 4], [1, 25], [0, 0.3]] },
];
const COLX = [132.7, 523.7, 913.7]; // DegreeP · RateP · RateD 값 상자 왼쪽(칸 기준)
// PID 정보 칸 — 원본 PIDCurrent/ValueBox 글자 칸 자리(칸 기준, 줄마다 간격이 달라 그대로 적음 · 색은 PITCH 파랑 · YAW 초록)
const NOW = { axis: [["ROLL", "#ed1c24", 185.1], ["PITCH", "#3ebfff", 314.9], ["YAW", "#55dc91", 447.7]],
  labT: [216.1, 345.6, 480.1], valT: [263.1, 392.6, 527.1], labL: [26.3, 132.3, 232.3], valL: [-7.7, 95.3, 199.3],
  extra: [["Degree", 584.6, 584.6], ["Degree/s", 619.6, 619.3], ["Dynamic Stability", 657.4, 657.4], ["Thrust Linear", 692.4, 692.1], ["Throttle Assist", 727.4, 727.1]] };

export function initPid(root) {
  root.innerHTML = `
    <div id="pid-now" class="box"><h3 data-i18n="36">PID 정보</h3><div class="rule"></div>
      <div class="pn-msg" data-i18n="73"></div><div class="pn-pend" id="pn-pend"></div>
      ${NOW.axis.map(([n, c, y], i) => `
        <div class="pn-t pn-axis" style="left:97px;top:${y}px;color:${c}">${n}</div>
        ${["DegreeP", "RateP", "RateD"].map((k, j) => `<div class="pn-t pn-lab" style="left:${NOW.labL[j]}px;top:${NOW.labT[i]}px">${k}</div><div class="pn-t pn-val" id="pn-${i}-${j}" style="left:${NOW.valL[j]}px;top:${NOW.valT[i]}px">0</div>`).join("")}`).join("")}
      ${NOW.extra.map(([k, ty, vy], i) => `
        <div class="pn-t pn-k" style="left:34.7px;top:${ty}px">${k}</div><div class="pn-t pn-val" id="pn-x${i}" style="left:185.7px;top:${vy}px">0</div>`).join("")}
      <button class="btn-line" id="pid-reset" data-i18n="39"></button>
    </div>
    <div id="pid-set" class="box"><h3 data-i18n="40">PID 설정</h3><div class="rule"></div>
      <div class="prof">${[1, 2, 3, 4].map((n) => `<button data-n="${n}" data-fit>${t(37)} ${n}</button>`).join("")}</div>
      <button class="btn-line" id="pid-save" data-i18n="38"></button>
      <textarea id="pid-note" spellcheck="false"></textarea>
      <div class="ph" data-help="205" style="left:135.4px">DegreeP ⓘ</div><div class="ph" data-help="206" style="left:535.4px">RateP ⓘ</div><div class="ph" data-help="207" style="left:935.4px">RateD ⓘ</div>
      <div class="vsep" style="left:489.1px"></div><div class="vsep" style="left:876.3px"></div>
      ${AX.map((a) => `<div class="axis" style="top:${a.y}px;color:${a.color}">${a.name}</div>`).join("")}
    </div>
    <div id="pid-angle" class="box"><h3 data-i18n="41">앵글</h3><div class="rule"></div>
      <div class="mk" data-help="208" style="left:-15.1px;top:97.7px">Degree ⓘ</div><div class="mk" data-help="209" style="left:-15.1px;top:156.7px">Degree/s ⓘ</div></div>
    <div id="pid-misc" class="box"><h3 data-i18n="96">기타</h3><div class="rule"></div>
      <div class="mk" data-help="210" style="left:19px;top:53.1px">Dynamic Stability ⓘ</div>
      <div class="mk" data-help="204" style="left:19px;top:95.1px">Thrust Linear ⓘ</div>
      <div class="mk" data-help="211" style="left:19px;top:137.1px">Throttle Assist ⓘ</div></div>`;
  applyStatic(root);
  const $ = (s) => root.querySelector(s);
  const note = $("#pid-note");
  const setPh = () => (note.placeholder = t(97));
  setPh(); onLang(() => { setPh(); root.querySelectorAll(".prof button").forEach((b) => (b.textContent = t(37) + " " + b.dataset.n)); });

  // ── 값 칸 만들기 ──
  const rows = {};
  const place = (parent, el, x, y) => { el.style.left = x + "px"; el.style.top = y + "px"; parent.appendChild(el); };
  AX.forEach((a) => a.rng.forEach(([mn, mx], j) => {
    const r = sliderRow({ min: mn, max: mx, step: j === 2 ? 0.01 : 0.1, decimals: j === 2 ? 2 : 1, bubble: true, ...(j === 2 ? { init: 0, ph: "0" } : {}) }); // RateD: 처음 값 0 · 예시 "0"(원본 Placeholder)
    rows[a.key + j] = r;
    place($("#pid-set"), r, COLX[j], a.y);
  }));
  rows.degreeRange = sliderRow({ min: 30, max: 85, step: 1, decimals: 0 });
  rows.rotateSpeed = sliderRow({ min: 9, max: 36, step: 1, decimals: 0, ten: true });
  rows.dynamicStability = sliderRow({ min: GT.min, max: GT.max, step: 0.1, decimals: 1 });
  rows.thrustLinear = sliderRow({ min: TL.min, max: TL.max, step: 1, decimals: 0 });
  rows.throttleAssist = sliderRow({ min: TA.min, max: TA.max, step: 1, decimals: 0 });
  rows.rollData0.btns.minus.classList.add("big"); // 원본 Roll DegreeP 의 − 만 25×25
  place($("#pid-angle"), rows.degreeRange, 200.2, 102.7); place($("#pid-angle"), rows.rotateSpeed, 200.2, 161.7);
  // 기타 칸 줄 셋(원본은 동적 안정성 · TPA 둘 · 102.1 · 161.1) — TPA 를 빼고 추력 선형화 · 자세 우선을 더하며 42px 간격으로 당김
  place($("#pid-misc"), rows.dynamicStability, 249.3, 58.1);
  place($("#pid-misc"), rows.thrustLinear, 249.3, 100.1); place($("#pid-misc"), rows.throttleAssist, 249.3, 142.1);
  // 값마다 설명(이름 옆 ⓘ 에 마우스를 올리면 · 언어 따라 · 언어표 204~212)
  const help = () => root.querySelectorAll("[data-help]").forEach((el) => (el.title = t(+el.dataset.help)));
  help(); onLang(help);

  // ── 프로파일 (원본 SelectProfiles → LoadData → SliderSetting) ──
  let sel = 1;
  const profBtns = [...root.querySelectorAll(".prof button")];
  async function loadProfile(n) {
    sel = n;
    profBtns.forEach((b) => b.classList.toggle("sel", +b.dataset.n === n));
    let d = { ...DEFAULT };
    try {
      const j = await api.profileLoad(n);
      if (j) {
        const saved = JSON.parse(j);
        d = { ...DEFAULT, ...saved };
        if (saved.throttleAssist === undefined) d.thrustLinear = TL.def; // 2.7.x 프로파일: 추력 칸의 뜻이 달라 기본값으로
      }
    } catch (e) { console.warn("프로파일 읽기 실패", e); }
    note.value = (d.note || "").trim() ? d.note : "";
    AX.forEach((a) => a.rng.forEach((_, j) => rows[a.key + j].set(d[a.key][j])));
    rows.degreeRange.set(d.degreeRange); rows.rotateSpeed.set(d.rotateSpeed);
    rows.dynamicStability.set(d.dynamicStability);
    rows.thrustLinear.set(d.thrustLinear ?? TL.def);
    rows.throttleAssist.set(d.throttleAssist ?? TA.def);
  }
  profBtns.forEach((b) => (b.onclick = () => loadProfile(+b.dataset.n)));

  // ── 적용 및 저장 (원본 SaveJsonFile + SendToDrone_PidData + 알림 106) ──
  [$("#pid-save"), $("#pid-reset")].forEach(buttonTransition); // 원본 ButtonTransition(SaveBtn · PIDCurrent/Reset)
  $("#pid-save").onclick = async () => {
    const v = (k) => rows[k].get();
    const d = { file: " ", note: note.value, degreeRange: parseInt(v("degreeRange")), rotateSpeed: parseFloat(v("rotateSpeed")),
      rollData: [0, 1, 2].map((j) => parseFloat(v("rollData" + j))), pitchData: [0, 1, 2].map((j) => parseFloat(v("pitchData" + j))),
      yawData: [0, 1, 2].map((j) => parseFloat(v("yawData" + j))), dynamicStability: parseFloat(v("dynamicStability")),
      thrustLinear: parseInt(v("thrustLinear")), throttleAssist: parseInt(v("throttleAssist")), language: "Korean" };
    await api.profileSave(sel, JSON.stringify(d));
    send(P.DataType.PidConfigure, pidBytes(v));
    setTimeout(requestPid, 100);
    notify(106);
  };
  // ── 기본값으로 초기화 (원본 ResetValue + 알림 107) ──
  $("#pid-reset").onclick = () => {
    send(P.DataType.Command, [P.CommandType.SetPidDefault, 0]);
    setTimeout(requestPid, 100);
    notify(107);
  };

  // ── PID 정보 (원본 UpdateCurrentPID_Co) ──
  on("PidConfigure", (m) => {
    const g = (k) => fld(m, k) ?? 0;
    ["roll", "pitch", "yaw"].forEach((a, i) => {
      root.querySelector(`#pn-${i}-0`).textContent = fmt1(g(`degree_${a}_p`) / 10);
      root.querySelector(`#pn-${i}-1`).textContent = fmt1(g(`rate_${a}_p`) / 10);
      root.querySelector(`#pn-${i}-2`).textContent = fmt2(g(`rate_${a}_d`) / 100);
    });
    $("#pn-x0").textContent = fmt1(g("degreeRange"));
    $("#pn-x1").textContent = fmt1(g("rotateSpeed") * 10);
    $("#pn-x2").textContent = fmt1(g("dynamicStability") / 10);
    $("#pn-x3").textContent = g("thrustLinear") ? String(g("thrustLinear") - 1) : "-"; // 0 = 이 칸이 없는 옛 드론
    $("#pn-x4").textContent = g("throttleAssist") ? String(g("throttleAssist") - 1) : "-";
  });

  // ── 조종기에 꽂혀 있을 때: 조종기가 맡아 둔 PID 상태(조종기 1.3.0) — 조종기만 꽂혀 있어도 저장 · 드론과 연결되면 조종기가 보냄 ──
  startDroneSetting();
  const renderPend = (s) => {
    const n = s && store.isController ? stepText(s.pid, s.link) : null;
    $("#pn-pend").textContent = n === null ? "" : t(n);
  };
  on("droneSetting", renderPend);
  onLang(() => renderPend(store.droneSetting));

  on("page", (p) => { if (p === "pid") { if (!profBtns.some((b) => b.classList.contains("sel"))) loadProfile(1); if (store.connected) requestPid(); } });
}

function requestPid() { send(P.DataType.Request, [P.DataType.PidConfigure]); }

/** 원본 SendToDrone_PidData 의 13바이트(TPA 칸은 0 = 옛 드론에서도 꺼짐) + 추력 직선(값 + 1) + 스로틀 보조(값 + 1) + 0 5개 (C# float 계산·byte 자르기 그대로) */
export function pidBytes(v) {
  const b = [
    parseInt(v("degreeRange")) & 0xff,
    f32DivTrunc(v("rotateSpeed"), 10),
    f32Trunc(v("rollData0"), 10), f32Trunc(v("rollData1"), 10), f32Trunc(v("rollData2"), 100),
    f32Trunc(v("pitchData0"), 10), f32Trunc(v("pitchData1"), 10), f32Trunc(v("pitchData2"), 100),
    f32Trunc(v("yawData0"), 10), f32Trunc(v("yawData1"), 10), f32Trunc(v("yawData2"), 100),
    f32Trunc(v("dynamicStability"), 10),
    0, // TPA(2.7.1 에서 뺌)
  ];
  const tl = Math.min(TL.max, Math.max(TL.min, parseInt(v("thrustLinear")) || 0)) + 1; // 0 은 옛 드론이 무시하는 '안 보냄'
  const ml = Math.min(TA.max, Math.max(TA.min, parseInt(v("throttleAssist")) || 0)) + 1;
  return [...b, tl, ml, 0, 0, 0, 0, 0];
}
