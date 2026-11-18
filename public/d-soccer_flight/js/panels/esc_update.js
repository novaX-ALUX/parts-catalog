// ESC 펌웨어 바꾸기 — 원본 ESCUpdate · ESCFirmwareFileManager(hex 열기 창) · Blocking All ESC Update Panel ·
// ESC Update Panel(개발용 시험 창, 원본에서 꺼져 있음).
// 굽기는 바이패스(api.escFlash): 속(Rust)이 ESC 부트로더와 바로 주고받아 쪽마다 지우고 · 쓰고 · 되읽어 확인한다. 옛 설정(방향 등)은 이어 쓴다.
import { api } from "../api.js";
import { t, applyStatic } from "../i18n.js";
import { notify, blocking } from "../shell.js";
import { sleep, dropList } from "../widgets.js";
import { parseHex, previewText, BLOCK } from "./esc_hex.js";
import { LIST_URL, fetchList, fetchBytes } from "../netlist.js";

const TEST_ROWS = [["etv-esc", "전송중인 ESC", 375], ["etv-sp", "보낸 패킷 수", 407], ["etv-tp", "총 패킷 수", 439], ["etv-sb", "보낸 바이트 수", 470], ["etv-tb", "총 바이트 수", 503]];

export function initEscUpdate({ page, cfg, readOne, readAll, hexOpenBtn, fileNameEl, updateBtns }) {
  // 상태 — 원본 필드 이름 그대로
  const st = { hexData: null, hexText: "", blocks: [], totalBlocks: 0, totalBytes: 0, currentSendIndex: 0, updatingEscNum: 0, isUpdating: false };
  const stage = document.getElementById("stage");
  stage.insertAdjacentHTML("beforeend", `
    <div id="escUpBlock" class="abs hidden"><div data-i18n="173,174"></div></div>
    <div id="escHexDlg" class="abs hidden"><div class="ehd-box">
      <div class="ehd-title" data-i18n="185"></div><select class="dd ehd-list"></select><div class="dd-bg ehd-list-bg"></div>
      <button class="esc-b ehd-ok" data-i18n="186"></button><button class="esc-b ehd-pc" data-i18n="187"></button>
      <i class="ehd-x" role="button"></i><i class="ehd-wifi hidden"></i></div></div>
    <div id="escTest" class="abs hidden"><div class="et-box">
      <button class="et-b" id="et-hex" style="top:105px">hex파일 열기</button>
      ${[0, 1, 2, 3].map((n) => `<button class="et-b" id="et-up${n}" style="top:${225 + n * 58 - (n === 3 ? 1 : 0)}px">ESC${n + 1} 업데이트</button>`).join("")}
      <button class="et-b" id="et-all" style="top:455px;height:100px">모든 ESC 업데이트</button>
      <button class="et-b hidden" id="et-again" style="top:322px">처음부터 다시 보내기</button>
      <button class="et-b" id="et-test" style="left:204px;top:165px;width:160px;height:45px">테스트전송</button>
      <div class="et-prev"><pre id="et-prev">\n\n\n\n\n\n데이터 미리보기가 표시됩니다</pre></div>
      <div class="et-k" style="left:720px;top:338px">현재 파일</div><div class="et-v" id="etv-file" style="top:338px">hexfile01</div>
      ${TEST_ROWS.map(([id, k, y]) => `<div class="et-k" style="top:${y}px">${k}</div><div class="et-v" id="${id}" style="top:${y}px">0</div>`).join("")}
      <i class="ehd-x et-x" role="button"></i></div></div>
    <button id="escTestOpen2" class="abs hidden">ESC 업데이트</button>
    <input type="file" id="escHexFile" accept=".hex" class="hidden">`);
  page.insertAdjacentHTML("beforeend", `<button id="escTestOpen" class="hidden">hex\n업데이트패널</button>`);
  const $ = (s) => document.querySelector(s);
  applyStatic($("#escUpBlock")); applyStatic($("#escHexDlg"));
  const testBtns = ["#et-hex", "#et-up0", "#et-up1", "#et-up2", "#et-up3", "#et-all"].map($);

  // ── 화면 갱신 ──
  const setButtons = (on) => { hexOpenBtn.disabled = !on; $("#et-hex").disabled = !on; [...updateBtns, ...testBtns.slice(1)].forEach((b) => (b.disabled = !on)); };
  const upBlock = (on) => $("#escUpBlock").classList.toggle("hidden", !on); // BlockingAllESCUpdateControl
  function updateStatusText() {
    $("#etv-tp").textContent = st.totalBlocks; $("#etv-tb").textContent = st.totalBytes;
    $("#etv-sp").textContent = st.currentSendIndex; $("#etv-sb").textContent = Math.min(st.currentSendIndex * BLOCK, st.totalBytes);
  }
  const updatePreview = () => { const s = previewText(st.blocks, st.currentSendIndex); if (s) $("#et-prev").textContent = s; };
  async function highlightHexOpen() { // HexOpenButtonHighlight: 분홍으로 두 번 깜빡
    for (const on of [1, 0, 1, 0]) { hexOpenBtn.classList.toggle("blink", !!on); await sleep(80); }
  }

  // ── hex 읽기 (OpenHex → OutputRoutine / DownloadHex_Co → ProcessHexData) ──
  function loadHex(name, bytes) {
    $("#et-prev").textContent = new TextDecoder().decode(bytes).slice(0, 4000);
    let r;
    try { r = parseHex(bytes); } catch (e) { console.warn("hex 읽기 실패", e.message); notify(74); return; } // 원본은 여기서 예외로 멈췄다
    Object.assign(st, r, { hexData: bytes, hexText: new TextDecoder().decode(bytes), currentSendIndex: 0 });
    fileNameEl.textContent = name; $("#etv-file").textContent = name;
    updateBtns.forEach((b) => (b.disabled = false)); testBtns.slice(1).forEach((b) => (b.disabled = false));
    updateStatusText(); updatePreview();
  }
  function openFromPC() { $("#escHexFile").value = ""; $("#escHexFile").click(); }
  $("#escHexFile").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    $("#escHexDlg").classList.add("hidden");
    loadHex(f.name.replace(/\.[^.]*$/, "") + ".hex", new Uint8Array(await f.arrayBuffer()));
  };

  // ── 인터넷 펌웨어 목록 (ESCFirmwareFileManager · 받기는 netlist.js) ──
  let fileList = [], fileName = "", fileURL = "";
  const list = $("#escHexDlg .ehd-list");
  // 웹판은 안 받음 — SharePoint 는 브라우저 받기를 막고(쿠키·다른 사이트), ESC 굽기도 아직 PC판만(api.js WEB)
  if (!api.web) fetchList(LIST_URL.esc).then((l) => { fileList = l; fileListSetting(); })
    .catch((e) => console.info("[esc] " + e.message));
  function fileListSetting() { list.innerHTML = fileList.map((f, i) => `<option value="${i}">${f.name}</option>`).join(""); selectFirmware(); }
  function selectFirmware() { // SelectFirmware — 창이 열려 있을 때만
    if ($("#escHexDlg").classList.contains("hidden") || !fileList.length) return;
    const f = fileList[+list.value] ?? fileList[0];
    fileName = f.name; fileURL = f.url;
  }
  list.onchange = selectFirmware;
  // 펼친 목록: 원본 hex Open Panel/Background/Dropdown/Template(Unity 기본 — ESC 드롭다운과 같은 모양) — 창(OS) 목록 대신
  const openList = () => dropList(list, { items: [...list.options].map((o) => o.textContent), selected: list.selectedIndex, cls: "esc", itemH: 32, pad: 2, maxH: 400, overlap: 1.6,
    onPick: (i) => { if (i !== list.selectedIndex) { list.selectedIndex = i; list.dispatchEvent(new Event("change")); } } });
  list.addEventListener("mousedown", (ev) => { ev.preventDefault(); if (list.options.length) openList(); });
  list.addEventListener("keydown", (ev) => { if ((ev.key === " " || ev.key === "Enter") && list.options.length) { ev.preventDefault(); openList(); } });
  $("#escHexDlg .ehd-ok").onclick = () => { // Confirm
    if (!navigator.onLine || !fileList.length) { notify(189); return; } // 인터넷 연결 후 재시작하세요(목록을 못 받은 때도)
    if (!fileURL) selectFirmware();
    $("#escHexDlg").classList.add("hidden");
    fetchBytes(fileURL).then((b) => loadHex(fileName, b)).catch((e) => console.error("HEX 다운로드 실패: " + e.message));
  };
  $("#escHexDlg .ehd-pc").onclick = openFromPC;
  $("#escHexDlg .ehd-x").onclick = () => $("#escHexDlg").classList.add("hidden");
  function openHexDialog() {
    $("#escHexDlg").classList.remove("hidden");
    $("#escHexDlg .ehd-wifi").classList.toggle("hidden", navigator.onLine && fileList.length > 0); // 인터넷(목록) 없음 표시
    selectFirmware();
  }

  // ── 업데이트 ──
  api.onEsc(({ esc, done, total }) => { if (st.isUpdating) cfg.progressText(esc, done / total, `Updating... ${((done / total) * 100).toFixed(1)}%`); });
  /** ESC 하나 굽기(되읽기 확인까지). 실패하면 false */
  async function flashOne(num) {
    st.updatingEscNum = num;
    for (let i = 0; i < 4; i++) cfg.statusOff(i);
    cfg.progress(num, 0, "Updating...");
    $("#etv-esc").textContent = num + 1;
    try { await api.escFlash(num, st.hexText); return true; }
    catch (e) { console.warn(`[esc] ESC${num + 1} 굽기 실패`, e); return false; }
    finally { cfg.statusOff(num); }
  }
  async function run(list, after) {
    if (!st.hexData || !st.hexData.length) { notify(175); highlightHexOpen(); return; }
    if (st.isUpdating) return;
    st.isUpdating = true; upBlock(true); setButtons(false);
    let ok = true;
    for (const n of list) ok = (await flashOne(n)) && ok;
    st.isUpdating = false; setButtons(true); upBlock(false);
    if (!ok) notify(14); // 펌웨어 업데이트를 실패하였습니다
    after();
  }
  const sendEscInfoUpdate = (num) => run([num], () => readOne(num)); // 그 ESC 값을 다시 읽어 화면 갱신
  const updateEscAll = () => run([0, 1, 2, 3], () => readAll(true));

  // ── 시험 창(원본 ESC Update Panel — 원본에서 여는 버튼 둘 다 꺼져 있음) ──
  const openTest = () => $("#escTest").classList.remove("hidden");
  $("#escTestOpen").onclick = openTest;
  $("#escTestOpen2").onclick = openTest;
  $("#et-hex").onclick = openFromPC;
  [0, 1, 2, 3].forEach((n) => ($("#et-up" + n).onclick = () => sendEscInfoUpdate(n)));
  $("#et-all").onclick = updateEscAll;
  $("#et-again").onclick = () => {}; // 원본 OnClick 이 ESCUpdate.ResetSendIndex 를 부르지만 그 함수가 없다(죽은 버튼)
  $("#et-test").onclick = () => { st.currentSendIndex++; updatePreview(); updateStatusText(); }; // SeeNextPacket(미리보기만 넘김)
  $("#escTest .et-x").onclick = () => { st.isUpdating = false; $("#escTest").classList.add("hidden"); }; // ExitUpdate + 닫기

  return {
    state: st, openHexDialog, sendEscInfoUpdate, updateEscAll,
    enable() { // OnEnable
      hexOpenBtn.disabled = false;
      if (!st.isUpdating) for (let i = 0; i < 4; i++) cfg.statusOff(i);
    },
    disable() {},
    /** 연결이 끊김(CloseSerial) — 업데이트 가림막 끄기 */
    reset() { upBlock(false); st.isUpdating = false; setButtons(true); },
  };
}
