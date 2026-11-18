// 화면 틀 — 무대 크기 맞추기·탭·연결 버튼·언어·알림 (원본 WindowSize·TabManager·ButtonManager·MainManager)
import { api } from "./api.js";
import { store, on, emit } from "./store.js";
import { t, setLang, currentLang, languages, LANG_LABEL, onLang, fitAll } from "./i18n.js";
import { dropList } from "./widgets.js";

const $ = (id) => document.getElementById(id);

// 1920×1080 무대를 창에 맞춰 비율 그대로 (남는 곳은 바탕색, 가운데 정렬)
export function fitStage() {
  const s = Math.min(innerWidth / 1920, innerHeight / 1080);
  const st = $("stage");
  st.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
}

// ── 탭 ──
let currentPage = "status";
export const page = () => currentPage;
export function showPage(name) {
  currentPage = name;
  document.querySelectorAll(".tab").forEach((el) => el.classList.toggle("on", el.dataset.page === name));
  document.querySelectorAll(".page").forEach((el) => el.classList.toggle("hidden", el.id !== "page-" + name));
  const tab = document.querySelector(`.tab[data-page="${name}"]`);
  moveTabBar(130 + tab.offsetTop + 2);
  fitAll($("page-" + name)); // 숨어 있을 때는 못 잰 글자를 이제 맞춤
  emit("page", name);
}

// 원본 TabManager.TabBarMove(코루틴 — 누를 때마다 StopAllCoroutines 후 새로 시작, 속도 0부터):
// 매 프레임 Vector3.SmoothDamp(smoothTime 0.15) · 남은 거리 > 20 이면 MoveTowards(거리/0.15 × dt) — 탭 사이는 늘 20 아래 ·
// 옮기기 전 거리 ≤ 0.01 이고 속도 < 0.01 이면 목표에 딱 맞추고 끝. 길이 단위 1 = 108px(원본 화면 배율).
const U = 108;
let barY = null, barRaf = 0;
function moveTabBar(goal) {
  const el = $("tabBar");
  cancelAnimationFrame(barRaf);
  if (barY === null) { barY = goal; el.style.top = goal + "px"; return; } // 처음: 씬에 놓인 자리
  let v = 0, last = performance.now();
  const step = (now) => {
    const dt = Math.max(1e-4, (now - last) / 1000); last = now;
    const dist = Math.abs(goal - barY);
    if (dist > 20 * U) barY += Math.sign(goal - barY) * Math.min(dist, (dist / 0.15) * dt);
    else { // Unity Mathf/Vector3.SmoothDamp 그대로(최대 속도 없음)
      const omega = 2 / 0.15, x = omega * dt, exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const change = barY - goal, temp = (v + omega * change) * dt;
      v = (v - omega * temp) * exp;
      let out = goal + (change + temp) * exp;
      if ((goal - barY) * (out - goal) > 0) { out = goal; v = (out - goal) / dt; }
      barY = out;
    }
    if (dist <= 0.01 * U && Math.abs(v) < 0.01 * U) { barY = goal; el.style.top = goal + "px"; return; }
    el.style.top = barY + "px";
    barRaf = requestAnimationFrame(step);
  };
  barRaf = requestAnimationFrame(step);
}

// 연결 전에는 위 막대 아래 전체에 보이지 않는 막이 있어, 누르면 어둡게 하고 "장치를 먼저 연결해 주세요"
// (원본 Mask - Connect · MainManager.SetActive_OnMask / OnMessageExit)
function armConnectMask(armed) {
  $("connectMask").classList.toggle("armed", armed);
  if (!armed) hideConnectMask();
}
function onMaskClick() {
  const m = $("connectMask");
  if (m.classList.contains("show")) hideConnectMask();
  else { m.classList.add("show"); $("connectMsg").classList.remove("hidden"); }
}
function hideConnectMask() {
  $("connectMask").classList.remove("show");
  $("connectMsg").classList.add("hidden");
}

// ── 연결 버튼 (원본 ButtonManager.OnConnect: 연결하기/연결 중/연결됨/연결안됨) ──
let everTried = false; // 원본: 켜자마자는 포트 글자가 비어 있고, 한 번 연결해 본 뒤 끊기면 "Port : None"
function renderConnect() {
  const L = store.link;
  if (L.state !== "disconnected") everTried = true;
  let img = "Connection_Default", text = t(16), port = everTried ? "Port : None" : "";
  if (L.state === "searching") { text = t(72); port = L.port ? "Port : " + L.port : t(72); }
  else if (L.state === "connected") { img = "Connection_On"; text = t(17); port = "Port : " + L.port; }
  else if (L.reason && L.reason !== "user") { img = "Connection_Off"; text = t(95); }
  $("connectImg").src = `assets/img/${img}.png`;
  $("connectText").textContent = text;
  $("portName").textContent = port;
}

// ── 알림 (원본 Notification_On: 번호 글자를 잠깐 띄움, 누르면 닫힘) ──
let noticeTimer;
export function notify(noOrText, ms = 1000) { // 원본 Notification_OnEnable 1초 뒤 Disable
  const el = $("notice");
  el.textContent = typeof noOrText === "number" ? t(noOrText) : noOrText;
  el.classList.remove("hidden");
  el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => el.classList.add("hidden"), ms);
}
export function blocking(text) {
  const el = $("blocking");
  if (!text) { el.classList.add("hidden"); return; }
  el.textContent = text;
  el.classList.remove("hidden");
}

// ── 장치 연결 알림 (원본 Connected Controller Popup: 드론/컨트롤러가 연결되었습니다 · 부트로더) ──
let devTimer;
function devicePopup() {
  const L = store.link, el = $("devicePopup");
  if (L.state !== "connected") { el.classList.add("hidden"); return; }
  el.innerHTML = "<span></span>";
  el.firstChild.textContent = L.bootloader ? t(82) + "\n" + t(83) : L.device === "drone" ? t(77) : t(76);
  el.classList.remove("hidden");
  el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
  clearTimeout(devTimer);
  devTimer = setTimeout(() => el.classList.add("hidden"), 2000); // 원본 ConnectedPopup_OnEnable 2초 뒤 Disable
}

// ── 언어 고르기 ──
// 원본 LanguageDropdown/Template — 공용 펼친 목록(widgets.dropList): 항목 40 · 여백 5 · 최대 200 · 2 겹침 · 아래가 모자라 위로 뒤집혀 열림
function buildLangMenu() { $("langLabel").textContent = LANG_LABEL[currentLang()]; }
const openLangMenu = () => dropList($("lang"), { items: languages().map((l) => LANG_LABEL[l]), selected: languages().indexOf(currentLang()),
  cls: "lang", itemH: 40, pad: 5, maxH: 200, overlap: 2, onPick: (i) => setLang(languages()[i]) });

export function initShell() {
  fitStage();
  addEventListener("resize", fitStage);
  document.querySelectorAll(".tab").forEach((el) => (el.onclick = () => showPage(el.dataset.page)));
  $("connectBtn").onclick = () => (api.web && !api.serial ? notify(222, 3000) // 웹판인데 브라우저가 USB 직렬을 못 씀(크롬·엣지 필요)
    : store.link.state === "disconnected" ? api.connect() : api.disconnect());
  $("connectMask").onclick = onMaskClick;
  $("notice").onclick = () => $("notice").classList.add("hidden");
  $("devicePopup").onclick = () => $("devicePopup").classList.add("hidden"); // 원본 exit_btn → SetActive(false)
  $("lang").onclick = openLangMenu;
  // 원본: 언어 드롭다운 OnValueChanged = LanguageChange.SelectLanguage + ButtonManager.OnConnect — 연결 안 됐으면 TabReset(상태 탭)
  // + 포트 글자 "Port : None". 시작 때 저장된 언어가 한국어가 아니면 Awake 의 Dropdown.value 가 같은 일을 함
  onLang(() => { buildLangMenu(); if (store.link.state !== "connected") { everTried = true; showPage("status"); } renderConnect(); });
  if (currentLang() !== "Korean") everTried = true;
  buildLangMenu();

  on("link", ({ prev, now }) => {
    renderConnect();
    armConnectMask(now.state !== "connected");
    if (now.state === "connected" && prev.state !== "connected") devicePopup();
    if (now.state === "connected" && now.bootloader && !prev.bootloader) devicePopup();
    if (now.state === "disconnected" && prev.state === "connected") {
      notify(108); // 연결이 끊겼습니다
      blocking(null);
      showPage("status"); // 원본 TabReset
    }
    if (now.state === "disconnected" && prev.state === "searching" && now.reason === "notFound") notify(71);
  });
  renderConnect();
  armConnectMask(true);
  // 원본은 "v1.1"(앞 두 자리)을 칸 오른쪽에 붙임 — 그 자리는 그대로 두고 끝자리(".10")를 그 뒤에 이어 붙인다(왼쪽 로고와 겹치지 않게)
  api.version().then((v) => {
    const [major, minor, ...rest] = v.split(".");
    const el = $("version");
    el.textContent = `v${major}.${minor}`;
    if (rest.length) {
      const patch = document.createElement("span");
      patch.className = "ver-patch";
      patch.textContent = "." + rest.join(".");
      el.append(patch);
    }
  });
}
