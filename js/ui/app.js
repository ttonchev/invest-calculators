/** Layer 3 — presentation: tabs, hash routing and theme. */
import { CalculatorPanel } from "./calculator-panel.js";

/** Composition root: tabs, hash routing, theme. */
class App {
  constructor(calculators, navEl, mainEl) {
    this.panels = new Map(); this.navEl = navEl;
    calculators.forEach(c => {
      const panel = new CalculatorPanel(c); this.panels.set(c.id, panel); mainEl.append(panel.root);
      const b = document.createElement("button"); b.textContent = c.tab; b.dataset.id = c.id; b.onclick = () => this.show(c.id); navEl.append(b);
    });
    window.addEventListener("hashchange", () => this.show(location.hash.slice(1)));
    document.getElementById("theme").onclick = () => {
      const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === "dark" : (window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
      r.dataset.theme = dark ? "light" : "dark";
      try { localStorage.setItem("theme", r.dataset.theme); } catch { /* storage unavailable */ }
    };
    try { const t = localStorage.getItem("theme"); if (t) document.documentElement.dataset.theme = t; } catch { /* storage unavailable */ }
    this.show(location.hash.slice(1));
  }
  show(id) {
    if (!this.panels.has(id)) id = this.panels.keys().next().value;
    this.panels.forEach((p, key) => { p.root.hidden = key !== id; if (key === id && !p.ready) { p.update(); p.ready = true; } });
    this.navEl.querySelectorAll("button").forEach(b => b.setAttribute("aria-current", b.dataset.id === id));
    try { history.replaceState(null, "", "#" + id); } catch { /* sandboxed viewer */ }
  }
}

export { App };
