/** Layer 2 — application: shared contract.
 * calculate(values) -> Result = { metrics[], note, tone?, series?, xLabel?, footnote?, table?, solved?, actions? } */

const metric = (label, value, sub, tone = "") => ({ label, value, sub, tone });
const COLOR = { good: "var(--g)", bad: "var(--r)", muted: "var(--b)" };
const months = years => Math.round(years * 12);
const failure = note => ({ metrics: [], note, tone: "warn" });

class Calculator {
  constructor({ id, tab, title, description, groups, presets = [] }) { Object.assign(this, { id, tab, title, description, groups, presets }); }
  get fields() { return this.groups.flatMap(g => g.fields); }
  calculate() { throw new Error("not implemented"); }
}

export { metric, COLOR, months, failure, Calculator };
