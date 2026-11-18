// 가짜 드론 — 브라우저에서 화면을 시험할 때만 쓴다(앱 안에서는 안 씀). 신호 모양은 crates/link 의 LinkEvent 와 같다.
// 주소에 ?mock=auto 를 붙이면 열자마자 연결된 상태로 시작(&dev=controller 면 조종기로)
import { DataType as DT } from "./protocol.js";
import { NOVAX, BLHELI } from "./panels/esc_keys.js";
import { mockFw } from "./mock_fw.js";

export function mockApi() {
  const subs = new Set();
  const emit = (ev) => subs.forEach((f) => f(ev));
  let timer = null, t0 = 0, connected = false;
  const status = (state, extra = {}) => emit({ kind: "status", state, port: state === "disconnected" ? null : "COM7", device: "none", bootloader: false, reason: null, ...extra });

  function start() {
    status("searching");
    setTimeout(() => {
      connected = true;
      status("connected", { device: new URLSearchParams(location.search).get("dev") || "drone" });
      emit({ kind: "message", msg: { type: "Information", modelNumber: 0x02100d00, version: 0x0401, year: 2026, month: 7, day: 24 } });
      emit({ kind: "message", msg: { type: "LightMode", mode: 0x22, r: 255, g: 0, b: 0 } });
      t0 = performance.now();
      timer = setInterval(() => {
        const s = (performance.now() - t0) / 1000;
        emit({ kind: "message", msg: { type: "State", modeFlight: 16, batteryPercent: 87, batteryVoltage: 41, avgSpeed: 0, receivedRf: 100,
          degreeRoll: 14 * Math.sin(s * 0.9), degreePitch: 9 * Math.sin(s * 0.7 + 1), degreeYaw: 30 * Math.sin(s * 0.25) } });
        if (Math.round(s * 20) % 20 === 0) emit({ kind: "message", msg: { type: "Count", timeRunFlightSec: 5320, countTakeOff: 212, countLanding: 209, countAccident: 3 } });
        if (Math.round(s * 20) % 20 === 10) emit({ kind: "message", msg: { type: "MotorKV", motor1KV: 1800, motor2KV: 1810, motor3KV: 1820, motor4KV: 1830 } });
      }, 50);
    }, 700);
  }
  function stop(reason = "user") {
    clearInterval(timer); timer = null; connected = false;
    status("disconnected", { reason });
  }
  if (new URLSearchParams(location.search).get("mock") === "auto") setTimeout(start, 50);

  // 모터·ESC 탭 시험용 대답(진짜 드론 흉내). ESC 종류: window.__mockEsc = "novax"(기본) | "blheli" | "none",
  // 굽기 실패 흉내: window.__mockEscFail = true
  let motorOrder = 0;
  // 조종기 설정(22바이트)·드론 충돌 자세 유지 흉내 — 조종기 펌웨어처럼 받은 값을 그대로 적용하고 돌려줌(window.__mockHold = null 이면 옛 드론: 답 없음)
  const CK = ["option", "controlSpeed", "position", "team", ...["rnp", "yaw", "thr"].flatMap((k) => [1, 2, 3, 4, 5, 6].map((n) => k + n))];
  let ctrlCfg = [0x1e, 3, 5, 1, 12, 25, 37, 50, 75, 100, 12, 25, 37, 50, 75, 100, 20, 38, 55, 68, 92, 100];
  const ctrlMsg = () => ({ type: "ConfigurationController", ...Object.fromEntries(CK.map((k, i) => [k, ctrlCfg[i]])) });
  window.__mockHold ??= 0;
  const msg = (m, ms = 30) => setTimeout(() => connected && emit({ kind: "message", msg: m }), ms);
  const escCfg = (i) => (window.__mockEsc ?? "novax") === "blheli"
    ? { type: "EscConfigBLHeliS", motorIndex: i, Eep_FW_Main_Revision: 16, Eep_FW_Sub_Revision: 7, Eep_Layout_Revision: 7, Eep_Pgm_Startup_Pwr: 9,
      Eep_Pgm_Pwm_Freq: 255, Eep_Pgm_Direction: 1 + (i % 2), Eep_Pgm_Comm_Timing: 3, Eep_Pgm_Min_Throttle: 37, Eep_Pgm_Max_Throttle: 208,
      Eep_Pgm_Beep_Strength: 40, Eep_Pgm_Beacon_Strength: 80, Eep_Pgm_Beacon_Delay: 4, Eep_Pgm_Demag_Comp: 2, Eep_Pgm_Temp_Prot_Enable: 7,
      Eep_Pgm_Brake_On_Stop: 0, Eep_Pgm_LED_Control: i }
    : { type: "EscConfigNovaX", motorIndex: i, Eep_FW_Main_Revision: 16, Eep_FW_Sub_Revision: 7, Eep_Pgm_Startup_Power_Min: 21, Eep_Pgm_Startup_Beep: 1,
      Eep_Pgm_Dithering: 255, Eep_Pgm_Startup_Power_Max: 26, Eep_Pgm_Rpm_Power_Slope: 9, Eep_Pgm_Pwm_Freq: 96, Eep_Pgm_Direction: 1 + (i % 2),
      Eep_Pgm_Braking_Strength: 255, Eep_Pgm_Comm_Timing: 4, Eep_Pgm_Beep_Strength: 60, Eep_Pgm_Beacon_Strength: 80, Eep_Pgm_Beacon_Delay: 5,
      Eep_Pgm_Demag_Comp: 2, Eep_Pgm_Temp_Prot_Enable: 0, Eep_Pgm_Brake_On_Stop: 0, Eep_Pgm_LED_Control: i };
  // 조종기 1.3.0 흉내(window.__mockCtl13 = false 면 옛 조종기: 데드존 · 맡기 상태에 답 없음)
  //  - 데드존 3바이트 · 맡아 둔 드론 설정 상태(window.__mockLink: 0 드론 없음 · 1 연결 대기 · 2 비행 중)
  //  - 드론과 연결 안 됨(link 0)이면 조종기가 PID · 충돌 자세를 맡아 두고(상태 1) 물으면 맡은 값으로 답함 · 연결되면 바로 넣음(상태 0)
  window.__mockCtl13 ??= true;
  window.__mockLink ??= 0;
  let dz = [9, 9, 7], pidBox = null, pidStep = 0, holdStep = 0;
  const DRONE_PID = [58, 36, 120, 100, 60, 100, 100, 60, 20, 100, 0, 0, 0, 101, 1, 0, 0, 0, 0, 0];
  const pidMsg = (b) => ({ type: "PidConfigure", ...Object.fromEntries(["degreeRange", "rotateSpeed", "degree_roll_p", "rate_roll_p", "rate_roll_d", "degree_pitch_p", "rate_pitch_p", "rate_pitch_d",
    "degree_yaw_p", "rate_yaw_p", "rate_yaw_d", "dynamicStability", "TPA_Advence", "thrustLinear", "throttleAssist", "temp3", "temp4", "temp5", "temp6", "temp7"].map((k, i) => [k, b[i] ?? 0])) });
  const viaCtl = () => (new URLSearchParams(location.search).get("dev") || "drone") === "controller";
  function answer(dt, p, to) {
    const ctl13 = viaCtl() && window.__mockCtl13;
    if (ctl13 && dt === DT.Request && p[0] === DT.Deadzone && to === 0x20) { msg({ type: "Deadzone", rollPitch: dz[0], yaw: dz[1], throttle: dz[2] }); return; }
    if (ctl13 && dt === DT.Deadzone && to === 0x20 && p.length === 3) { if (p[0] <= 30 && p[1] <= 30 && p[2] <= 20) dz = p.slice(); msg({ type: "Deadzone", rollPitch: dz[0], yaw: dz[1], throttle: dz[2] }); return; }
    if (ctl13 && dt === DT.Request && p[0] === DT.DroneSettingState) { msg({ type: "DroneSettingState", link: window.__mockLink, pid: pidStep, crashHold: holdStep }); return; }
    if (ctl13 && window.__mockLink !== 1 && dt === DT.PidConfigure) { pidBox = p.slice(0, 20); pidStep = 1; return; }
    if (ctl13 && window.__mockLink !== 1 && dt === DT.Request && p[0] === DT.PidConfigure) { msg(pidMsg(pidBox ?? DRONE_PID)); return; }
    if (ctl13 && window.__mockLink !== 1 && dt === DT.Configuration && p.length === 2) { window.__mockHold = p[0]; holdStep = 1; return; }
    if (ctl13 && window.__mockLink === 1 && (pidStep || holdStep)) { pidStep = 0; holdStep = 0; }
    if (dt === DT.Request && p[0] === DT.PidConfigure) { msg(pidMsg(pidBox ?? DRONE_PID)); return; }
    if (dt === DT.Request && p[0] === DT.Configuration) { if (to === 0x20) msg(ctrlMsg()); else if (window.__mockHold !== null) msg({ type: "Configuration", modeCrashHold: window.__mockHold, reserved: 0 }); return; }
    if (dt === DT.Configuration && to === 0x20 && p.length === 22) { ctrlCfg = p.slice(); msg(ctrlMsg()); return; }
    if (dt === DT.Configuration && p.length === 2) { if (window.__mockHold !== null && p[0] < 3) window.__mockHold = p[0]; return; }
    if (dt === DT.Request && p[0] === DT.MotorOrder) {
      msg({ type: "MotorOrder", motorOrder });
      msg({ type: "MotorKV", motor1KV: 1800, motor2KV: 1810, motor3KV: 1820, motor4KV: 1830 });
    } else if (dt === DT.MotorOrder) motorOrder = p[0];
  }
  // ESC 바이패스 흉내(api.escRead · escConfig · escFlash · escLeave) — 쓴 설정은 기억해 두었다가 다시 읽을 때 돌려줌
  const escSaved = {};
  const escSubs = new Set();
  const escBytes = (i) => {
    if ((window.__mockEsc ?? "novax") === "none") throw "ESC 부트로더가 답하지 않음(가짜)";
    const m = escCfg(i), keys = m.type === "EscConfigNovaX" ? NOVAX : BLHELI;
    return escSaved[i] ?? keys.map((k) => m[k]);
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  return {
    real: false,
    connect: async () => { if (!connected) start(); },
    disconnect: async () => stop("user"),
    send: async (dataType, payload, to) => { console.log("[mock send]", dataType, Array.from(payload), to); answer(dataType, Array.from(payload), to); },
    escMode: async (on) => { window.__escMode = on; console.log("[mock esc]", on); },
    escRead: async (esc) => { await wait(60); return { config: escBytes(esc), layout: "#U_H_90#" }; },
    escConfig: async (config) => { await wait(60); escBytes(config[0]); escSaved[config[0]] = Array.from(config); console.log("[mock esc config]", Array.from(config)); return escSaved[config[0]]; },
    escFlash: async (esc, hex) => {
      console.log("[mock esc flash]", esc, hex.length);
      for (let done = 1; done <= 14; done++) { await wait(30); escSubs.forEach((f) => f({ esc, done, total: 14 })); if (window.__mockEscFail && done === 5) throw "되읽기 확인 실패(가짜)"; }
      return { esc, keptSettings: true, seconds: 0.4 };
    },
    escLeave: async () => { console.log("[mock esc leave]"); },
    onEsc: async (cb) => { escSubs.add(cb); return () => escSubs.delete(cb); },
    status: async () => ({ state: connected ? "connected" : "disconnected", port: connected ? "COM7" : null, device: connected ? (new URLSearchParams(location.search).get("dev") || "drone") : "none", bootloader: false }),
    version: async () => "2.2.2",
    profileLoad: async (n) => localStorage.getItem("profile" + n),
    profileSave: async (n, json) => localStorage.setItem("profile" + n, json),
    onEvent: async (cb) => { subs.add(cb); return () => subs.delete(cb); },
    // 인터넷 받기 — 가짜 앱은 인터넷 없음. 시험에서 window.__mockNet(url) → ArrayBuffer 를 넣으면 그것을 씀
    netGet: async (url) => { if (window.__mockNet) return window.__mockNet(url); throw new Error("가짜 앱: 인터넷 없음"); },
    ...mockFw({ release: () => { const was = connected; if (connected) stop("user"); return was; } }), // 펌웨어 굽기 흉내(mock_fw.js)
  };
}
