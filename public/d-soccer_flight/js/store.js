// 화면 공용 상태 — 원본 SerialManager 가 들고 있던 값(연결 상태·드론이 보낸 마지막 값)을 한곳에
const subs = new Map();

export const store = {
  link: { state: "disconnected", port: null, device: "none", bootloader: false, reason: null },
  info: null,   // Information
  state: null,  // State (자세·배터리 등)
  count: null,  // Count
  pid: null,    // PidConfigure
  team: null,   // LightMode 팀 색 {r,g,b}
  position: null,
  droneSetting: null, // DroneSettingState — 조종기 1.3.0 이 맡아 둔 드론 설정 상태(drone_setting.js)
  get connected() { return this.link.state === "connected"; },
  get isDrone() { return this.link.device === "drone"; },
  get isController() { return this.link.device === "controller"; },
};

export function on(topic, fn) {
  if (!subs.has(topic)) subs.set(topic, new Set());
  subs.get(topic).add(fn);
  return () => subs.get(topic).delete(fn);
}
export function emit(topic, data) {
  subs.get(topic)?.forEach((fn) => { try { fn(data); } catch (e) { console.error(topic, e); } });
}

// 속(Rust)에서 온 신호를 store 에 넣고 화면에 알린다
export function handleLinkEvent(ev) {
  if (ev.kind === "status") {
    const prev = store.link;
    store.link = { ...prev, ...ev };
    emit("link", { prev, now: store.link });
  } else if (ev.kind === "message") {
    const m = ev.msg;
    switch (m.type) {
      case "Information": store.info = m; break;
      case "State": store.state = m; break;
      case "Count": store.count = m; break;
      case "PidConfigure": store.pid = m; break;
    }
    emit(m.type, m);
    emit("message", m);
  } else if (ev.kind === "log") {
    console.debug("[link]", ev.text);
  }
}
