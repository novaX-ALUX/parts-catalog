// 조종기가 맡아 둔 드론 설정 상태(조종기 1.3.0 · DataType.DroneSettingState) — 조종기에 꽂혀 있을 때 1초마다 물음
// 조종기만 PC 에 꽂혀 있어도 앱에서 드론 PID · 충돌 자세를 바꿀 수 있고, 조종기가 드론과 연결되면(대기 중) 보냄.
// 조종기 탭 · PID 탭이 같이 씀(한 번만 켜짐). 옛 조종기는 답하지 않음 → store.droneSetting 은 null 그대로.
import { store, on, emit } from "./store.js";
import { send, P } from "./proto.js";

export const Step = { Done: 0, Waiting: 1, Sending: 2, Failed: 3, Default: 4 };
export const Link = { None: 0, Ready: 1, Locked: 2 };

let started = false, timer = null, last = null;

/** 상태 글 번호(언어표) — PID · 충돌 자세 공통. null = 보일 글 없음 */
export function stepText(step, link) {
  if (step === Step.Default) return 219;              // 드론과 연결되면 기본값으로 바꿈
  if (step === Step.Failed) return 218;               // 드론이 받지 않음
  if (step === Step.Sending) return 217;              // 보내는 중
  if (step === Step.Waiting) return link === Link.Locked ? 216 : 215;   // 대기로 돌아오면 · 연결되면 보냄
  if (link === Link.None) return 220;                 // 연결 끊김 — 마지막 값
  return null;
}

export function startDroneSetting() {
  if (started) return;
  started = true;
  const ask = () => { if (store.connected && store.isController) send(P.DataType.Request, [P.DataType.DroneSettingState], P.DeviceType.Controller); };
  const loop = () => { clearInterval(timer); timer = null; if (store.connected && store.isController) { ask(); timer = setInterval(ask, 1000); } };
  on("link", ({ now }) => { if (now.state !== "connected") { store.droneSetting = null; last = null; emit("droneSetting", null); } loop(); });
  on("DroneSettingState", (m) => {
    const prev = last;
    last = m; store.droneSetting = m;
    // 맡은 값이 드론에 들어간 순간 — 드론의 진짜 값을 다시 받아 화면을 맞춤
    if (prev && prev.pid !== Step.Done && m.pid === Step.Done) send(P.DataType.Request, [P.DataType.PidConfigure]);
    if (prev && prev.crashHold !== Step.Done && m.crashHold === Step.Done) send(P.DataType.Request, [P.DataType.Configuration], P.DeviceType.Drone);
    emit("droneSetting", m);
  });
  loop();
}
