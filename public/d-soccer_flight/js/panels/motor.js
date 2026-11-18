// 모터 탭 — 원본 Motors_Content. 이 파일: 모터 순서(Motor_Controller) · 경고 체크와 가림막(MotorWarning) ·
// 아무 키 = 정지(MotorOutput.Update) · 탭 열기/닫기. 회전 칸은 motor_rotation.js, 출력 칸은 motor_output.js.
// 안전: 탭을 떠나면 정지 신호를 두 번(0.02초 간격) 보낸다 — 원본에는 없던 것(원본은 탭을 떠나도 모터가 계속 돌 수 있었음).
import { store, on } from "../store.js";
import { t, onLang, applyStatic } from "../i18n.js";
import { send, P } from "../proto.js";
import { richText } from "../widgets.js";
import { initRotation } from "./motor_rotation.js";
import { initOutput } from "./motor_output.js";
import { setMotorMask } from "./motor_mask.js";

const DT = P.DataType;
const { Direction, Parts, MotorOrder } = P.raw;

/** Motor 내용 10 바이트 [방향, 모터, 값1 아래·위, 값2 …, 값4] — ProtocolDrone.cs Motor.GetBytes (ushort 아래 바이트 먼저) */
const motorBytes = (dir, parts, v = [0, 0, 0, 0]) => [dir, parts, ...v.flatMap((x) => [x & 0xff, (x >> 8) & 0xff])];

export function initMotor(root) {
  root.innerHTML = `
    <div id="mt-rot" class="box"><h3 data-i18n="46"></h3><div class="rule"></div>
      <div class="mt-content"></div>
      <div class="mt-prevent" id="mt-prevent-rot"></div>
      <div class="mt-prevent hidden" id="mt-changing"><span data-i18n="32"></span></div>
      <div class="mt-warn" id="mt-warn-rot">
        <div class="mt-warn-text"></div><div class="mt-warn-line"></div>
        <div class="mt-check-text" id="mt-ctext-0"></div>
        <div class="mt-check" id="mt-check-rot" role="checkbox"><i></i></div>
      </div>
    </div>
    <div id="mt-out" class="box"><h3 data-i18n="57"></h3><div class="rule"></div>
      <div class="mt-content"></div>
      <div class="mt-prevent" id="mt-prevent-out"></div>
      <div class="mt-warn" id="mt-warn-out">
        <div class="mt-warn-text"></div><div class="mt-warn-line"></div>
        <div class="mt-check-text" id="mt-ctext-1"></div>
        <div class="mt-check" id="mt-check-out" role="checkbox"><i></i></div>
      </div>
    </div>`;
  const $ = (s) => root.querySelector(s);

  // ── Motor_Controller: 모터 순서 ──
  const ctl = {
    order: null, // currentOrder — 화면 자리 0~3(우상·우하·좌하·좌상)에 놓인 모터 번호. 출력 칸이 바이트 자리를 고를 때 씀
    bytes: motorBytes,
    stop: () => send(DT.Motor, motorBytes(Direction.None, Parts.None)), // StopMotor()
    replaceOrder(n1, n2) {
      if (!ctl.order) return; // 원본은 순서를 받기 전이면 여기서 예외로 멈췄다
      ctl.order = ctl.order.map((n) => (n === n1 ? n2 : n === n2 ? n1 : n));
      send(DT.MotorOrder, [MotorOrder["MOrder_" + ctl.order.join("")]]); // Send_SetMotorOrder
      setTimeout(requestOrder, 200); // Invoke(Request_MotorOrder, 0.2f)
    },
  };
  const requestOrder = () => store.connected && send(DT.Request, [DT.MotorOrder]); // Request_MotorOrder

  const warn = { rot: false, out: false }; // isWarning_Rotation · isWarning_OutPut
  const rot = initRotation($("#mt-rot .mt-content"), ctl, $("#mt-changing"));
  const out = initOutput($("#mt-out .mt-content"), ctl, () => warn.out);

  // Setting_MotorOrderNumber — 열거형 이름 끝 네 글자가 순서(MOrder_1234 → [1,2,3,4])
  on("MotorOrder", (m) => {
    const name = Object.keys(MotorOrder).find((k) => MotorOrder[k] === m.motorOrder);
    if (!name) { console.warn("모르는 모터 순서", m.motorOrder); return; }
    ctl.order = [...name.slice(-4)].map(Number);
    rot.setNumbers(ctl.order);
  });

  // ── MotorWarning: 두 경고 체크는 하나만 켜진다. 끄면 모터 정지 ──
  function render() {
    $("#mt-check-rot").classList.toggle("on", warn.rot);
    $("#mt-check-out").classList.toggle("on", warn.out);
    $("#mt-prevent-rot").classList.toggle("hidden", warn.rot);
    $("#mt-prevent-out").classList.toggle("hidden", warn.out);
  }
  function rotationWarning() { // Rotation_Warning
    if (warn.out) outputWarning();
    if (warn.rot) { warn.rot = false; render(); out.motorWarning(); }
    else { warn.rot = true; render(); }
  }
  function outputWarning() { // OutPut_Warning
    if (warn.rot) rotationWarning();
    if (warn.out) { warn.out = false; render(); out.motorWarning(); }
    else { warn.out = true; render(); }
  }
  $("#mt-check-rot").onclick = rotationWarning;
  $("#mt-check-out").onclick = outputWarning;
  // 가림막을 누르면 체크 글자를 잠깐 빨갛게(PreventClick → WarningTextFlash 0.16초 + 0.16초)
  const flash = (n) => {
    const el = $("#mt-ctext-" + n);
    if (el.classList.contains("flash")) return;
    el.classList.add("flash");
    el.addEventListener("animationend", () => el.classList.remove("flash"), { once: true });
  };
  $("#mt-prevent-rot").onclick = () => flash(0);
  $("#mt-changing").onclick = () => flash(0);
  $("#mt-prevent-out").onclick = () => flash(1);

  // ── 글자 (LanguageChange.Motor — 꾸밈 글자는 HTML 로) ──
  function texts() {
    const html = (sel, s) => ($(sel).innerHTML = "<div>" + richText(s) + "</div>"); // 한 덩어리로(가운데 맞춤 칸 안)
    // 체크 글: 배포판 LanguageChange.Motor 그대로(REA) — 회전 "<b>55</b> 56" · 출력 "<b>55 65</b>⏎66" (글자표도 배포판 것)
    html("#mt-warn-rot .mt-warn-text", "<b>" + t(45) + "</b> - " + t(91) + "\n" + t(92) + "\n<b><color=red>" + t(50)
      + "</color>\n<color=red>" + t(52) + " </color></b>" + t(53) + " <b>" + t(54) + "</b>");
    html("#mt-warn-out .mt-warn-text", "<b>" + t(59) + "\n<color=red>" + t(60) + "</color></b>\n- " + t(61)
      + "\n- " + t(62) + "\n- " + t(63) + "\n- " + t(64));
    html("#mt-ctext-0", "<b>" + t(55) + "</b> " + t(56));
    html("#mt-ctext-1", "<b>" + t(55) + " " + t(65) + "</b>\n" + t(66));
  }
  applyStatic(root);
  texts();
  onLang(texts);

  // ── 아무 키 = 정지 (MotorOutput.Update: 모터 탭이 보일 때만, 정지 중이 아닐 때) ──
  let isOpen = false;
  addEventListener("keydown", (e) => { if (isOpen && !e.repeat && !out.isStop()) out.motorWarning(); });

  // ── 탭 열기/닫기 (OnEnable · OnDisable) ──
  function open() {
    isOpen = true;
    warn.rot = warn.out = false; render(); // MotorWarning.OnEnable
    requestOrder(); // Motor_Controller.OnEnable (원본은 탭 토글에서도 한 번 더 보냈다)
    setMotorMask(true);
  }
  function close() {
    isOpen = false;
    if (store.connected) { ctl.stop(); setTimeout(() => store.connected && ctl.stop(), 20); } // 안전 정지(원본에 없음)
    rot.disable(); out.disable(); // Motor_Direction · MotorOutput.OnDisable
    warn.rot = warn.out = false; render(); // MotorWarning.OnDisable
    setMotorMask(false);
  }
  on("page", (name) => { if (name === "motor") open(); else if (isOpen) close(); });
  on("link", ({ prev, now }) => {
    if (prev.state === "connected" && now.state !== "connected") { out.disable(); rot.disable(); } // 끊기면 반복 보내기도 멈춤
  });
  render();
}
