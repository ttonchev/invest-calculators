/** Layer 3 — presentation: one calculator's form + output. Parsing and validation live here. */
import { ResultView } from "./result-view.js";

/** Owns one calculator's form + output. Parsing/validation lives here, not in the use case. */
class CalculatorPanel {
  constructor(calculator) {
    this.calc = calculator; this.inputs = {};
    this.root = document.createElement("section"); this.root.hidden = true;
    this.root.innerHTML = `<h2>${calculator.title}</h2><p class="desc">${calculator.description}</p>`
      + (calculator.presets.length ? `<div class="chips">Бързо попълване: ${calculator.presets.map((p, i) => `<button class="chip" data-preset="${i}">${p[0]}</button>`).join("")}</div>` : "")
      + calculator.groups.map(g => `<div class="card"><h3>${g.title}</h3><div class="grid">${g.fields.map(f => this.fieldHtml(f)).join("")}</div></div>`).join("")
      + `<div class="card"><h3>Резултатът</h3><div data-out></div></div>`;
    calculator.fields.forEach(f => { this.inputs[f.key] = this.root.querySelector(`[data-key="${f.key}"]`); });
    this.out = this.root.querySelector("[data-out]");
    this.root.addEventListener("input", () => this.update());
    this.root.addEventListener("change", () => this.update());
    this.root.querySelectorAll("[data-preset]").forEach(b => b.onclick = () => this.patch(calculator.presets[b.dataset.preset][1]));
  }
  fieldHtml(f) {
    const control = f.options
      ? `<select data-key="${f.key}">${f.options.map(([v, l]) => `<option value="${v}"${String(v) === String(f.value) ? " selected" : ""}>${l}</option>`).join("")}</select>`
      : `<input data-key="${f.key}" type="number" inputmode="decimal" step="any" value="${f.value}"${f.min != null ? ` min="${f.min}"` : ""}${f.max != null ? ` max="${f.max}"` : ""}>`;
    return `<label>${f.label}${control}</label>`;
  }
  read() {
    const values = {};
    for (const f of this.calc.fields) {
      const raw = this.inputs[f.key].value;
      if (f.options && isNaN(raw)) { values[f.key] = raw; continue; }   // text option (e.g. a mode)
      let n = parseFloat(raw); if (!Number.isFinite(n)) n = 0;
      if (f.min != null) n = Math.max(f.min, n);
      if (f.max != null) n = Math.min(f.max, n);
      values[f.key] = n;
    }
    return values;
  }
  patch(values) { for (const k in values) this.inputs[k].value = values[k]; this.update(); }
  update() {
    try {
      const result = this.calc.calculate(this.read());
      const solvedKey = result.solved?.key;
      for (const k in this.inputs) this.inputs[k].classList.toggle("solved", k === solvedKey);
      if (result.solved) this.inputs[solvedKey].value = result.solved.value;
      ResultView.render(this.out, result, p => this.patch(p));
    } catch (err) {
      console.error(err);
      this.out.innerHTML = `<div class="note warn">Нещо се обърка при изчислението. Провери въведените числа.</div>`;
    }
  }
}

export { CalculatorPanel };
