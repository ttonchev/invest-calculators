/** Use case — 1. Required savings for a target income. Solves one unknown. */
import { Finance } from "../domain/finance.js";
import { Fmt } from "../format.js";
import { metric, COLOR, months, failure, Calculator } from "./base.js";

class NeededSavings extends Calculator {
  constructor() {
    super({ id: "need", tab: "Колко ми трябва", title: "Колко ми трябва",
      description: "Въведи дохода, от който искаш да живееш, в днешни пари. Калкулаторът добавя инфлацията и смята колко капитал ти трябва. После избери какво не знаеш: вноската, доходността, годините или началната сума. Полето, което се смята, се оцветява.",
      groups: [
        { title: "Целта", fields: [
          { key: "income", label: "Месечен доход в днешни пари, €", value: 1500, min: 0 },
          { key: "years", label: "След колко години", value: 25, min: 1, max: 100 },
          { key: "swr", label: "Теглене от капитала годишно", value: 4, options: [[3, "3%"], [3.5, "3,5%"], [4, "4% (правилото на 4%)"], [5, "5%"]] },
          { key: "inflation", label: "Инфлация годишно, %", value: 3, min: 0, max: 50 }] },
        { title: "Какво влагаш", fields: [
          { key: "mode", label: "Смятам", value: "monthly", options: [["monthly", "нужната вноска"], ["ret", "нужната доходност"], ["years", "нужните години"], ["initial", "нужната начална сума"]] },
          { key: "initial", label: "Начална сума, €", value: 4950, min: 0 },
          { key: "monthly", label: "Месечна вноска, €", value: 786, min: 0 },
          { key: "step", label: "Увеличение на вноската годишно, %", value: 3, min: 0, max: 50 },
          { key: "ret", label: "Годишна доходност, %", value: 8, min: -10, max: 60 },
          { key: "fee", label: "Такса на фондовете, %", value: 0.2, min: 0, max: 10 }] }] });
  }
  calculate(v) {
    const target = y => Finance.inflate(v.income * 12 / (v.swr / 100), v.inflation / 100, y);
    const run = p => Finance.project({ initial: p.initial, monthly: p.monthly, step: v.step / 100, rate: (p.ret - v.fee) / 100, months: months(p.years) });
    const p = { initial: v.initial, monthly: v.monthly, ret: v.ret, years: v.years };
    let alreadyCovered = false;

    if (v.mode === "monthly") {                       // end value is linear in the deposit → exact formula
      const base = run({ ...p, monthly: 0 }).end, perUnit = run({ ...p, initial: 0, monthly: 1 }).end;
      const x = (target(p.years) - base) / perUnit;
      alreadyCovered = x <= 0; p.monthly = Math.max(0, x);
    } else if (v.mode === "initial") {                // linear in the starting sum too
      const base = run({ ...p, initial: 0 }).end, perUnit = run({ ...p, initial: 1, monthly: 0 }).end;
      const x = (target(p.years) - base) / perUnit;
      alreadyCovered = x <= 0; p.initial = Math.max(0, x);
    } else if (v.mode === "ret") {
      const r = Finance.solveIncreasing(x => run({ ...p, ret: x }).end - target(p.years), -10, 80);
      if (r === null) return failure("Целта не се постига дори при доходност 80% годишно. Увеличи вноската или срока.");
      p.ret = r;
    } else {
      const k = Finance.firstMonth(m => run({ ...p, years: m / 12 }).end >= target(m / 12));
      if (k === null) return failure("При тези вноска и доходност целта не се постига и за 100 години.");
      p.years = k / 12;
    }

    const proj = run(p), need = target(p.years), futureIncome = Finance.inflate(v.income, v.inflation / 100, p.years);
    const headline = {
      monthly: metric("Нужна вноска сега", Fmt.eur(p.monthly), `на месец, растяща с ${Fmt.pct(v.step)} годишно`, "hi"),
      initial: metric("Нужна начална сума", Fmt.eur(p.initial), `днес, наведнъж, плюс вноската от ${Fmt.eur(p.monthly)} на месец`, "hi"),
      ret: metric("Нужна доходност", Fmt.pct(p.ret, 2), `годишно преди таксите; реално: ${Fmt.pct(((1 + (p.ret - v.fee) / 100) / (1 + v.inflation / 100) - 1) * 100)}`, "hi"),
      years: metric("Стигаш целта за", Fmt.years(p.years), "при тази вноска и доходност", "hi") }[v.mode];
    const covered = alreadyCovered ? " Началната сума сама покрива целта, затова не е нужна " + (v.mode === "monthly" ? "вноска." : "допълнителна начална сума.") : "";
    return {
      solved: { key: v.mode, value: v.mode === "ret" ? +p.ret.toFixed(2) : v.mode === "years" ? +p.years.toFixed(2) : Math.round(p[v.mode]) },
      metrics: [headline,
        metric("Нужен капитал", Fmt.eur(need), `след ${Fmt.years(p.years)}; в днешни пари ${Fmt.eur(v.income * 12 / (v.swr / 100))}`),
        metric("Същият доход тогава", Fmt.eur(futureIncome), `на месец след ${Fmt.years(p.years)} — толкова струват днешните ${Fmt.eur(v.income)}`),
        metric("От тях вложени", Fmt.eur(proj.deposited), `останалите ${Fmt.eur(proj.end - proj.deposited)} са печалба`, "g")],
      note: `За ${Fmt.eur(v.income)} на месец в днешни пари след ${Fmt.years(p.years)} ти трябват ${Fmt.eur(need)}. Стигаш ги с ${Fmt.eur(p.monthly)} на месец, при ${Fmt.pct(p.ret, 1)} доходност и начална сума ${Fmt.eur(p.initial)}.${covered}`,
      series: [{ name: "Капиталът ти", color: COLOR.good, points: proj.balancePath },
        { name: "Нужният капитал (расте с инфлацията)", color: COLOR.bad, dashed: true, points: proj.balancePath.map(([y]) => [y, target(y)]) },
        { name: "Вложени", color: COLOR.muted, dashed: true, points: proj.depositPath }],
      xLabel: "години" };
  }
}

export { NeededSavings };
