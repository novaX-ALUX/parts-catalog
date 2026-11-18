// 시작점 — 언어 읽기 → 화면 틀 → 탭 내용 → 속(Rust) 신호 받기
import { api } from "./api.js";
import { handleLinkEvent, store, on } from "./store.js";
import { loadLanguages, applyStatic } from "./i18n.js";
import { initShell } from "./shell.js";
import { initStatus } from "./panels/status.js";
import { initPid } from "./panels/pid.js";
import { initMotor } from "./panels/motor.js";
import { initEsc } from "./panels/esc.js";
import { initController } from "./panels/controller.js";

addEventListener("error", (e) => console.error("ERR", e.message, e.filename, e.lineno));
addEventListener("unhandledrejection", (e) => console.error("REJ", e.reason?.stack || e.reason));

// 시험용 기록: 보낸 것(window.__sent)·받은 종류별 개수(window.__rx) — 자동 시험(tools/gui)이 읽는다
window.__dsf = { store, api };
window.__sent = []; window.__rx = {};
const _send = api.send;
api.send = (dt, p, to = null) => { window.__sent.push([dt, Array.from(p), to, Date.now()]); if (window.__sent.length > 2000) window.__sent.shift(); return _send(dt, p, to); };
on("message", (m) => (window.__rx[m.type] = (window.__rx[m.type] || 0) + 1));

await loadLanguages();
applyStatic();
initShell();
initStatus(document.getElementById("page-status"));
initPid(document.getElementById("page-pid"));
initMotor(document.getElementById("page-motor"));
initEsc(document.getElementById("page-esc"));
initController(document.getElementById("page-controller"));
await api.onEvent(handleLinkEvent);
const s = await api.status();
handleLinkEvent({ kind: "status", ...s });
window.__ready = true;
