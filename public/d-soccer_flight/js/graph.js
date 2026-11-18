// 자세 그래프 — 원본 Motor_Graph · ImageLoop · Motor_LineRenderer 를 그대로.
// 점 하나를 찍을 때마다(주기 = 10·50·100ms) 모든 점과 시간 눈금 띠가 왼쪽으로 2.25 씩 흐른다.
//  · 선: 새 점은 오른쪽 끝(LineRenderer 자리)에, y = 값 × 0.55. 왼쪽으로 450 넘게 흐른 점은 버림(= 최근 200점).
//  · 시간 눈금: 띠 두 개(각 450 · 눈금 4개 · 112.5 간격). 처음엔 -200,-150,-100,-50 | 0,50,100,150.
//    띠가 450 만큼 흘러 나가면 오른쪽 끝(ResetPoint)으로 돌아가 다음 숫자 4개(+50씩)를 받는다.
//  · 그래프 틀(Mask) 밖은 잘림 — 양 끝 눈금 글자가 반만 보이는 것도 원본 그대로.
// 좌표는 그래프 칸(Setup_Content/Graph) 안 원본 값에서 그림판 원점(칸 안 20, 70)을 뺀 것 — design/shipped_ui.json.
const COLORS = ["#ff0000", "#0083ff", "#85ff00"]; // 원본 LineRenderer 색(Roll 빨강 · Pitch 파랑 · Yaw 연두, 선형 색공간 → 화면 값)
const STEP = 2.25, SPAN = 450, PER = 112.5;       // moveDistance · disValue · 눈금 간격
const MASK_L = 57.5, MASK_R = 507.9;              // 틀(Mask) 칸 안 77.5 ~ 527.9
const LINE_X = 509.9;                              // LineRenderer 자리(칸 안 529.9) — 새 점이 놓이는 x
const ZERO_Y = 179.3, K = 0.55;                    // 0도 가로선 가운데(칸 안 249.3) · 1도당
const GRID_Y = [79.3, 129.3, 179.3, 229.3, 279.3]; // 가로선 가운데(칸 안 149.3 ~ 349.3) · 굵기 2
const YLAB = [[180, 78.2], [90, 127.7], [0, 177.2], [-90, 226.7], [-180, 276.2]]; // 세로 눈금 글자 가운데(칸 안 148.2 …) · 오른끝 43.5
const XLAB_Y = 304.3, STRIP0 = 57.7;               // 가로 눈금 글자 가운데 y(칸 안 374.3) · 첫 띠 왼끝(칸 안 77.7)

export class AttitudeGraph {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.rateMs = 10;
    this.latest = null;
    this.last = 0;
    this.reset();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    const loop = (ts) => { this.tick(ts); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  /** 원본 Close/OnEnable: 선 비우고 눈금 띠 처음 자리·숫자(-200…, 0…) */
  reset() {
    this.pts = [[], [], []];           // 점마다 [x, 값]
    this.strips = [{ x: STRIP0, base: -200 }, { x: STRIP0 + SPAN, base: 0 }];
    this.next = 200;                    // 다음에 돌아오는 띠가 받을 첫 숫자(timeValue)
  }
  resize() {
    const r = this.cv.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    // 무대가 transform 으로 줄어 있어도 선이 또렷하게: 실제 화면 픽셀 크기로 그림
    this.cv.width = Math.max(1, Math.round(r.width * dpr));
    this.cv.height = Math.max(1, Math.round(r.height * dpr));
    this.draw();
  }
  push(r, p, y) { this.latest = [r, p, y]; }
  clear() { this.latest = null; this.reset(); this.draw(); }
  tick(ts) {
    if (this.latest && ts - this.last >= this.rateMs) {
      this.last = ts;
      this.step(this.latest);
      this.draw();
    }
  }
  /** 원본 AddPoint_Co 한 바퀴: 점 더하기(Motor_LineRenderer) → 띠 옮기기(ImageLoop.Move) */
  step(vals) {
    this.pts.forEach((d, i) => {
      d.push([LINE_X, vals[i]]);                         // 새 점은 x=0(LineRenderer 자리) — 곧바로 모두 STEP 만큼 옮겨짐
      if (d[0][0] <= LINE_X - SPAN) d.shift();          // points[0].x <= -endPoint
      d.forEach((p) => (p[0] -= STEP));
    });
    for (const s of this.strips) {
      s.x -= STEP;
      if (s.x - STRIP0 <= -SPAN) { s.x = STRIP0 + SPAN; s.base = this.next; this.next += 200; } // Retune → TimeValue
    }
  }
  draw() {
    const { ctx, cv } = this, W = cv.width, H = cv.height, s = W / 527;
    ctx.clearRect(0, 0, W, H);
    ctx.font = `500 ${14 * s}px NK, sans-serif`;   // NotoSansKR-Medium 14
    // 가로선(LineBackground) — 흰색 0.5059 → 선형 섞기 값
    ctx.fillStyle = "#c0c0be";
    for (const y of GRID_Y) ctx.fillRect(MASK_L * s + 0.2 * s, (y - 1) * s, 450 * s, 2 * s);
    // 세로 눈금(틀 밖, 오른쪽 정렬)
    ctx.fillStyle = "#fff"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (const [v, y] of YLAB) ctx.fillText(v, 43.5 * s, y * s);
    // 틀 안: 시간 눈금 띠 + 선
    ctx.save();
    ctx.beginPath(); ctx.rect(MASK_L * s, 0, (MASK_R - MASK_L) * s, H); ctx.clip();
    ctx.textAlign = "center";
    for (const st of this.strips) for (let k = 0; k < 4; k++) ctx.fillText(st.base + k * 50, (st.x + k * PER) * s, XLAB_Y * s);
    [0, 2, 1].forEach((i) => { // 원본처럼 Pitch(파랑)가 맨 위에 보이게 Roll → Yaw → Pitch 순서
      const d = this.pts[i];
      if (d.length < 2) return;
      ctx.strokeStyle = COLORS[i]; ctx.lineWidth = 2 * s; ctx.lineJoin = "round";
      ctx.beginPath();
      d.forEach(([x, v], k) => { const y = (ZERO_Y - v * K) * s; k ? ctx.lineTo(x * s, y) : ctx.moveTo(x * s, y); });
      ctx.stroke();
    });
    ctx.restore();
  }
}
