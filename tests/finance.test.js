import test from "node:test";
import assert from "node:assert/strict";
import { Finance } from "../js/domain/finance.js";

const close = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) <= eps, `${a} !≈ ${b}`);

test("project: zero rate is plain addition (deposit at month start)", () => {
  const p = Finance.project({ initial: 1000, monthly: 100, rate: 0, months: 12 });
  close(p.end, 2200); close(p.deposited, 2200);
});
test("project: yearly step raises deposits once per year", () => {
  close(Finance.project({ initial: 0, monthly: 100, step: 0.1, rate: 0, months: 24 }).end, 1200 + 1320);
});
test("project: path has one point per year plus the start", () => {
  assert.equal(Finance.project({ initial: 0, monthly: 1, rate: 0.05, months: 36 }).balancePath.length, 4);
});
test("project: partial final year is included", () => {
  assert.equal(Finance.project({ initial: 0, monthly: 1, rate: 0.05, months: 30 }).balancePath.at(-1)[0], 2.5);
});
test("monthlyRate compounds back to the annual rate", () => close((1 + Finance.monthlyRate(0.08)) ** 12, 1.08, 1e-12));
test("inflate/deflate are inverses", () => close(Finance.deflate(Finance.inflate(100, 0.03, 10), 0.03, 10), 100, 1e-9));
test("end value is linear in the deposit (basis of the closed-form solvers)", () => {
  const f = m => Finance.project({ initial: 500, monthly: m, step: 0.03, rate: 0.07, months: 120 }).end;
  close(f(300) - f(0), 3 * (f(100) - f(0)), 1e-6);
});
test("drawdown: depletes and reports the month", () => {
  const d = Finance.drawdown({ capital: 1200, withdrawal: 100, rate: 0, inflation: 0, months: 24 });
  assert.equal(d.depletedAt, 12);
});
test("drawdown: never depletes when returns cover withdrawals", () => {
  assert.equal(Finance.drawdown({ capital: 1e6, withdrawal: 100, rate: 0.05, inflation: 0, months: 600 }).depletedAt, null);
});
test("solveIncreasing: finds the root, clamps and reports unreachable", () => {
  close(Finance.solveIncreasing(x => x - 7, 0, 100), 7, 1e-9);
  assert.equal(Finance.solveIncreasing(x => x + 5, 0, 100), 0);
  assert.equal(Finance.solveIncreasing(x => x - 500, 0, 100), null);
});
test("firstMonth finds the first match or null", () => {
  assert.equal(Finance.firstMonth(k => k >= 7), 7);
  assert.equal(Finance.firstMonth(() => false, 10), null);
});
