import test from "node:test";
import assert from "node:assert/strict";
import { REGISTRY } from "../js/calculators/index.js";
import { Finance } from "../js/domain/finance.js";

const by = id => REGISTRY.find(c => c.id === id);
const defaults = c => Object.fromEntries(c.fields.map(f => [f.key, f.value]));
const run = (id, over = {}) => { const c = by(id); return c.calculate({ ...defaults(c), ...over }); };
const text = r => r.metrics.map(m => m.value).join(" | ").replace(/\u00a0/g, " ");

test("every calculator returns a valid Result for its defaults", () => {
  for (const c of REGISTRY) {
    const r = c.calculate(defaults(c));
    assert.ok(r.metrics.length > 0, c.id); assert.ok(r.note, c.id);
    for (const s of r.series ?? []) assert.ok(s.points.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)), c.id);
  }
});
test("registry ids are unique and every field has a key and label", () => {
  assert.equal(new Set(REGISTRY.map(c => c.id)).size, REGISTRY.length);
  for (const f of REGISTRY.flatMap(c => c.fields)) assert.ok(f.key && f.label);
});
test("needed savings: default contribution is 786 and capital is 942 200", () => {
  const r = run("need");
  assert.equal(r.solved.key, "monthly"); assert.equal(r.solved.value, 786);
  assert.match(text(r), /942\s200/);
});
test("needed savings: solved contribution really reaches the target", () => {
  const r = run("need"), c = by("need");
  const v = defaults(c), end = Finance.project({ initial: v.initial, monthly: r.solved.value, step: 0.03, rate: 0.078, months: 300 }).end;
  assert.ok(Math.abs(end - 942200) / 942200 < 0.002);
});
test("needed savings: starting sum that already covers the goal is explained, not silently 0", () => {
  const r = run("need", { initial: 900000 });
  assert.equal(r.solved.value, 0); assert.match(r.note, /сама покрива/);
});
test("needed savings: unreachable goals return a warning without metrics", () => {
  const r = run("need", { mode: "ret", years: 1, initial: 0, monthly: 0 });
  assert.equal(r.tone, "warn"); assert.equal(r.metrics.length, 0);
  assert.equal(run("need", { mode: "years", ret: 0, monthly: 1 }).tone, "warn");
});
test("needed savings: every mode yields a consistent solved value", () => {
  for (const mode of ["monthly", "ret", "years", "initial"]) { const r = run("need", { mode }); assert.equal(r.solved.key, mode); assert.ok(Number.isFinite(r.solved.value)); }
});
test("etf + company: matches the hand calculation", () => {
  const r = run("etf"); assert.match(text(r), /1\s?134 €/); assert.ok(r.table.rows.length === 7);
});
test("fees: ETF beats the typical fund; numbers match the reference", () => {
  const r = run("fees"); assert.match(text(r), /100\s869 €/); assert.match(text(r), /70\s450 €/);
});
test("income duration: 450 000 € at 1 500 €/month lasts 45 years 3 months", () => {
  assert.match(text(run("income")), /45 г\. и 3 мес\./);
});
test("cost of waiting: delaying always costs something", () => {
  const r = run("wait"); assert.ok(r.metrics[2].tone === "r" && !/^0 €/.test(r.metrics[2].value));
});
