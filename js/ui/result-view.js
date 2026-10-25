/** Layer 3 — presentation: renders a Result into the DOM. */
import { ChartView } from "./chart-view.js";

const ResultView = {
  table: ({ head, rows }) => `<div class="tw"><table><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => typeof c === "object" ? `<td class="${c.tone}">${c.text}</td>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`,
  render(el, r, onAction) {
    const cards = r.metrics.map(m => `<div class="k ${m.tone}"><small>${m.label}</small><b>${m.value}</b><span>${m.sub}</span></div>`).join("");
    el.innerHTML = (cards ? `<div class="cards">${cards}</div>` : "") + `<div class="note ${r.tone || ""}">${r.note}</div>`;
    if (r.actions) { const bar = document.createElement("div"); bar.className = "chips"; r.actions.forEach(a => { const b = document.createElement("button"); b.className = "chip"; b.textContent = a.label; b.onclick = () => onAction(a.patch); bar.append(b); }); el.append(bar); }
    if (r.series) el.insertAdjacentHTML("beforeend", ChartView.render(r.series, r.xLabel) + (r.footnote ? `<p class="foot">${r.footnote}</p>` : ""));
    if (r.table && r.detailsTitle) el.insertAdjacentHTML("beforeend", `<details><summary>${r.detailsTitle}</summary>${this.table(r.table)}</details>`);
    else if (r.table) el.insertAdjacentHTML("beforeend", `<h3>${r.tableTitle || ""}</h3>${this.table(r.table)}${!r.series && r.footnote ? `<p class="foot">${r.footnote}</p>` : ""}`);
  } };

export { ResultView };
