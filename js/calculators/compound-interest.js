/** Use case — 2. Compound interest with contributions, inflation and fund fee. */
import { Finance } from "../domain/finance.js";
import { Fmt } from "../format.js";
import { metric, COLOR, months, Calculator } from "./base.js";

class CompoundInterest extends Calculator {
  constructor() {
    super({ id: "comp", tab: "Сложна лихва", title: "Сложна лихва",
      description: "Начална сума, месечни вноски, олихвяване от дневно до годишно, инфлация и такса на фонда. Резултатът е график и таблица година по година.",
      groups: [
        { title: "Начало", fields: [
          { key: "initial", label: "Начална сума, €", value: 1000, min: 0 },
          { key: "years", label: "Срок, години", value: 20, min: 1, max: 100 },
          { key: "ret", label: "Доходност годишно, %", value: 10, min: -50, max: 100 },
          { key: "freq", label: "Олихвяване", value: 1, options: [[365, "Дневно"], [12, "Месечно"], [4, "Тримесечно"], [1, "Годишно"]] }] },
        { title: "Вноски и реалност", fields: [
          { key: "monthly", label: "Месечна вноска, €", value: 200, min: 0 },
          { key: "step", label: "Годишно увеличение на вноската, %", value: 0, min: 0, max: 50 },
          { key: "inflation", label: "Инфлация, %", value: 3, min: 0, max: 50 },
          { key: "ter", label: "Такса на фонда (TER), %", value: 0, min: 0, max: 10 }] }] });
  }
  calculate(v) {
    const effective = Math.pow(1 + (v.ret - v.ter) / 100 / v.freq, v.freq) - 1;
    const p = Finance.project({ initial: v.initial, monthly: v.monthly, step: v.step / 100, rate: effective, months: months(v.years) });
    const real = p.balancePath.map(([y, b]) => [y, Finance.deflate(b, v.inflation / 100, y)]);
    const doubling = effective > 0 ? Math.log(2) / Math.log(1 + effective) : null;
    return {
      metrics: [metric("Крайна стойност", Fmt.eur(p.end), `след ${Fmt.years(v.years)}`, "hi"),
        metric("Внесени", Fmt.eur(p.deposited), "начална сума плюс вноски"),
        metric("Печалба", Fmt.eur(p.end - p.deposited), `реална доходност ${Fmt.pct(((1 + effective) / (1 + v.inflation / 100) - 1) * 100)} годишно`, "g"),
        metric("В днешни пари", Fmt.eur(real.at(-1)[1]), `след инфлация от ${Fmt.pct(v.inflation)} годишно`, "r")],
      note: `Ефективната годишна доходност е ${Fmt.pct(effective * 100, 2)}.${doubling ? ` Парите се удвояват за ${Fmt.years(doubling)}.` : ""}`,
      series: [{ name: "Баланс", color: COLOR.good, points: p.balancePath }, { name: "Внесени", color: COLOR.muted, dashed: true, points: p.depositPath }, { name: "Днешни пари", color: COLOR.bad, points: real }],
      xLabel: "години", footnote: "Печалбата се капитализира при всяко олихвяване. Примерни допускания, не прогноза.",
      detailsTitle: "Таблица година по година",
      table: { head: ["Година", "Внесени", "Печалба", "Баланс", "В днешни пари"],
        rows: p.balancePath.slice(1).map(([y, b], i) => [String(+y.toFixed(1)), Fmt.eur(p.depositPath[i + 1][1]), Fmt.eur(b - p.depositPath[i + 1][1]), Fmt.eur(b), Fmt.eur(real[i + 1][1])]) } };
  }
}

export { CompoundInterest };
