// ESC 탭 — 원본 ESC_Content: ESCManager(들어올 때 알림 · 읽기/보내기/초기화 · ESC 모드) + SerialManager.EscModeEscape.
// 설정 칸은 esc_config.js, 펌웨어 바꾸기는 esc_update.js.
// 읽기·쓰기·굽기는 바이패스(api.escRead · escConfig · escFlash — 속이 ESC 부트로더와 바로 주고받고 되읽어 확인).
// ESC 모드: "Yes" 로 읽기를 시작할 때 켬(속은 생존 신호·무응답 끊기를 멈춤). 다른 탭으로 가면 탈출 신호 + "ESC 모드를 해제 중입니다" 1.5초.
import { api } from "../api.js";
import { store, on } from "../store.js";
import { t, applyStatic } from "../i18n.js";
import { notify, blocking, showPage } from "../shell.js";
import { coroutines } from "../widgets.js";
import { initEscConfig } from "./esc_config.js";
import { configFromBytes } from "./esc_keys.js";
import { initEscUpdate } from "./esc_update.js";
import { setMotorMask } from "./motor_mask.js";


export function initEsc(root) {
  root.innerHTML = `
    <div id="esc-common" class="box"><h3>Common Parameters</h3><div class="rule"></div></div>
    <div id="esc-units"></div>
    <div id="esc-bar" class="box">
      <button class="esc-b" id="esc-hex" data-i18n="155" data-fit></button><div id="esc-hexname"></div>
      <button class="esc-b" id="esc-reset" data-i18n="120"></button>
      <button class="esc-b" id="esc-updall" data-i18n="161"></button>
      <button class="esc-b" id="esc-send" data-i18n="162"></button>
      <button class="esc-b" id="esc-read" data-i18n="164"></button>
      ${["send", "read"].map((k) => `
        <div class="esc-pop hidden" id="esc-pop-${k}"><i class="esc-pop-detect"></i><div class="esc-pop-box">
          ${[0, 1, 2, 3].map((n) => `<button class="esc-b" data-n="${n}">ESC${n + 1}</button>`).join("")}
          <button class="esc-b all" data-n="all" data-i18n="163"></button></div><i class="esc-pop-cone"></i></div>`).join("")}
    </div>
    <div id="esc-note" class="hidden"><div class="esc-note-box">
      <div class="esc-note-1" data-i18n="118"></div><div class="esc-note-2" data-i18n="114"></div>
      <button class="esc-b" id="esc-yes">Yes</button><button class="esc-b" id="esc-no">No</button></div></div>`;
  const $ = (s) => root.querySelector(s);
  applyStatic(root);
  const co = coroutines();
  const cfg = initEscConfig($("#esc-common"), $("#esc-units"));
  const updateBtns = [0, 1, 2, 3].map((i) => $("#esc-upd-" + i)).concat($("#esc-updall"));
  const upd = initEscUpdate({ page: root, cfg, readOne: readEscConfig, readAll: readEscConfigsAll,
    hexOpenBtn: $("#esc-hex"), fileNameEl: $("#esc-hexname"), updateBtns });

  let escMode = false; // SerialManager.isEscMode
  const setEscMode = (on) => { escMode = on; api.escMode(on); }; // EscModeControl

  // ── 읽기 ──
  /** ESC 하나의 설정을 읽어 그 칸에 채움. 못 읽으면 false */
  async function fetchOne(i) {
    try {
      const r = await api.escRead(i);
      const m = configFromBytes(r.config);
      if (r.config.length === 19) cfg.onNovaX(m); else cfg.onBLHeli(m);
      return true;
    } catch (e) { console.warn(`[esc] ESC${i + 1} 읽기 실패`, e); return false; }
  }
  /** ReadEscConfigsAll(isFirst): ESC 1~4 를 차례로 읽음 → 못 읽은 칸은 "데이터 없음" */
  function readEscConfigsAll(isFirst) {
    $("#esc-note").classList.add("hidden");
    if (!isFirst && !cfg.isAllEscSame()) { notify(176); return; }
    co.start(async () => {
      setEscMode(true);
      blocking(t(113));
      for (let i = 0; i < 4; i++) {
        blocking(t(169 + i));
        if (!(await fetchOne(i))) cfg.statusSet(i, 188);
      }
      blocking(null);
    });
  }
  /** ReadEscConfig(num): 못 읽으면 "수신 실패" 1초 */
  function readEscConfig(num) {
    co.start(async (wait) => {
      blocking(t(num + 169));
      if (!(await fetchOne(num))) { blocking(t(115)); await wait(1000); }
      blocking(null);
    });
  }

  // ── 보내기 (쓰고 되읽어 확인까지 속이 함 → 되읽은 값으로 칸을 다시 채움) ──
  async function sendOne(i) {
    const p = cfg.has(i, "nx") ? cfg.sendNovaX(i) : cfg.has(i, "bl") ? cfg.sendBLHeli(i) : null;
    if (!p) return true;
    try {
      const back = await p;
      if (back.length === 19) cfg.onNovaX(configFromBytes(back)); else cfg.onBLHeli(configFromBytes(back));
      return true;
    } catch (e) { console.warn(`[esc] ESC${i + 1} 설정 쓰기 실패`, e); return false; }
  }
  function sendEscConfigAll() {
    if (!cfg.isAllEscSame()) { notify(176); return; }
    co.start(async () => {
      let ok = true;
      for (let i = 0; i < 4; i++) { blocking(t(i + 165)); ok = (await sendOne(i)) && ok; }
      blocking(null); notify(ok ? 112 : 115);
    });
  }
  function sendEscConfig(num) {
    co.start(async () => {
      blocking(t(num + 165));
      const ok = await sendOne(num);
      blocking(null); notify(ok ? 112 : 115);
    });
  }

  // ── 아래 단추 줄 ──
  $("#esc-hex").onclick = () => upd.openHexDialog();
  $("#esc-reset").onclick = () => { cfg.resetData(); notify(107); }; // ResetEscConfigs
  $("#esc-updall").onclick = () => upd.updateEscAll();
  [0, 1, 2, 3].forEach((i) => ($("#esc-upd-" + i).onclick = () => upd.sendEscInfoUpdate(i)));
  // 작은 창(Send/Read Buttons Panel): 단추로 열고, 창에서 벗어나거나 사이 칸(Detecting Area)을 누르면 닫힘
  for (const [k, one, all] of [["send", sendEscConfig, sendEscConfigAll], ["read", readEscConfig, () => readEscConfigsAll(false)]]) {
    const pop = $("#esc-pop-" + k);
    $("#esc-" + k).onclick = () => pop.classList.remove("hidden");
    pop.onpointerleave = () => pop.classList.add("hidden");
    pop.querySelector(".esc-pop-detect").onclick = () => pop.classList.add("hidden");
    pop.querySelectorAll(".esc-pop-box button").forEach((b) => (b.onclick = () => (b.dataset.n === "all" ? all() : one(+b.dataset.n))));
  }

  // ── 들어올 때 알림(배터리 연결?) — 2.25초 뒤에야 누를 수 있음 ──
  const noteBtns = [$("#esc-yes"), $("#esc-no")];
  let noteTimer;
  function showNote() {
    $("#esc-note").classList.remove("hidden");
    noteBtns.forEach((b) => (b.disabled = true));
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => noteBtns.forEach((b) => (b.disabled = false)), 2250);
  }
  $("#esc-yes").onclick = () => (api.web ? notify(221, 2500) : readEscConfigsAll(true)); // 웹판: ESC 바이패스는 아직 PC판만
  $("#esc-no").onclick = () => { // 상태 탭으로 · 막 끄기 · 연결 알림 끄기
    showPage("status");
    setMotorMask(false, "esc");
    document.getElementById("devicePopup")?.classList.add("hidden");
  };

  // ── ESC 모드 탈출 (SerialManager.EscModeEscape) ──
  function escModeEscape() {
    if (!escMode) return;
    if (store.connected) { blocking(t(178)); setTimeout(() => blocking(null), 1500); api.escLeave().catch((e) => console.warn("[esc] 나오기 실패", e)); } // ESC 를 다시 켜고 드론을 비행 대기로
    setEscMode(false);
    cfg.resetPanels();
  }
  // ESC 모드에서 "연결 끊기": 속(Rust)이 탈출 신호 → 1.5초 뒤 닫기를 하므로 화면은 글자만 띄운다
  document.getElementById("connectBtn").addEventListener("click", () => {
    if (!escMode || !store.connected) return;
    escMode = false; // 속에는 알리지 않는다(알리면 속이 탈출 신호 없이 바로 닫음)
    blocking(t(178)); setTimeout(() => blocking(null), 1600);
    cfg.resetPanels();
  }, true);

  // ── 탭 열기/닫기 (ESCManager · ESCUpdate OnEnable/OnDisable) ──
  let isOpen = false;
  function open() {
    isOpen = true;
    if (store.connected && store.isDrone) showNote(); else $("#esc-note").classList.add("hidden");
    cfg.hideCommon();
    upd.enable();
    setMotorMask(true, "esc");
  }
  function close() {
    isOpen = false;
    co.stopAll(); upd.disable();
    root.querySelectorAll(".esc-pop").forEach((p) => p.classList.add("hidden"));
    $("#esc-note").classList.add("hidden");
    setMotorMask(false, "esc");
    escModeEscape();
  }
  on("page", (name) => { if (name === "esc") open(); else if (isOpen) close(); });
  on("link", ({ prev, now }) => { if (prev.state === "connected" && now.state !== "connected") upd.reset(); });
}
