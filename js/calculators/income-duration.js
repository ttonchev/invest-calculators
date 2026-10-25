/** Use case — 5. How long a capital lasts under inflation-indexed withdrawals. */
import { Finance } from "../domain/finance.js";
import { Fmt } from "../format.js";
import { metric, COLOR, months, Calculator } from "./base.js";

class IncomeDuration extends Calculator {
  constructor() {
    super({ id: "income", tab: "Докога стигат парите", title: "Докога стигат парите",
      description: "Имаш капитал и теглиш от него всеки месец. Тегленето расте с инфлацията, за да купува същото. Колко години стигат парите и колко най-много можеш да теглиш, за да стигнат за целия срок.",
      groups: [{ title: "Твоите числа", fields: [
        { key: "capital", label: "Капитал, €", value: 450000, min: 1 }, { key: "withdrawal", label: "Теглене сега, €/месец", value: 1500, min: 0 },
        { key: "ret", label: "Годишна доходност, %", value: 6, min: -50, max: 100 }, { key: "inflation", label: "Годишна инфлация, %", value: 3, min: 0, max: 50 },
        { key: "years", label: "Искам да стигнат за, години", value: 30, min: 1, max: 100 }] }] });
  }
  calculate(v) {
    const sim = (w, n) => Finance.drawdown({ capital: v.capital, withdrawal: w, rate: v.ret / 100, inflation: v.inflation / 100, months: n });
    const full = sim(v.withdrawal, 1200), maxW = Finance.solveIncreasing(w => -sim(w, months(v.years)).final, 0, v.capital);
    const horizon = full.depletedAt ? full.depletedAt / 12 + 1 : 60;
    const path = full.path.filter(([y]) => y <= horizon), real = path.map(([y, b]) => [y, Finance.deflate(b, v.inflation / 100, y)]);
    if (full.depletedAt) path.push([full.depletedAt / 12, 0]);
    const lasts = !full.depletedAt || full.depletedAt / 12 >= v.years;
    return {
      metrics: [metric("Парите стигат за", full.depletedAt ? Fmt.years(full.depletedAt / 12) : "над 100 г.", "след което капиталът свършва", "hi"),
        metric("Теглене като % от капитала", Fmt.pct(v.withdrawal * 12 / v.capital * 100), "през първата година"),
        metric(`Най-много на месец за ${v.years} г.`, Fmt.eur(maxW ?? 0), "в днешни пари, растящо с инфлацията", "g")],
      note: lasts ? `При тези числа парите ти стигат за целия срок от ${v.years} години.` : `При тези числа парите свършват след ${Fmt.years(full.depletedAt / 12)}, преди срока от ${v.years} години.`, tone: lasts ? "" : "warn",
      series: [{ name: "Остатъкът в капитал", color: COLOR.good, points: path }, { name: "В днешни пари", color: COLOR.bad, points: real }],
      xLabel: "години", footnote: "Сметката е с постоянна доходност. В реалния живот редът на годините има значение: срив в първите години на тегленето вреди много повече от същия срив по-късно." };
  }
}

export { IncomeDuration };
