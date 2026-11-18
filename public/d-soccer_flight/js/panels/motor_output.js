// 모터 출력 칸 — 원본 MotorOutput · MotorSlider. 세로 슬라이더 4개(0~2000) + 마스터.
// 모터 슬라이더를 누르면 0.02초마다 4개 값을 보낸다(값 자리는 모터 순서로: combinedBytes[번호*2]).
// 마스터를 누르면 0.02초마다 마스터 값 하나를 네 자리에 보낸다. 1~99 는 100 으로 올린다.
import { on } from "../store.js";
import { send, P } from "../proto.js";
import { coroutines, sleep } from "../widgets.js";

const DT = P.DataType;
const { Direction, Parts } = P.raw;
const TICK = 20; // WaitForSeconds(0.02f)
const MAX = 2000;
const snap = (v) => (v < 100 && v > 0 ? 100 : v); // SliderValueChange: 1~99 → 100

/** 세로 슬라이더(원본 Slider BottomToTop, 정수 아님). 누름(PointerDown 이벤트)은 onDown, 값 바뀜은 onChange */
function vslider(cls, onDown, onChange) {
  const el = document.createElement("div");
  el.className = "vs " + cls;
  el.innerHTML = `<i class="vs-track"></i><i class="vs-fill"></i><i class="vs-handle"></i>`;
  let raw = 0, drag = false;
  const fromY = (y) => {
    const r = el.getBoundingClientRect(), k = r.height / 150; // 손잡이 가운데: 값 0 = 140px, 2000 = 10px
    return Math.min(MAX, Math.max(0, ((140 - (y - r.top) / k) / 130) * MAX));
  };
  const set = (v) => { if (v === raw) return; raw = v; el.style.setProperty("--p", raw / MAX); onChange(raw); }; // 바뀔 때만 알림(Unity 와 같음)
  // 원본은 같은 물체에 Slider 가 EventTrigger 보다 앞에 붙어 있어, 누르면 값이 먼저 바뀌고 그다음 OnDown 이 불린다
  el.onpointerdown = (e) => { if (e.button !== 0) return; el.setPointerCapture(e.pointerId); drag = true; set(fromY(e.clientY)); onDown(); };
  el.onpointermove = (e) => drag && set(fromY(e.clientY));
  el.onpointerup = el.onpointercancel = () => (drag = false);
  el.set = set;
  el.style.setProperty("--p", 0);
  return el;
}

export function initOutput(host, ctl, outputChecked) {
  // 상태 — 원본 MotorOutput 필드 이름 그대로 (valueMotor1~4 → value[0~3])
  const st = { value: [0, 0, 0, 0], masterValue: 0, curValue: 0, isMaster: false, isPlay: false, isStop: false };
  const co = coroutines();
  let gen = 0; // 탭을 떠나면 올려서 돌던 반복을 멈춤(원본: 오브젝트가 꺼지면 코루틴 멈춤)
  let masterRunning = false;

  host.innerHTML = [0, 1, 2, 3].map((j) => `
    <div class="mo-col" style="left:${20 + 165 * j}px">
      <div class="mo-box"><i class="mo-fill"></i><span class="mo-boxval">0</span></div>
      <div class="mo-val">0</div><div class="mo-kv">0</div><div class="mo-name" data-i18n="${100 + j}"></div>
    </div>`).join("") + `<div class="mo-master"><div class="mo-mlabel" data-i18n="58"></div></div>`;
  const cols = [...host.querySelectorAll(".mo-col")];

  // ── MotorSlider: 값이 바뀌면 숫자·큰 칸 채우기 ──
  const sliders = cols.map((col, j) => {
    const s = vslider("", () => motorDown(j), (raw) => {
      const v = Math.trunc(snap(raw));
      st.value[j] = v;
      col.querySelector(".mo-fill").style.height = (v / MAX) * 100 + "%";
      col.querySelector(".mo-boxval").textContent = v;
      col.querySelector(".mo-val").textContent = v;
    });
    col.insertBefore(s, col.querySelector(".mo-val"));
    return s;
  });
  const master = vslider("big", masterDown, (raw) => { // MotorOutput.SliderValueChange
    st.masterValue = Math.trunc(snap(raw));
    if (!st.isMaster) return;
    sliders.forEach((s) => s.set(st.masterValue));
  });
  host.querySelector(".mo-master").prepend(master);

  // ── MotorSlider.OnDown → SendMotorData → SendMotorData_co ──
  function motorDown(j) {
    st.curValue = j + 1;
    st.isMaster = false;
    if (st.isMaster || st.isPlay) return;
    st.isPlay = true;
    motorLoop();
  }
  async function motorLoop() {
    const g = gen;
    for (;;) {
      await sleep(TICK);
      if (g !== gen) return;
      if (st.isMaster || st.isStop) break;
      if (!ctl.order) { console.warn("모터 순서를 아직 못 받아 보내지 않음"); break; } // 원본은 여기서 예외 → isPlay 가 참으로 남았음
      const b = [Direction.None, Parts.All, 0, 0, 0, 0, 0, 0, 0, 0];
      st.value.forEach((v, j) => { const num = ctl.order[j]; b[num * 2] = v & 0xff; b[num * 2 + 1] = (v >> 8) & 0xff; });
      send(DT.Motor, b);
    }
    st.isPlay = false;
  }

  // ── MotorOutput.OnDown → MasterSendData_co (원본은 누를 때마다 반복이 하나씩 늘었다 — 여기선 하나만) ──
  function masterDown() {
    st.isMaster = true;
    if (!masterRunning) masterLoop();
  }
  async function masterLoop() {
    const g = gen;
    masterRunning = true;
    sliders.forEach((s) => s.set(st.masterValue));
    for (;;) {
      if (g !== gen) return; // 탭을 떠남(disable 이 masterRunning 을 이미 내림)
      if (!st.isMaster || st.isStop) break;
      const v = st.masterValue;
      send(DT.Motor, ctl.bytes(Direction.None, Parts.All, [v, v, v, v]));
      await sleep(TICK);
    }
    masterRunning = false;
    master.set(0);
  }

  function sliderReset() { st.masterValue = 0; master.set(0); sliders.forEach((s) => s.set(0)); }

  // MotorKV → "N KV" (출력 경고를 체크했고 순서를 받았을 때만, 아니면 0 KV) — SettingSliderUI
  on("MotorKV", (m) => {
    const kv = [m.motor1KV, m.motor2KV, m.motor3KV, m.motor4KV];
    cols.forEach((col, i) => {
      col.querySelector(".mo-kv").textContent = (ctl.order && outputChecked() ? kv[ctl.order[i] - 1] : 0) + " KV";
    });
  });

  return {
    isStop: () => st.isStop,
    /** MotorOutput.MotorWarning: 모두 멈춤 → 슬라이더 0 → 정지 두 번(0.02초 간격) */
    motorWarning() {
      st.curValue = 0; st.isMaster = false; st.isStop = true; st.isPlay = false;
      co.start(async (wait) => {
        sliderReset(); st.isPlay = false;
        ctl.stop(); await wait(TICK); ctl.stop(); await wait(TICK);
        st.isStop = false;
      });
    },
    /** OnDisable: 값·깃발 처음으로, 슬라이더 0 (보내지는 않음) */
    disable() {
      gen++; co.stopAll(); masterRunning = false;
      Object.assign(st, { value: [0, 0, 0, 0], masterValue: 0, curValue: 0, isMaster: false, isPlay: false, isStop: false });
      sliderReset();
    },
  };
}
