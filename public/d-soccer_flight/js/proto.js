// 화면에서 드론으로 보내기 — 원본 SerialManager.CreateSendData(dataType, bytes, to) 와 같은 꼴.
// 값 이름(DataType·CommandType …)은 protocol.js(원본 C# 열거형을 그대로 옮긴 것)에서 가져온다.
import { api } from "./api.js";
// protocol.js 가 아직 없을 때도 화면이 뜨도록(개발 중) 동적으로 읽는다
const C = await import("./protocol.js").catch(() => ({}));

// 원본 C# 이름 → 화면 코드에서 쓰는 짧은 이름
export const P = {
  DataType: C.DataType ?? {},
  DeviceType: C.DeviceType ?? {},
  CommandType: C.CommandType ?? {},
  FlightEvent: C.FlightEvent ?? {},
  LedMode: C.LED?.Drone?.Mode ?? {},   // 원본 LED.Drone.Mode.Type (TeamRgbHold · PositionHold …)
  raw: C,
};

/** 보내기: to 를 비우면 지금 연결된 장치로 */
export function send(dataType, bytes, to = null) {
  if (dataType === undefined) { console.warn("send: dataType 없음", bytes); return; }
  return api.send(dataType, Uint8Array.from(bytes), to);
}
