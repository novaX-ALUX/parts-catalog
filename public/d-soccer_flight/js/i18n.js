// 언어 — 원본 LanguageTable.csv(번호, 한국어, 영어, 일본어, 중국어)와 LanguageChange.GetString(번호) 를 옮김
const LANGS = ["Korean", "English", "Japanese", "Chinese"];
export const LANG_LABEL = { Korean: "한국어", English: "English(US)", Japanese: "日本語", Chinese: "中國語" }; // 원본 언어 메뉴 글자 그대로(hp-unityD1 v14)
let table = [];
let lang = localStorage.getItem("lang") || "Korean";
// 언어별 화면 조정(원본 LanguageUIChange.UIChange — 배포판 값)은 CSS 가 :root[data-lang] 로 고른다
document.documentElement.dataset.lang = lang;
const listeners = new Set();

// 따옴표 안 쉼표·줄바꿈을 지키는 CSV 읽기
function parseCsv(text) {
  const rows = [];
  let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); rows.push(row); row = []; cur = "";
    } else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

export async function loadLanguages() {
  const res = await fetch(new URL("../assets/lang/LanguageTable.csv", import.meta.url));
  const rows = parseCsv((await res.text()).replace(/^﻿/, ""));
  const head = rows[0];
  // 원본 CSVReader 처럼 '줄 순서'가 번호 (첫 칸 글자가 아님 — 97번 줄은 "97.X" 로 적혀 있음)
  table = rows.slice(1).filter((r) => r.length > 1)
    .map((r) => Object.fromEntries(LANGS.map((l) => [l, r[head.indexOf(l)] ?? ""])));
}

export const languages = () => LANGS;
export const currentLang = () => lang;
export function t(no) {
  const e = table[no];
  return (e && (e[lang] || e.Korean)) ?? `#${no}`;
}
export function setLang(l) {
  lang = LANGS.includes(l) ? l : "Korean";
  localStorage.setItem("lang", lang);
  document.documentElement.dataset.lang = lang;
  applyStatic();
  listeners.forEach((f) => f(lang));
  fitAll(); // 듣는 쪽이 바꾼 글자까지 다시 맞춤
}
export const onLang = (f) => listeners.add(f);

// data-i18n="번호" 가 붙은 글자를 바꾼다. 여러 번호를 이을 때는 data-i18n="20,21" (줄바꿈으로 이음)
export function applyStatic(root = document) {
  setStatic(root);
  fitAll(root);
}
function setStatic(root) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = el.dataset.i18n.split(",").map((n) => t(+n)).join("\n");
  });
}

// 원본 Text 의 Best Fit — 글자가 자기 칸에 다 들어갈 때까지 1px 씩 줄인다(가장 작게 10px · Unity 기본 최소).
// 한국어는 원래 크기 그대로 맞고, 영어·일본어처럼 긴 글자만 작아진다. 칸 = 그 요소의 상자(안쪽 여백 뺌).
// 글자 폭은 Range 로 잰다 — 가운데 정렬로 왼쪽으로 넘친 것도 잡힘. 안 보이는 요소(크기 0)는 건너뛰고, 보일 때 다시 부른다.
// data-fit=".7" 처럼 배율을 주면 그 배율의 정수 크기로만 줄인다 — 원본은 0.7배로 줄인 칸 안에서 Unity 정수 글자 크기(28·27·…)로 맞춤.
export function fitText(el, min = 10) {
  const u = parseFloat(el.dataset.fit) || 1;
  el.style.fontSize = "";
  const b = el.getBoundingClientRect();
  if (!b.width || !b.height || !el.textContent.trim()) return;
  const cs = getComputedStyle(el), k = b.width / el.offsetWidth || 1;
  const w = b.width - (parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)) * k;
  const h = b.height - (parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)) * k;
  const r = document.createRange();
  const fits = () => { r.selectNodeContents(el); const t = r.getBoundingClientRect(); return t.width <= w + 0.5 && t.height <= h + 0.5; };
  for (let px = parseFloat(cs.fontSize); !fits() && px > min; ) el.style.fontSize = (px = (Math.round(px / u) - 1) * u) + "px";
}
/** root 안의 data-fit 요소를 모두 맞춤 — 언어를 바꿀 때 · 탭·창을 열 때 */
export function fitAll(root = document) {
  root.querySelectorAll("[data-fit]").forEach((el) => fitText(el));
}
