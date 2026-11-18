// 조종기와 연결됐을 때 모터·ESC 탭을 막는 막 — 원본 MainManager.SetActive_MotorMask + Canvas/Top/Mask - Motor
// 막(옅은 그림자)은 탭 내용 자리를 계속 막고, 그 위 알림(글자 90)은 FadeInOut(1.7초)처럼 어두워졌다 밝아지며 사라진다.
// 알림을 누르면 바로 닫힌다(원본 Popup 의 투명 버튼 → SetActive(false)).
import { store } from "../store.js";
import { applyStatic } from "../i18n.js";

let mask = null;

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
}

/** 원본 SetActive_MotorMask(active): 켜기는 조종기와 연결돼 있을 때만, 끄기는 늘 */
export function setMotorMask(active) {
  if (!mask) build();
  const pop = mask.querySelector(".mm-pop");
  if (active && store.connected && store.isController) {
    mask.classList.remove("hidden");
    pop.classList.remove("hidden");
    pop.style.animation = "none"; void pop.offsetWidth; pop.style.animation = "";
  } else {
    mask.classList.add("hidden");
  }
}
