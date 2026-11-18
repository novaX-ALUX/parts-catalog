// 모터 회전 칸 — 원본 Motor_Direction(버튼 5벌: 모터 1~4 + 전체) · MotorAllButtonsChange(색) · MotorOrderNumber(번호 끌어 바꾸기)
// "모터 회전" 은 누르는 동안만: 누르면 Motor 1번 보내고, 떼면 정지를 0.02초 간격으로 두 번.
// "방향 변경" 은 방향 바꿈 신호 → 0.05초 → 정지 → 0.02초 → 정지 → 0.18초 동안 "방향 전환 중" 가림막.
import { send, P } from "../proto.js";
import { coroutines, buttonTransition } from "../widgets.js";

const DT = P.DataType;
const { Direction, Parts } = P.raw;
const ALL = 4; // 다섯째 = 전체 버튼(원본 motorOrderNumber 가 null)
const RED = "#ff0000", BLUE = "#3ebfff", WHITE = "#ffffff", ORANGE = "#ff8000";
// 화면 자리 0~3 = 원본 Motor1~Motor4 (우상·우하·좌하·좌상). 좌표는 칸 기준(무대 좌표 −(250,130))
const POS = [
  { rot: [644, 100], spin: [494, 95], img: "CCW", arrows: [[-37, 36, 0], [50, 115, -90]] },
  { rot: [644, 422], spin: [494, 417], img: "CW", arrows: [[-37, 44, 0], [50, -35, 90]] },
  { rot: [20, 422], spin: [210, 417], img: "CCW", arrows: [[137, 44, 180], [50, -35, 90]] },
  { rot: [20, 100], spin: [210, 95], img: "CW", arrows: [[137, 36, 180], [50, 115, -90]] },
];
// 그림 주소는 문서 기준 절대 주소로(CSS 변수 속 상대 주소는 브라우저마다 기준이 달라서)
const imgUrl = (f) => `url('${new URL("assets/img/motor/" + f, document.baseURI).href}')`;
const MOTOR_PART = [undefined, Parts.M1, Parts.M2, Parts.M3, Parts.M4]; // my_num 1~4 → M1·M2·M3·M4

export function initRotation(host, ctl, changing) {
  host.innerHTML = `<img class="mt-drone" src="assets/img/motor/Motor_drone_1.png" alt="">
    ${POS.map((p, i) => `
      <div class="mt-spin" id="mt-spin-${i}" style="left:${p.spin[0]}px;top:${p.spin[1]}px;--img:${imgUrl("Motor_spin_" + p.img + ".png")}">
        <i class="mt-spin-img"></i>
        ${p.arrows.map(([x, y, r]) => `<i class="mt-arrow" style="left:${x}px;top:${y}px;transform:rotate(${r}deg)"></i>`).join("")}
        <div class="mt-num" id="mt-num-${i}"><i class="mt-follow"></i><span></span></div>
      </div>
      <div class="mt-btn mt-rotbtn s9 s-rb" id="mt-rot-${i}" style="left:${p.rot[0]}px;top:${p.rot[1]}px"><i class="ico play"></i><span data-i18n="46" data-fit></span></div>
      <div class="mt-btn mt-dirbtn s9 s-rb" id="mt-dir-${i}" style="left:${p.rot[0]}px;top:${p.rot[1] + 60}px"><i class="ico rev"></i><span data-i18n="47" data-fit></span></div>`).join("")}
    <div class="mt-btn mt-rotbtn wide s9 s-rb" id="mt-rot-4" style="left:310px;top:552px"><i class="ico play"></i><span data-i18n="48" data-fit></span></div>
    <div class="mt-btn mt-dirbtn wide s9 s-rb" id="mt-dir-4" style="left:310px;top:612px"><i class="ico rev"></i><span data-i18n="49" data-fit></span></div>`;
  const $ = (s) => host.querySelector(s);
  const co = coroutines();

  // 버튼마다 원본 Motor_Direction 의 상태(이름 그대로)
  const dirs = [0, 1, 2, 3, 4].map(() => ({ isTurn: false, isTurnCheck: false, isOriginalDirection: true, motorNum: Parts.None }));
  const myNum = [0, 0, 0, 0]; // MotorOrderNumber.my_num — 화면에 보이는 번호(순서를 받기 전엔 0)
  const dirChanged = [false, false, false, false]; // MotorAllButtonsChange.dirChanged

  // 방향 고르기 — 원본 if / else if 세 갈래 그대로(앞 두 갈래가 아니면 늘 CW)
  function pickDirection(d) {
    if (d.isTurn && d.isTurnCheck) { d.isTurnCheck = false; return Direction.CCW; }
    if (!d.isTurn && !d.isOriginalDirection) { d.isOriginalDirection = true; return Direction.CCW; }
    return Direction.CW;
  }
  // 모터 고르기 — 전체면 All, 아니면 보이는 번호. 번호가 1~4 가 아니면(순서를 아직 못 받음) 지난 값 그대로(원본 default 갈래)
  function pickMotor(d, i) {
    if (i === ALL) return Parts.All;
    if (MOTOR_PART[myNum[i]] === undefined) { console.error("모터 넘버가 " + myNum[i] + " 입니다"); return d.motorNum; }
    return MOTOR_PART[myNum[i]];
  }
  const rotColor = (i, c) => $("#mt-rot-" + i).style.setProperty("--c", c);
  // 색을 다시 칠하면 ButtonTransition 이 남긴 색([data-bt])보다 앞섬 — 원본은 나중에 칠한 색이 남음
  const dirColor = (i, c) => { const b = $("#mt-dir-" + i); b.classList.toggle("turned", c === ORANGE); b.removeAttribute("data-bt"); };
  buttonTransition($("#mt-dir-4")); // 원본 MotorAll/Direction 만 ButtonTransition(올림 흰색 · 누름 주황)
  const stopTwice = () => { ctl.stop(); setTimeout(ctl.stop, 20); }; // StopMotor_Co

  // ── 모터 회전: 누르는 동안 ──
  dirs.forEach((d, i) => {
    const b = $("#mt-rot-" + i);
    let held = false;
    b.onpointerdown = (e) => {
      if (e.button !== 0) return;
      b.setPointerCapture(e.pointerId);
      held = true;
      rotColor(i, RED);
      if (i === ALL) for (let k = 0; k < 4; k++) rotColor(k, RED); // RotationButtonsChange(true)
      const dir = pickDirection(d);
      d.motorNum = pickMotor(d, i);
      send(DT.Motor, ctl.bytes(dir, d.motorNum));
    };
    const up = () => {
      if (!held) return;
      held = false;
      rotColor(i, BLUE);
      if (i === ALL) for (let k = 0; k < 4; k++) rotColor(k, BLUE);
      stopTwice();
    };
    b.onpointerup = b.onpointercancel = b.onlostpointercapture = up;
    addEventListener("blur", up); // 창을 놓쳐 떼는 신호가 안 올 때도 멈춤(안전)
  });

  // ── 방향 변경 (OnTurn + ChangingDirection, 그리고 TurnButtonChange / TurnButtonsAllChange) ──
  function turnColor(n) { // TurnButtonChange(n): 1~4
    dirColor(n - 1, dirChanged[n - 1] ? WHITE : ORANGE);
    dirChanged[n - 1] = !dirChanged[n - 1];
  }
  dirs.forEach((d, i) => {
    $("#mt-dir-" + i).onclick = () => {
      if (d.isTurn) { d.isTurn = false; d.isTurnCheck = false; }
      else { d.isOriginalDirection = false; d.isTurnCheck = true; d.isTurn = true; }
      co.start(async (wait) => {
        changing.classList.remove("hidden");
        const dir = pickDirection(d);
        d.motorNum = pickMotor(d, i);
        send(DT.Motor, ctl.bytes(dir, d.motorNum));
        await wait(50); ctl.stop(); await wait(20); ctl.stop(); await wait(180);
        changing.classList.add("hidden");
      });
      if (i === ALL) for (let n = 1; n <= 4; n++) turnColor(n); else turnColor(i + 1);
    };
  });

  // ── 번호 끌어서 순서 바꾸기 (MotorOrderNumber) ──
  const spinImg = (i, c) => $(`#mt-spin-${i} .mt-spin-img`).style.setProperty("--c", c);
  for (let i = 0; i < 4; i++) {
    const num = $("#mt-num-" + i), spin = $("#mt-spin-" + i);
    let start = null, dragging = false;
    num.onpointerenter = () => { spin.classList.add("hover"); spinImg(i, WHITE); };
    num.onpointerleave = () => { spin.classList.remove("hover"); spinImg(i, "#808080"); }; // Color.gray
    num.onpointerdown = (e) => {
      if (e.button !== 0) return;
      num.setPointerCapture(e.pointerId);
      start = [e.clientX, e.clientY]; dragging = false;
    };
    num.onpointermove = (e) => {
      if (!start) return;
      const s = scale(), dx = (e.clientX - start[0]) / s, dy = (e.clientY - start[1]) / s;
      if (!dragging && Math.hypot(dx, dy) * s < 10) return; // EventSystem 끌기 문턱 10px
      if (!dragging) { dragging = true; spinImg(i, "#e6e6e6"); num.classList.add("drag"); } // OnBeginDrag
      num.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    num.onpointerup = num.onpointercancel = (e) => {
      if (!start) return;
      start = null;
      if (!dragging) return;
      dragging = false;
      num.classList.remove("drag"); num.style.transform = "";
      spinImg(i, "#b0afaf"); // defalutColor
      const hit = [0, 1, 2, 3].find((k) => k !== i && inside($("#mt-spin-" + k), e.clientX, e.clientY));
      if (hit !== undefined && myNum[i] && myNum[hit]) ctl.replaceOrder(myNum[i], myNum[hit]);
    };
  }
  const scale = () => document.getElementById("stage").getBoundingClientRect().width / 1920;
  const inside = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };

  return {
    setNumbers(order) { order.forEach((n, i) => { myNum[i] = n; $(`#mt-num-${i} span`).textContent = n; }); },
    // OnDisable: 상태 되돌리기(방향 버튼 색은 원본처럼 그대로 둠) · 방향 전환 가림막 끄기
    disable() {
      co.stopAll();
      dirs.forEach((d) => { d.isTurn = false; d.isTurnCheck = false; d.isOriginalDirection = true; });
      changing.classList.add("hidden");
      for (let k = 0; k <= ALL; k++) rotColor(k, BLUE);
    },
  };
}
