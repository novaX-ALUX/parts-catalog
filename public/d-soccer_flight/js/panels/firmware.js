// 드론·조종기 펌웨어 굽기 — 원본 Canvas/Top/Firmware 의 두 창.
//  · FirmwareVersion  (FirmwareFileManager): 파일 고르기. 원본은 회사 SharePoint 목록이었고, 지금은 깃카탈로그 목록(netlist.js)에서
//    연결된 장치(드론 · 조종기)의 펌웨어만 보여 주고 [업데이트] 때 내려받는다. 인터넷이 없으면 앱 안에 든 최신판만 보인다.
//    원본에 없는 'PC에서 선택'(ESC 창과 같은 버튼)으로 .ax 도 고를 수 있다 — 마지막에 고른 쪽을 굽는다.
//  · [Firmware Update] (MainWindow · FirmwarePopup · Update Progess Bar): 장치 확인 → 물어보기 → 굽기 → 결과.
// 상태 탭 '업데이트 확인' 이 openFirmware() 를 부른다(원본 Firmware_btn: 창 켜기 + CloseSerial).
// 속은 src-tauri/src/firmware.rs(fw_release · fw_check · fw_probe · fw_update), 브라우저 시험은 mock_fw.js.
//  · 원본에 없는 것: 앱 펌웨어가 끝나면 이어서 부트로더(칩 안 DFU · src-tauri/src/bootloader.rs)를 확인한다 — 앱 안 목록
//    (assets/firmware/bootloader/index.json)에 그 장치 것이 있을 때만. 같으면 쓰지 않고, 앱 판이 DFU 를 모르면 건너뛴다.
import { api } from "../api.js";
import { t, applyStatic, onLang, fitText, fitAll } from "../i18n.js";
import { store } from "../store.js";
import { fetchFirmwareList, firmwareBytes } from "../netlist.js";
import { dropList, dropListClose, buttonTransition } from "../widgets.js";

const st = { bytes: null, name: null, file: null, port: null, info: null, isVersionUp: false, busy: false, bar: 0, real: 0, text: null,
  list: [], online: false, loading: false, drone: null, shown: [], source: null, downloading: false, // source: "list" | "pc" — 마지막에 고른 쪽
  retryBoot: null, // 부트로더 굽기가 DFU 에 남은 채 실패 — { bytes, model, sha256 } (Yes = 다시 굽기)
  needDriver: null }; // Windows 에 DFU USB 드라이버가 없음 — { model } (Yes = 앱이 가진 드라이버 설치 → 이어서 부트로더)
let el = null;
const BUILTIN_BOOT = new URL("../../assets/firmware/bootloader/", import.meta.url).href;

// 원본 Version.getString(): "minor.build"
const vshort = (v) => `${(v >> 16) & 0xff}.${v & 0xffff}`;

async function build() {
  if (el) return;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = new URL("../../css/firmware.css", import.meta.url).href;
  await new Promise((ok) => { css.onload = css.onerror = ok; document.head.appendChild(css); });
  document.getElementById("stage").insertAdjacentHTML("beforeend", `
    <div id="fwVer" class="abs hidden"><div class="fw-box fwv s9 s-box">
      <div class="fwv-select" data-i18n="80" data-fit></div>
      <div class="fwv-dd s9 s-rb2" role="button"><div class="fwv-label" data-fit=".7">None</div><i class="fwv-arrow"></i><select class="fwv-sel"></select></div>
      <div class="fwv-up" role="button"><i class="fwv-ring s9 s-rb"></i><i class="fwv-upicon"></i><span data-i18n="78" data-fit=".7"></span></div>
      <div class="fwv-wifi hidden"><i></i><span data-i18n="81"></span></div>
      <button class="fwv-pc" data-i18n="187"></button>
      <i class="fw-x" role="button"></i></div></div>
    <div id="fwUp" class="abs hidden"><div class="fw-box fwu s9 s-rb2">
      <div class="fwu-text"></div>
      <div class="fwu-bar s9 s-box hidden"><div class="fwu-fill s9 s-box"></div></div>
      <button class="fwu-btn fwu-yes s9 s-rb hidden">Yes</button><button class="fwu-btn fwu-no s9 s-rb hidden">No</button>
      <i class="fw-x" role="button"></i></div></div>
    <input type="file" id="fwFile" accept=".ax,.br" class="hidden">`);
  const $ = (s) => document.querySelector(s);
  el = { ver: $("#fwVer"), up: $("#fwUp"), select: $("#fwVer .fwv-select"), label: $("#fwVer .fwv-label"), wifi: $("#fwVer .fwv-wifi"), dd: $("#fwVer .fwv-sel"), ddBox: $("#fwVer .fwv-dd"),
    text: $("#fwUp .fwu-text"), bar: $("#fwUp .fwu-bar"), fill: $("#fwUp .fwu-fill"), yes: $("#fwUp .fwu-yes"), no: $("#fwUp .fwu-no"),
    upX: $("#fwUp .fw-x"), file: $("#fwFile") };
  applyStatic(el.ver);

  // ── FirmwareVersion ──
  $("#fwVer .fwv-pc").onclick = () => { el.file.value = ""; el.file.click(); };
  el.file.onchange = async (e) => { const f = e.target.files[0]; if (f && await pick(new Uint8Array(await f.arrayBuffer()), f.name)) st.source = "pc"; };
  el.dd.onchange = selectFirmware;
  // 원본 Dropdown: 누르면 이름 칸 아래로 목록(고른 줄 ▶), 줄을 누르거나 밖을 누르면 닫힘 — 공용 펼친 목록(widgets.dropList)
  el.ddBox.onclick = (e) => { e.stopPropagation(); openList(); };
  [$("#fwVer .fwv-up"), el.yes, el.no].forEach(buttonTransition); // 원본 ButtonTransition(UpdateButton · yes_btn · no_btn)
  $("#fwVer .fwv-up").onclick = updateButton;
  $("#fwVer .fw-x").onclick = closeAll;

  // ── [Firmware Update] ──
  el.yes.onclick = () => (st.retryBoot ? retryBoot() : st.needDriver ? installDriver() : startUpdate());
  el.no.onclick = () => el.up.classList.add("hidden"); // 원본 no_btn: 이 창만 끔
  el.upX.onclick = closeAll; // 원본 exit_btn: 두 창 모두 끔
  api.onFw?.(onFwEvent);
  api.onBl?.(onBlEvent);
  onLang(() => { applyStatic(el.ver); if (st.text) setText(...st.text); });
  setInterval(tickBar, 20); // 원본 UpdateProgressBar.FixedUpdate
  window.__fwPanel = { pick, st, t }; // 자동 시험이 파일을 넣는 문(t = 글자 번호 → 지금 언어 글자)
}

/** 상태 탭 '업데이트 확인' — 원본 Firmware_btn: FirmwareVersion 켜기 · 연결 알림 끄기 · CloseSerial */
export async function openFirmware() {
  if (store.connected) st.drone = store.isDrone; // 원본 FileListSetting(connected_Drone) 은 연결 때 불림 — 닫기 전에 기억
  await build();
  if (!st.online) loadList(); // 처음 켤 때 받기(원본 Start) · 그때 카탈로그를 못 받았으면 다시 시도
  fileListSetting();
  el.ver.classList.remove("hidden");
  fitAll(el.ver); // 숨어 있을 때 넣은 글자를 보이는 지금 맞춤
  document.getElementById("devicePopup")?.classList.add("hidden");
  try { st.port = (await api.fwRelease()) ?? st.port; } catch (e) { console.warn("[fw] 본 연결 닫기 실패", e); }
}

// 원본 FirmwareVersion/Popup/Dropdown/Template: RoundBox_2 #000/0.7 · 항목 28(40×0.7) · 여백 3.5 · 최대 140 · 이름 칸 바로 아래 · 고른 줄 ▶ · 글 Best Fit
function openList() {
  if (!st.shown.length) return;
  const l = dropList(el.ddBox, { items: st.shown.map((f) => f.name), selected: +el.dd.value, cls: "fw", itemH: 28, pad: 3.5, maxH: 140, overlap: 0,
    onPick: (i) => { el.dd.value = String(i); el.dd.dispatchEvent(new Event("change")); } });
  if (l) { l.querySelectorAll(".it span").forEach((s) => (s.dataset.fit = ".7")); fitAll(l); }
}
const closeList = dropListClose;

function closeAll() {
  if (st.busy) return;
  st.needDriver = null; // 드라이버는 다음 업데이트 때 다시 물음
  closeList();
  el.ver.classList.add("hidden");
  el.up.classList.add("hidden");
}

// 원본 Dropdown/Label: Best Fit — 긴 이름(DSoccer_Drone_v1.3.8_261110)도 잘리지 않고 단추에 닿지 않게 줄임(i18n.fitText)
function setLabel(text) {
  el.label.textContent = text;
  fitText(el.label);
}


/** 고른 파일 확인(원본 Binary.FileOpen) — 맞지 않으면 글자 74. 맞으면 true */
async function pick(bytes, name) {
  try {
    st.file = await api.fwCheck(bytes);
    st.bytes = bytes; st.name = name;
    setLabel(name);
    el.label.title = `${st.file.modelName} · v${st.file.version} · ${st.file.year}.${st.file.month}.${st.file.day} · ${st.file.length} B`;
    el.select.textContent = t(80);
    return true;
  } catch (e) {
    st.file = st.bytes = st.name = null;
    setLabel("None");
    el.select.textContent = t(74);
    console.warn("[fw] 파일", e);
    return false;
  }
}

// ── 펌웨어 목록 (원본 GetFileList · FileListSetting · SelectFirmware · DownloadFile) ──
async function loadList() {
  if (st.loading) return;
  st.loading = true;
  const r = await fetchFirmwareList();
  st.list = r.list; st.online = r.online;
  st.loading = false;
  el.wifi.classList.toggle("hidden", st.list.length > 0); // 원본 noWifi_nofification — 앱 안의 것도 없을 때만
  if (!el.ver.classList.contains("hidden")) fileListSetting();
}
/** 연결된 장치 것만(원본은 이름 9번째 글자 'D'·'C' — 목록의 device 가 같은 뜻) */
function fileListSetting() {
  st.shown = st.drone == null ? [] : st.list.filter((f) => f.device === (st.drone ? "drone" : "controller"));
  el.dd.innerHTML = st.shown.map((f, i) => `<option value="${i}">${f.name}</option>`).join("");
  el.dd.disabled = !st.shown.length;
  if (st.source !== "pc" && st.shown.length) selectFirmware();
}
function selectFirmware() {
  const f = st.shown[+el.dd.value] ?? st.shown[0];
  if (!f) return;
  st.source = "list";
  setLabel(f.name); el.label.title = `v${f.version} · ${f.date}${f.builtin ? " · 앱 안" : ""}`;
  el.select.textContent = t(80);
}
/** 원본 UpdateButton → DownloadFile → Popoup_co: 목록에서 고른 것은 내려받아 확인한 뒤 [Firmware Update] 창 */
async function updateButton() {
  if (st.downloading || st.busy) return;
  const f = st.source === "list" ? st.shown[+el.dd.value] ?? st.shown[0] : null;
  if (f) {
    st.downloading = true;
    try {
      if (await pick(await firmwareBytes(f), f.name)) { st.source = "list"; openUpdate(); }
    } catch (e) {
      console.warn("[fw] 내려받기 실패", e);
      el.wifi.classList.remove("hidden"); // 원본: 못 받으면 noWifi 알림을 켜기만 함(애니메이션 없음)
    } finally { st.downloading = false; }
    return;
  }
  if (!st.bytes) { el.wifi.classList.remove("hidden"); return; } // 고른 것이 없음(원본: 인터넷 없음 알림)
  openUpdate();
}

// ── [Firmware Update] 글자 · 버튼 (원본 FirmwarePopup.Set) ──
// y = 원본 popupText.localPosition.y (창 가운데에서 위로 몇 px)
function setText(parts, y = 0) {
  st.text = [parts, y];
  el.text.textContent = parts.map((p) => (typeof p === "number" ? t(p) : p)).join("");
  el.text.style.top = 160 - y - 80 + "px"; // 상자 높이 160 의 가운데가 원본 자리(160 - y)
}
function buttons(mode) { // "none" | "yes" (가운데 하나) | "yesno"
  el.yes.classList.toggle("hidden", mode === "none");
  el.no.classList.toggle("hidden", mode !== "yesno");
  el.yes.classList.toggle("center", mode === "yes");
}
const showBar = (on) => { el.bar.classList.toggle("hidden", !on); if (on) { st.bar = 0; st.real = 0; } };
const showExit = (on) => el.upX.classList.toggle("hidden", !on);

function fail(e) {
  const code = e?.code ?? 14;
  // 원본 FirmwarePopup.Set: 글자 한 줄만(notCorrect · failed …) — 장치 모델·비행 상태는 콘솔에만
  if (e?.found) console.warn(`[fw] ${e.kind}: 장치 ${e.found} · 파일 ${st.file?.modelName ?? "-"}`);
  setText([code], 30); // 원본 화면에서 잰 자리: 창 가운데보다 30 위(hp-unityF3 f04_ask)
  buttons("none"); showBar(false); showExit(true);
  console.warn("[fw]", e?.text ?? e);
}

/** 원본 MainWindow: 장치 확인(CheckInformation) → 앱이면 물어봄(Ask_version / Choice_Update), 부트로더면 바로 굽기 */
async function openUpdate() {
  el.up.classList.remove("hidden");
  buttons("none"); showBar(false); showExit(true);
  if (st.retryBoot) { setText([201], 30); buttons("yes"); return; } // 장치가 아직 칩 안 DFU 에 있음 — 다시 굽기부터
  st.needDriver = null;
  setText([3]); // 펌웨어 정보를 확인합니다
  st.busy = true;
  let r;
  try { r = await api.fwProbe(st.port, st.bytes); } catch (e) { st.busy = false; fail(e); return; }
  st.busy = false;
  st.info = r.info; st.port = r.port ?? st.port;
  if (r.info.bootloader) { startUpdate(); return; } // 원본 bootMode: 묻지 않고 이어서
  st.isVersionUp = r.info.versionValue < st.file.versionValue;
  const head = `Model Number : ${r.info.modelName}\nVersion : v${vshort(r.info.versionValue)} →  v${vshort(st.file.versionValue)}\n\n`;
  if (st.isVersionUp) { setText([head, 10], 30); buttons("yes"); } // 업데이트를 시작하시겠습니까?
  else { setText([head, 8, "\n", 9], 40); buttons("yesno"); } // 같거나 낮습니다 · 그래도 진행하시겠습니까?
}

/** 원본 Yes_btn → BootMode → PreparingUpdate(진행 막대) → Update → Finish / Failed */
async function startUpdate() {
  buttons("none"); showExit(false); showBar(true);
  setText([4], 40); // 펌웨어 업데이트 중 입니다 — 막대 위(원본 y 40)
  st.busy = true;
  try {
    const r = await api.fwUpdate(st.port, st.bytes);
    window.__fwLast = r;
    console.info("[fw] 끝", r.after ? `v${r.after.version} ${r.after.year}.${r.after.month}.${r.after.day}` : "새 정보 없음", r);
    st.port = r.port ?? st.port;
    await bootStep(r.after?.modelNumber); // 이어서 부트로더 — 끝 글자도 여기서 정함
  } catch (e) {
    fail(e);
  } finally {
    st.busy = false;
  }
}

// ── 부트로더(원본에 없음) ──
/** 앱 안 부트로더 목록에서 그 모델 것 */
async function bootloaderFor(model) {
  try {
    const idx = await (await fetch(BUILTIN_BOOT + "index.json")).json();
    return (idx?.schema === "dsoccer-bootloader/1" ? idx.bootloader : []).find((b) => parseInt(b.model, 16) === model) ?? null;
  } catch { return null; }
}

/** 앱 펌웨어 뒤 부트로더 — 없거나 건너뛰면 '펌웨어 업데이트 완료'(15) */
async function bootStep(model) {
  const bl = model != null && api.blUpdate ? await bootloaderFor(model) : null;
  const finish = (parts, y = 0) => { setText(parts, y); showBar(false); showExit(true); };
  if (!bl) return finish([15]);
  if (!(await api.blDriverReady())) { // Windows 에 DFU 드라이버가 없음 — DFU 로 넘기지 않고, Yes 면 앱이 가진 드라이버를 설치
    st.needDriver = { model };
    setText([200], 30); buttons("yes"); showBar(false); showExit(true);
    return;
  }
  const bytes = new Uint8Array(await (await fetch(BUILTIN_BOOT + bl.file)).arrayBuffer());
  setText([198], 40); showBar(true); // 부트로더 업데이트 중 · USB 뽑지 말 것
  try {
    const b = await api.blUpdate(st.port, bytes, model, bl.sha256);
    window.__blLast = b;
    console.info("[bl] 끝", b.same ? "이미 같은 부트로더" : `${bl.name} 씀 ${b.ms} ms`, b);
    finish([b.same ? 15 : 199]);
  } catch (e) {
    console.warn("[bl]", e?.kind, e?.text ?? e);
    if (e?.kind === "dfu") { // 굽다 멈춤 — 장치는 칩 안 DFU 에 남아 있음: 끄지 말고 다시
      st.retryBoot = { bytes, model, sha256: bl.sha256 };
      setText([201], 30); buttons("yes"); showBar(false); showExit(true);
      return;
    }
    // 앱 판이 DFU 를 모름 · 넘어가지 않음 · 드라이버 — 앱 펌웨어는 끝났고 부트로더는 그대로
    finish(e?.kind === "driver" ? [200] : [15], e?.kind === "driver" ? 30 : 0);
  }
}

/** 앱이 가진 DFU USB 드라이버 설치(Windows · 관리자 승인 한 번) → 이어서 부트로더 */
async function installDriver() {
  const { model } = st.needDriver;
  buttons("none"); showExit(false); showBar(false);
  setText([202], 30); // 설치 중 · 승인 창에서 예
  st.busy = true;
  try {
    const r = await api.blDriverInstall();
    console.info("[bl] 드라이버", r);
    st.needDriver = null;
    await bootStep(model);
  } catch (e) {
    console.warn("[bl] 드라이버", e?.kind, e?.text ?? e); // 승인 거절(cancelled) 포함 — 다시 Yes 로
    setText([200], 30); buttons("yes");
  } finally {
    st.busy = false;
    showExit(true);
  }
}

async function retryBoot() {
  const x = st.retryBoot;
  buttons("none"); showExit(false); showBar(true);
  setText([198], 40);
  st.busy = true;
  try {
    const b = await api.blRetry(x.bytes, x.model, x.sha256);
    window.__blLast = b;
    st.retryBoot = null;
    setText([199]); showBar(false);
  } catch (e) {
    console.warn("[bl] 다시", e?.kind, e?.text ?? e);
    setText([201], 30); buttons("yes"); showBar(false);
  } finally {
    st.busy = false;
    showExit(true);
  }
}

function onFwEvent(ev) {
  if (ev.stage === "transfer" && ev.total > 0) st.real = Math.max(st.real, (ev.done / ev.total) * 100);
  if (ev.text) console.debug("[fw]", ev.stage, ev.text);
}

function onBlEvent(ev) {
  if (ev.stage === "write" && ev.total > 0) st.real = Math.max(st.real, (ev.done / ev.total) * 100);
  if (ev.text) console.debug("[bl]", ev.stage, ev.text);
}

// 원본 UpdateProgressBar: 실제 값이 20 을 넘기 전에는 초당 60 씩 20 까지만 차오르고, 넘으면 실제 값(줄지 않음)
function tickBar() {
  if (!el || el.bar.classList.contains("hidden")) return;
  st.bar = st.real > 20 ? Math.max(st.bar, st.real) : Math.min(20, st.bar + 0.02 * 60);
  el.fill.style.width = 8 + 3.92 * st.bar + "px"; // 원본 Slider: 채움 = 8 + 392 × 값(0.8배)
}
