/** Layer 3 — presentation: SVG line chart. */
import { Fmt } from "../format.js";

const ChartView = {
  niceStep(x) { const p = 10 ** Math.floor(Math.log10(x)), n = x / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; },
  render(series, xLabel) {
    const pts = series.flatMap(s => s.points), xMax = Math.max(1, ...pts.map(p => p[0])), yMax = Math.max(1, ...pts.map(p => p[1]));
    const step = this.niceStep(yMax / 4), Y = Math.ceil(yMax / step) * step, W = 700, H = 300, L = 58, R = 12, T = 10, B = 30;
    const sx = x => L + x / xMax * (W - L - R), sy = y => T + (1 - y / Y) * (H - T - B), t = (x, y, a, s) => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="11" fill="var(--mute)">${s}</text>`;
    let svg = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="График">`;
    for (let y = 0; y <= Y + 1e-9; y += step) svg += `<line x1="${L}" x2="${W - R}" y1="${sy(y)}" y2="${sy(y)}" stroke="var(--line)"/>` + t(L - 6, sy(y) + 4, "end", Fmt.compact(y));
    const xs = Math.max(1, this.niceStep(xMax / 6)); for (let x = 0; x <= xMax + 1e-9; x += xs) svg += t(sx(x), H - 10, "middle", x);
    svg += t(W - R, H - 1, "end", xLabel);
    series.forEach((s, i) => {
      const d = s.points.map(([x, y], j) => `${j ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(" ");
      if (i === 0) svg += `<path d="${d} L${sx(s.points.at(-1)[0])} ${sy(0)} L${sx(0)} ${sy(0)}Z" fill="${s.color}" opacity=".12"/>`;
      svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5"${s.dashed ? ' stroke-dasharray="6 5"' : ""}/>`;
    });
    const legend = series.map(s => `<span><svg class="sw" width="12" height="12" aria-hidden="true"><rect width="12" height="12" rx="3" fill="${s.color}"/></svg>${s.name}</span>`).join("");
    return `<div class="leg">${legend}</div>${svg}</svg>`;
  } };

export { ChartView };
