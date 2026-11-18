// 드론과 (USB 로) 연결돼 있지 않을 때 모터·ESC 탭을 막는 막 — 원본 MainManager.SetActive_MotorMask + Canvas/Top/Mask - Motor
// 막(옅은 그림자)은 탭 내용 자리를 계속 막고, 그 위 알림(글자 90 "드론과 연결 시 사용 가능합니다")은 FadeInOut(1.7초)처럼 어두워졌다 밝아지며 사라진다.
// 알림을 누르면 바로 닫힌다(원본 Popup 의 투명 버튼 → SetActive(false)).
// 2.12.0: 두 탭 같은 규칙 — 드론이 USB 로 연결돼 있지 않으면(조종기만 · 아무것도 없음) 막음(이사님 #ob98ded41).
//         탭마다 따로 켜고 끔(전에는 막 하나를 같이 써서 ESC 탭에서 모터 탭으로 넘어가면 ESC 닫기가 모터 탭의 막을 지웠음) ·
//         탭을 연 채 연결이 바뀌면 다시 판단(드론을 꽂으면 풀림 · 빼면 다시 알림).
import { store, on } from "../store.js";
import { applyStatic } from "../i18n.js";

let mask = null;
const owners = new Set(); // 막을 원하는 탭(motor · esc)

function build() {
  mask = document.createElement("div");
  mask.id = "motorMask";
  mask.className = "abs hidden";
  mask.innerHTML = `<div class="mm-pop"><div class="mm-msg" data-i18n="90"></div></div>`;
  document.getElementById("stage").appendChild(mask);
  const pop = mask.querySelector(".mm-pop");
  pop.onclick = () => pop.classList.add("hidden");
  pop.addEventListener("animationend", () => pop.classList.add("hidden"));
  applyStatic(mask);
  on("link", () => refresh(false)); // 연결이 바뀌면 다시 판단 — 새로 막힐 때만 알림
}

/** 드론과 USB 로 연결돼 있지 않음 — 모터 · ESC 는 드론에 바로 꽂혀 있어야 씀 */
export const motorBlocked = () => !(store.connected && store.isDrone);

function refresh(flagAlert) {
  if (!mask) return;
  const pop = mask.querySelector(".mm-pop");
  const wasOn = !mask.classList.contains("hidden");
  const isOn = owners.size > 0 && motorBlocked();
  mask.classList.toggle("hidden", !isOn);
  if (isOn && (flagAlert || !wasOn)) {
    pop.classList.remove("hidden");
    pop.style.animation = "none"; void pop.offsetWidth; pop.style.animation = "";
  }
}

/** 탭(owner)이 열리면 true · 닫히면 false — 원본 SetActive_MotorMask(active) */
export function setMotorMask(active, owner) {
  if (!mask) build();
  if (active) owners.add(owner); else owners.delete(owner);
  refresh(active);
}
