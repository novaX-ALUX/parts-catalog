// 막대 → 드론에 가는 값(조종기 1.3.0 Joystick 과 같은 계산) + 작은 그래프 — 조종기 탭의 '데드존' 칸이 씀
// 계산 정본은 조종기 펌웨어 Source/Device/Joystick.Joystick.cpp(scaleReturnAxis · scaleThrottleAxis) · Joystick.cpp(convertControl)
// 그래프는 미리보기 — 막대 끝값을 기본(가운데 2048 · 끝 600 · 3400)으로 보고 %로 그림

const XS_RNP = [0, 12, 25, 37, 50, 75, 100];          // RnP · YAW CALIB 점 S1~S6 의 막대 자리
const XS_THR = [0, 25, 50, 75, 100, 150, 200];        // THR CALIB 점(0~200)
const SPEED = [0.4, 0.7, 1];                           // SPEED 1 · 2 · 3

const piece = (x, xs, ys) => {
  for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + ((x - xs[i - 1]) * (ys[i] - ys[i - 1])) / (xs[i] - xs[i - 1]);
  return ys[ys.length - 1];
};

/** 돌아오는 막대(롤·피치·요): p = 막대 -100~100 % → 드론에 가는 값 -100~100 */
export function outReturn(p, dz, speed, curve) {
  const a = Math.abs(p), s = Math.sign(p);
  let v = a <= dz ? 0 : a >= 100 - dz ? 100 : Math.trunc(((a - dz) * 100) / (100 - 2 * dz));
  v = Math.trunc(v * (SPEED[speed - 1] ?? 1));
  return s * Math.min(100, Math.trunc(piece(v, XS_RNP, [0, ...curve])));
}

/** 스로틀(안 돌아오는 막대): p = 바닥 0 ~ 꼭대기 100 % → 드론에 가는 스로틀 0~100 % */
export function outThrottle(p, dz, curve) {
  let raw;
  if (p <= dz) raw = 0;
  else if (p >= 100 - dz) raw = 200;
  else raw = p >= 50 ? 100 + Math.trunc(((p - 50) * 100) / (50 - dz)) : 100 - Math.trunc(((50 - p) * 100) / (50 - dz));
  return Math.trunc(piece(Math.min(200, Math.max(0, raw)), XS_THR, [0, ...curve.map((v) => 2 * v)])) / 2;
}

/** 작은 그래프 하나 — kind: "rnp" | "yaw" | "thr" · dz % · speed 1~3 · curve S1~S6 */
export function drawCurve(canvas, { kind, dz, speed, curve, color }) {
  const g = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height, pad = 6 * (W / 220);
  const thr = kind === "thr";
  const x0 = thr ? 0 : -100, x1 = 100, y0 = thr ? 0 : -100, y1 = 100;
  const X = (x) => pad + ((x - x0) / (x1 - x0)) * (W - 2 * pad);
  const Y = (y) => H - pad - ((y - y0) / (y1 - y0)) * (H - 2 * pad);
  g.clearRect(0, 0, W, H);
  // 데드존(회색) · 끝(주황) 띠
  g.fillStyle = "rgba(255,255,255,.13)";
  if (thr) g.fillRect(X(0), Y(y1), X(dz) - X(0), Y(y0) - Y(y1));
  else g.fillRect(X(-dz), Y(y1), X(dz) - X(-dz), Y(y0) - Y(y1));
  g.fillStyle = "rgba(255,160,60,.22)";
  g.fillRect(X(100 - dz), Y(y1), X(100) - X(100 - dz), Y(y0) - Y(y1));
  if (!thr) g.fillRect(X(-100), Y(y1), X(-100 + dz) - X(-100), Y(y0) - Y(y1));
  // 축
  g.strokeStyle = "rgba(255,255,255,.35)";
  g.lineWidth = 1;
  g.beginPath();
  if (!thr) { g.moveTo(X(0), Y(y0)); g.lineTo(X(0), Y(y1)); g.moveTo(X(x0), Y(0)); g.lineTo(X(x1), Y(0)); }
  g.rect(X(x0), Y(y1), X(x1) - X(x0), Y(y0) - Y(y1));
  g.stroke();
  // 곡선
  g.strokeStyle = color;
  g.lineWidth = 2.5 * (W / 220);
  g.beginPath();
  for (let i = 0; i <= 400; i++) {
    const p = x0 + ((x1 - x0) * i) / 400;
    const v = thr ? outThrottle(p, dz, curve) : outReturn(p, dz, speed, curve);
    if (i) g.lineTo(X(p), Y(v)); else g.moveTo(X(p), Y(v));
  }
  g.stroke();
}
