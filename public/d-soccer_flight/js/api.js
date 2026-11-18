// 화면 ↔ 속(Rust) 다리. Tauri 안이면 진짜 명령, 브라우저(개발·화면 시험)면 가짜 드론(mock.js).
const T = window.__TAURI__;

function tauriApi() {
  const inv = T.core.invoke;
  return {
    real: true,
    connect: () => inv("link_connect"),
    disconnect: () => inv("link_disconnect"),
    // 원본 CreateSendData(dataType, bytes, to)
    send: (dataType, payload, to = null) => inv("link_send", { dataType, payload: Array.from(payload), to }),
    escMode: (on) => inv("link_esc_mode", { on }),
    status: () => inv("link_status"),
    version: () => inv("app_version"),
    profileLoad: (n) => inv("profile_load", { n }),
    profileSave: (n, json) => inv("profile_save", { n, json }),
    onEvent: (cb) => T.event.listen("link", (e) => cb(e.payload)),
    // 펌웨어 굽기(src-tauri/src/firmware.rs) — 파일은 바이트로 넘김, port 가 null 이면 본 연결의 포트
    fwRelease: () => inv("fw_release"),
    fwCheck: (bytes) => inv("fw_check", { bytes: Array.from(bytes) }),
    fwProbe: (port, bytes) => inv("fw_probe", { port, bytes: Array.from(bytes) }),
    fwUpdate: (port, bytes) => inv("fw_update", { port, bytes: Array.from(bytes) }),
    onFw: (cb) => T.event.listen("fw", (e) => cb(e.payload)),
    // 부트로더 굽기(src-tauri/src/bootloader.rs · 칩 안 DFU) — 앱 펌웨어 업데이트 뒤 이어서
    blDriverReady: () => inv("bl_driver_ready"),
    blDriverInstall: () => inv("bl_driver_install"), // Windows: 앱이 가진 DFU USB 드라이버 설치(관리자 승인 한 번 · src-tauri/src/driver.rs)
    blUpdate: (port, bytes, model, sha256) => inv("bl_update", { port, bytes: Array.from(bytes), model, sha256 }),
    blRetry: (bytes, model, sha256) => inv("bl_retry", { bytes: Array.from(bytes), model, sha256 }),
    onBl: (cb) => T.event.listen("bl", (e) => cb(e.payload)),
    // ESC 펌웨어·설정(src-tauri/src/esc.rs · 바이패스) — 드론은 바이트만 넘기고 순서·되읽기 확인은 속(Rust)이 한다
    escRead: (esc) => inv("esc_read", { esc }),                     // → { config: [19 또는 17 바이트], layout }
    escConfig: (config) => inv("esc_config", { config: Array.from(config) }), // 설정 쓰기 → 되읽은 묶음
    escFlash: (esc, hex) => inv("esc_flash", { esc, hex }),          // hex 글자 그대로 · 진행은 onEsc
    escLeave: () => inv("esc_leave"),
    onEsc: (cb) => T.event.listen("esc", (e) => cb(e.payload)),
    // 인터넷 펌웨어 목록·파일 받기(src-tauri/src/net.rs) — ArrayBuffer 로 옴
    netGet: (url, sha256) => inv("net_get", { url, sha256: sha256 ?? null }),
  };
}

// 웹판(사이트에 올린 것 · tools/web_build.mjs 가 window.DSF_WEB 을 켬, 시험은 주소 ?web) = Web Serial + WASM 상태 기계(web_api.js)
const WEB = !T && (window.DSF_WEB || new URLSearchParams(location.search).has("web"));
export const api = T ? tauriApi() : WEB ? await (await import("./web_api.js")).webApi() : (await import("./mock.js")).mockApi();
