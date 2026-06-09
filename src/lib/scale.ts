// Shared Y-axis scaling for thrust charts.
//
// Goal: every Thrust chart on a single motor page uses the SAME Y-axis max,
// so a propeller that produces more thrust always draws a taller curve.
// (Previously each chart picked its own max, so e.g. a 5400 g curve scaled
// to 10000 looked shorter than a 4726 g curve scaled to 5000 — misleading.)
//
// The axis top is the smallest "nice" value at or above the data peak using a
// 1 / 2 / 2.5 / 5 / 10 step series, so curves fill the plot area while tick
// labels stay round.
export interface Scale {
  max: number;
  ticks: number[];
}

export function niceScale(maxY: number, targetTicks = 4): Scale {
  if (!isFinite(maxY) || maxY <= 0) {
    return { max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] };
  }
  const rawStep = maxY / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  let stepNorm: number;
  if (norm <= 1) stepNorm = 1;
  else if (norm <= 2) stepNorm = 2;
  else if (norm <= 2.5) stepNorm = 2.5;
  else if (norm <= 5) stepNorm = 5;
  else stepNorm = 10;
  const step = stepNorm * mag;
  const max = Math.ceil(maxY / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step / 2; v += step) ticks.push(Math.round(v));
  return { max, ticks };
}

// Largest thrust value across every propeller row on a page.
export function maxThrust(thrust: { rows: { thrust?: string }[] }[] | undefined): number {
  let m = 0;
  for (const t of thrust ?? []) {
    for (const r of t.rows) {
      if (r.thrust && r.thrust !== '—') {
        const v = parseFloat(r.thrust);
        if (!isNaN(v) && v > m) m = v;
      }
    }
  }
  return m;
}
