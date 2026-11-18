// 공용 조각 — 원본 SliderManager(입력칸↔슬라이더) · SliderValue(+/− 버튼) · C# 숫자 표기·float 계산
// C# float.Parse(x) * k 를 (byte) 로 자르는 계산을 그대로(32비트 float) — 보내는 바이트가 원본과 같게
export const f32 = Math.fround;
export function f32Trunc(text, k) {
  const v = f32(f32(parseFloat(text)) * k);
  return Math.trunc(v) & 0xff; // C# (byte)float: 소수점 버림 후 하위 8비트
}
export function f32DivTrunc(text, k) { // C# float.Parse(x) / k
  return Math.trunc(f32(f32(parseFloat(text)) / k)) & 0xff;
}
// C# ToString("0.#") / ("0.##") / ("F2")
export const fmt1 = (v) => String(+(Math.round(v * 10) / 10).toFixed(1));
export const fmt2 = (v) => String(+(Math.round(v * 100) / 100).toFixed(2));
export const fixed2 = (v) => (Math.round(v * 100) / 100).toFixed(2);

// 받은 메시지에서 값 꺼내기: C# 이름(degree_roll_p) · camelCase(degreeRollP) 둘 다 받아 줌
export function fld(m, name) {
  if (!m) return undefined;
  if (name in m) return m[name];
  const camel = name.replace(/_([a-zA-Z])/g, (_, c) => c.toUpperCase());
  if (camel in m) return m[camel];
  const lower = Object.keys(m).find((k) => k.toLowerCase() === camel.toLowerCase());
  return lower ? m[lower] : undefined;
}

/**
 * 값 한 칸: [값 상자] [−] [━━●━━] [+]
 * opt: { min, max, step, decimals(0|1|2), ten(표시 ×10), bubble(원 모양), w(슬라이더 폭),
 *        base·mul(표시 = base + 값 × mul — 원본 SliderManager_ESC 의 minValueText·multiplier) }
 * 값은 '표시값'(입력칸 글자)으로 다룬다 — 원본도 입력칸 글자를 읽어 보냄
 */
export function sliderRow(opt) {
  const el = document.createElement("div");
  el.className = "srow";
  const box = document.createElement("input");
  box.className = opt.bubble ? "sval bubble" : "sval pill";
  box.inputMode = "decimal";
  const minus = button("−", "sbtn minus"); // 글자는 0 크기 — 보이는 것은 원본 그림(-.png · +.png)
  const plus = button("+", "sbtn plus");
  const range = document.createElement("input");
  range.type = "range";
  range.className = "srange";
  range.min = opt.min; range.max = opt.max;
  range.step = opt.decimals === 2 ? 0.01 : opt.decimals === 1 ? 0.1 : 1;
  if (opt.w) range.style.width = opt.w + "px";
  el.append(box, minus, range, plus);

  const k = opt.mul ?? (opt.ten ? 10 : 1), base = opt.base ?? 0;
  // 원본 Unity Slider 는 값이 '바뀔 때만' 글자 칸을 고친다 — 처음 값(opt.init)과 같은 값을 넣으면 칸이 비어 예시 글자(opt.ph)가 보임
  // (예: Yaw RateD 0 → "0.00" 이 아니라 "0"). 한 번이라도 바뀐 뒤에는 늘 숫자.
  let cur = opt.init, touched = false;
  if (opt.ph !== undefined) box.placeholder = opt.ph;
  const show = (sv) => { // sv = 슬라이더 값
    const d = base + sv * k;
    if (sv !== cur) { touched = true; cur = sv; }
    box.value = !touched && opt.ph !== undefined ? "" : opt.decimals === 2 ? fixed2(d) : opt.decimals === 1 ? fmt1(d) : String(Math.round(d));
    range.style.setProperty("--p", ((sv - opt.min) / (opt.max - opt.min)) * 100 + "%");
    range.style.setProperty("--t", (sv - opt.min) / (opt.max - opt.min)); // 원본 Fill: 손잡이 가운데 +5 까지
  };
  const setSlider = (sv) => {
    sv = Math.min(opt.max, Math.max(opt.min, sv));
    sv = opt.decimals === 2 ? Math.round(sv * 100) / 100 : opt.decimals === 1 ? Math.round(sv * 10) / 10 : Math.round(sv);
    range.value = sv;
    show(sv);
    el.dispatchEvent(new Event("change"));
  };
  range.oninput = () => setSlider(+range.value);
  minus.onclick = () => setSlider(+range.value - opt.step);
  plus.onclick = () => setSlider(+range.value + opt.step);
  // 입력칸: 숫자·점만, 다 쓰면 범위 안으로 (원본 ValidateInput · UpdateSliderValue)
  box.oninput = () => { const s = box.value.replace(opt.decimals ? /[^0-9.]/g : /[^0-9]/g, ""); if (s !== box.value) box.value = s; };
  box.onchange = () => { const v = parseFloat(box.value); setSlider(Number.isNaN(v) ? +range.value : (v - base) / k); };
  box.onkeydown = (e) => { if (e.key === "Enter") box.blur(); };

  el.get = () => box.value;                 // 표시값 글자
  el.set = (display) => setSlider((+display - base) / k);
  el.value = () => +range.value;           // 슬라이더 값(원본 slider.value)
  el.setValue = (sv) => setSlider(sv);
  el.btns = { minus, plus, range, box };
  return el;
}

export function button(text, cls) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = cls;
  b.textContent = text;
  return b;
}

/** 원본 Unity Dropdown 의 펼친 목록(Template) — 정본(ESC 드롭다운 · 그래프 갱신 간격이 씀). Dropdown.Show 규칙 그대로:
 *  드롭다운 아래에 overlap 만큼 겹쳐 붙고(Template pos 2), 높이 = 항목 × itemH + pad × 2 (최대 maxH · 넘치면 스크롤),
 *  아래 자리가 무대(1080) 밖이면 위로 뒤집고, 고른 항목에 표시(i). 밖을 누르거나 Esc 면 닫힘(Blocker). 한 번에 하나만 열림.
 *  모양은 cls 로 CSS 가 정함(.dl.<cls>). 항목 글은 textContent 로 넣는다. */
let dl = null, dlOpen = null, dlEat = false;
export function dropList(anchor, { items, selected, onPick, cls, itemH, pad, maxH, overlap }) {
  if (!dl) {
    dl = Object.assign(document.createElement("div"), { className: "dl abs hidden" });
    document.getElementById("stage").appendChild(dl);
    dl.addEventListener("click", (e) => {
      e.stopPropagation();
      const it = e.target.closest(".it");
      if (!it || !dlOpen) return;
      const pick = dlOpen.onPick;
      dropListClose();
      pick(+it.dataset.i);
    });
    // 원본 Dropdown 의 blocker: 목록 밖(드롭다운 자신 포함)을 누르면 닫기만 하고 그 아래 것은 안 눌린다
    addEventListener("pointerdown", (e) => {
      dlEat = false;
      if (!dlOpen || dl.contains(e.target)) return;
      dropListClose(); dlEat = true; e.preventDefault(); e.stopPropagation();
    }, true);
    addEventListener("click", (e) => { if (dlEat) { dlEat = false; e.preventDefault(); e.stopPropagation(); } }, true);
    addEventListener("keydown", (e) => { if (e.key === "Escape") dropListClose(); });
  }
  const s = document.getElementById("stage").getBoundingClientRect(), r = anchor.getBoundingClientRect(), k = s.width / 1920;
  const x = (r.left - s.left) / k, y = (r.top - s.top) / k, w = r.width / k, h = r.height / k;
  const full = items.length * itemH + pad * 2, H = Math.min(maxH, full), down = y + h - overlap + H <= 1080;
  dl.className = `dl abs ${cls}${full > maxH ? " scroll" : ""}`;
  Object.assign(dl.style, { left: x + "px", top: (down ? y + h - overlap : y + overlap - H) + "px", width: w + "px", height: H + "px" });
  const vp = document.createElement("div");
  vp.className = "vp";
  items.forEach((text, i) => {
    const it = document.createElement("div");
    it.className = "it" + (i === selected ? " on" : "");
    it.dataset.i = i;
    it.style.top = pad + i * itemH + "px";
    it.innerHTML = "<i></i><span></span>";
    it.lastChild.textContent = text;
    vp.appendChild(it);
  });
  vp.insertAdjacentHTML("beforeend", `<div class="pad" style="height:${full}px"></div>`);
  dl.replaceChildren(vp);
  if (full > maxH) vp.scrollTop = Math.max(0, pad + selected * itemH - (maxH - itemH) / 2); // 고른 항목이 보이게
  dlOpen = { anchor, onPick };
  return dl;
}
export function dropListClose() { // 원본 Dropdown.Hide → Select(): 닫으면 그 드롭다운이 다시 고름 상태
  if (dlOpen) uiSelect(dlOpen.anchor);
  dl?.classList.add("hidden"); dlOpen = null;
}

// ── 원본 Selectable 의 고름(Selected) — 누른 것은 다른 곳을 누를 때까지 고른 색으로 남고, 그동안 올림 색보다 앞선다(states.css .u-sel).
// 원본 EventSystem: 고를 수 있는 것(모두 Navigation Automatic)을 누르면 그것을, 아닌 곳을 누르면 아무것도 안 고름.
export const SELECTABLE = "button, select, input, textarea, [role=button], [role=checkbox], .tab, #lang, .vs, .mt-btn, .mt-check, .team div, .pos, #st-3d .offset, .g-rate, .dl .it";
let uiSel = null;
export function uiSelect(el) { if (uiSel === el) return; uiSel?.classList.remove("u-sel"); uiSel = el; el?.classList.add("u-sel"); }
addEventListener("pointerdown", (e) => uiSelect(e.target.closest?.(SELECTABLE) ?? null), true);

// ── 원본 ButtonTransition(직접 만든 단추 반응): 들어오면 올림 색 · 나가면 처음 색 · 누르면 누름 색 · 떼면(어디서 떼든) 올림 색 — 페이드 없이 바로.
// 단추 밖에서 떼도 올림 색이 남는다(원본 그대로 — HP 원본 사진 hp-unityH1 s15). 색은 states.css 의 [data-bt].
export function buttonTransition(el) {
  const set = (v) => (el.dataset.bt = v);
  el.addEventListener("pointerenter", () => set("hl"));
  el.addEventListener("pointerleave", () => set("def"));
  el.addEventListener("pointerdown", () => { set("pr"); addEventListener("pointerup", () => set("hl"), { capture: true, once: true }); });
  return el;
}

/** 원본 Dropdown — set(번호)는 Unity 처럼 0 ~ (개수-1) 로 자른다 */
export function selectBox(options, cls = "dd") {
  const s = document.createElement("select");
  s.className = cls;
  s.innerHTML = options.map((o, i) => `<option value="${i}">${o}</option>`).join("");
  s.get = () => +s.value;
  s.set = (i) => { s.value = String(Math.min(options.length - 1, Math.max(0, Math.trunc(+i) || 0))); };
  return s;
}

/** 원본 Unity 글자 꾸밈(<b> · <color=red>)과 줄바꿈을 HTML 로 — 글자를 먼저 안전하게 바꾼 뒤 아는 꾸밈만 되살린다 */
export function richText(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
    .replace(/&lt;(\/?)b&gt;/g, "<$1b>")
    .replace(/&lt;color=([#\w]+)&gt;/g, '<span style="color:$1">').replace(/&lt;\/color&gt;/g, "</span>")
    .replace(/\n/g, "<br>");
}

// ── 원본 코루틴(StartCoroutine · WaitForSeconds · StopAllCoroutines) 흉내 ──
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** start(async (wait) => …) 안에서 wait(ms) 로 기다린다. stopAll() 하면 기다리던 것이 다음 wait 에서 조용히 끝난다
 *  (원본: 오브젝트가 꺼지면 그 코루틴이 멈춤) */
export function coroutines() {
  let gen = 0;
  const STOP = Symbol("stop");
  return {
    start(fn) {
      const g = gen;
      const wait = async (ms) => { await sleep(ms); if (g !== gen) throw STOP; };
      return (async () => { try { await fn(wait); } catch (e) { if (e !== STOP) console.error(e); } })();
    },
    stopAll() { gen++; },
  };
}
