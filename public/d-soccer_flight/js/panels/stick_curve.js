// 막대 → 드론에 가는 값(조종기 1.3.0 Joystick 과 같은 계산) + 조종기 CALIB 화면 꼴 곡선 그림 — 조종기 탭 '조종 곡선' 칸이 씀
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

/** 곡선 점 S1~S6 가 막대의 어디(%)에 오나 — 조종기 CALIB 화면과 같게 데드존만큼 안쪽으로(롤·피치·요 = 가운데 0 → 끝 100, 스로틀 = 바닥 0 → 꼭대기 100)
 *  조종기 정본: Source/Application/ModeSetupTreeDepth2.Draw.cpp drawCalibrationCurve */
export function calibStickX(kind, dz) {
  if (kind !== "thr") return XS_RNP.slice(1).map((x) => dz + (x * (100 - 2 * dz)) / 100);
  return XS_THR.slice(1).map((r) => (r <= 100 ? dz + (r * (50 - dz)) / 100 : 50 + ((r - 100) * (50 - dz)) / 100));
}

/** 조종기 CALIB 화면과 같은 꼴의 곡선 그림 — 가로 = 막대 · 세로 = 곡선 값(0~100) · 점 S1~S6 · 고른 점 세로줄 · 데드존(회색) · 끝(주황) 띠
 *  롤·피치·요는 반쪽(가운데 → 끝)만(조종기 화면과 같음 · 반대쪽은 대칭) · SPEED 는 넣지 않음(아래 '데드존 · 막대 → 드론' 그래프에 있음) */
export function drawCalib(canvas, { kind, dz, curve, sel, color }) {
  const g = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height, k = W / (canvas.clientWidth || W / 2);   // k = 캔버스 점 / 화면 px
  const L = 24 * k, R = W - 8 * k, T = 10 * k, B = H - 22 * k;
  const X = (x) => L + (x / 100) * (R - L);
  const Y = (y) => B - (y / 100) * (B - T);
  const thr = kind === "thr";
  g.clearRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,.13)";
  g.fillRect(X(0), Y(100), X(dz) - X(0), Y(0) - Y(100));
  g.fillStyle = "rgba(255,160,60,.22)";
  g.fillRect(X(100 - dz), Y(100), X(100) - X(100 - dz), Y(0) - Y(100));
  g.font = `${10 * k}px NK, sans-serif`;
  g.fillStyle = "rgba(255,255,255,.55)";
  g.textAlign = "left"; g.textBaseline = "top";
  if (dz >= 4) g.fillText("DZ", X(0) + 2 * k, Y(100) + 2 * k);
  // 축 · 점마다 눈금(조종기 화면처럼)
  g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 1 * k;
  g.beginPath(); g.moveTo(X(0), Y(100)); g.lineTo(X(0), Y(0)); g.lineTo(X(100), Y(0)); g.stroke();
  const xs = calibStickX(kind, dz);
  g.textAlign = "center";
  xs.forEach((x, i) => {
    g.beginPath(); g.moveTo(X(x), Y(0)); g.lineTo(X(x), Y(0) + 4 * k); g.stroke();
    g.fillStyle = i === sel ? "#fff" : "rgba(255,255,255,.55)";
    g.fillText(String(i + 1), X(x), Y(0) + 6 * k);
  });
  g.textAlign = "right"; g.textBaseline = "middle"; g.fillStyle = "rgba(255,255,255,.55)";
  [0, 50, 100].forEach((v) => g.fillText(String(v), X(0) - 4 * k, Y(v)));
  // 고른 점 세로줄(조종기 화면의 깜박이는 줄)
  if (sel >= 0) { g.strokeStyle = "rgba(255,255,255,.8)"; g.setLineDash([4 * k, 3 * k]); g.beginPath(); g.moveTo(X(xs[sel]), Y(0)); g.lineTo(X(xs[sel]), Y(100)); g.stroke(); g.setLineDash([]); }
  // 곡선(실제 계산 그대로 · SPEED 3) · 점
  g.strokeStyle = color; g.lineWidth = 2.2 * k;
  g.beginPath();
  for (let i = 0; i <= 400; i++) {
    const p = (100 * i) / 400;
    const v = thr ? outThrottle(p, dz, curve) : outReturn(p, dz, 3, curve);
    if (i) g.lineTo(X(p), Y(v)); else g.moveTo(X(p), Y(v));
  }
  g.stroke();
  xs.forEach((x, i) => {
    g.fillStyle = i === sel ? "#fff" : color;
    g.beginPath(); g.arc(X(x), Y(curve[i]), (i === sel ? 4.5 : 3) * k, 0, Math.PI * 2); g.fill();
  });
}

/** 그림에서 누른 자리(캔버스 안 x · CSS px)에 가장 가까운 점 번호 0~5 */
export function calibPick(canvas, cssX, kind, dz) {
  const r = canvas.getBoundingClientRect(), W = canvas.clientWidth || r.width, L = 24, R = W - 8;
  const x = (cssX / r.width) * W;
  const xs = calibStickX(kind, dz).map((v) => L + (v / 100) * (R - L));
  return xs.reduce((b, v, i) => (Math.abs(v - x) < Math.abs(xs[b] - x) ? i : b), 0);
}
