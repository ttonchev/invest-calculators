/** Use case — 6. Cost of delaying the start of investing. */
import { Finance } from "../domain/finance.js";
import { Fmt } from "../format.js";
import { metric, COLOR, months, Calculator } from "./base.js";

class CostOfWaiting extends Calculator {
  constructor() {
    super({ id: "wait", tab: "Цената на чакането", title: "Цената на чакането",
      description: "Какво струва да отложиш инвестирането с няколко години. Сравнява се начало сега с начало след отлагане, при една и съща месечна вноска и един и същ краен срок.",
      groups: [{ title: "Твоите числа", fields: [
        { key: "initial", label: "Начална сума, €", value: 0, min: 0 }, { key: "monthly", label: "Месечна вноска, €", value: 300, min: 0 },
        { key: "years", label: "Общ срок, години", value: 30, min: 1, max: 100 }, { key: "ret", label: "Годишна доходност, %", value: 7, min: -50, max: 100 },
        { key: "delay", label: "Отлагам с, години", value: 5, min: 0, max: 100 }] }] });
  }
  calculate(v) {
    const total = months(v.years), wait = Math.min(months(v.delay), total), rate = v.ret / 100;
    const now = Finance.project({ initial: v.initial, monthly: v.monthly, rate, months: total });
    const later = (monthly, upTo = total) => {
      const idle = Finance.project({ initial: v.initial, rate, months: Math.min(wait, upTo) }).end;
      return upTo <= wait ? idle : Finance.project({ initial: idle, monthly, rate, months: upTo - wait }).end;
    };
    const lateEnd = later(v.monthly), cost = now.end - lateEnd;
    const catchUp = Finance.solveIncreasing(c => later(c) - now.end, 0, 1e6);
    const latePath = []; for (let k = 0; k <= total; k += 12) latePath.push([k / 12, later(v.monthly, k)]);
    return {
      metrics: [metric("Започваш сега", Fmt.eur(now.end), `вложени ${Fmt.eur(now.deposited)}`, "hi"),
        metric(`Започваш след ${Fmt.years(v.delay)}`, Fmt.eur(lateEnd), `вложени ${Fmt.eur(v.initial + v.monthly * (total - wait))}`),
        metric("Цената на чакането", Fmt.eur(cost), `${Fmt.pct(now.end ? cost / now.end * 100 : 0, 0)} от крайния капитал`, "r"),
        metric("За да настигнеш", catchUp === null ? "—" : `${Fmt.eur(catchUp - v.monthly)} още`, "на месец, ако започнеш късно")],
      note: "Всяка година отлагане ти струва повече от предишната, защото най-силните години на сложната лихва са последните.",
      series: [{ name: "Започваш сега", color: COLOR.good, points: now.balancePath }, { name: "Започваш късно", color: COLOR.bad, points: latePath }],
      xLabel: "години", footnote: "Примерни допускания, не прогноза." };
  }
}

export { CostOfWaiting };
