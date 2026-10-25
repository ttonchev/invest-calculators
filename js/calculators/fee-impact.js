/** Use case — 4. Fees: ETF vs fund with entry, annual and performance fees. */
import { Finance } from "../domain/finance.js";
import { Fmt } from "../format.js";
import { metric, COLOR, months, Calculator } from "./base.js";

class FeeImpact extends Calculator {
  constructor() {
    super({ id: "fees", tab: "Цената на таксата", title: "Цената на таксата",
      description: "Един и същ пазар, едни и същи пари. Веднъж през ETF, веднъж през фонд с такса вход, годишна такса и такса за успех. Виж колко от печалбата отива при някой друг.",
      presets: [["типичен български фонд", { ter: 0.2, entry: 2.5, fee: 2.5, perf: 0 }], ["чужд фонд през банка", { ter: 0.2, entry: 2, fee: 2, perf: 0 }], ["фонд с такса за успех", { ter: 0.2, entry: 0, fee: 1.5, perf: 20 }]],
      groups: [{ title: "Твоите числа", fields: [
        { key: "initial", label: "Начална сума, €", value: 10000, min: 0 }, { key: "monthly", label: "Месечна вноска, €", value: 100, min: 0 },
        { key: "years", label: "Години", value: 20, min: 1, max: 100 }, { key: "ret", label: "Доходност на пазара, %", value: 8, min: -50, max: 100 },
        { key: "ter", label: "Годишна такса на ETF-а, %", value: 0.2, min: 0, max: 10 }, { key: "entry", label: "Такса вход на фонда, %", value: 2.5, min: 0, max: 20 },
        { key: "fee", label: "Годишна такса на фонда, %", value: 2.5, min: 0, max: 10 }, { key: "perf", label: "Такса за успех, % от печалбата", value: 0, min: 0, max: 50 }] }] });
  }
  calculate(v) {
    const n = months(v.years), keep = 1 - v.entry / 100;
    const etf = Finance.project({ initial: v.initial, monthly: v.monthly, rate: (v.ret - v.ter) / 100, months: n });
    const fund = Finance.project({ initial: v.initial * keep, monthly: v.monthly * keep, rate: (v.ret - v.fee) / 100, months: n });
    const invested = etf.deposited, perfFee = Math.max(0, fund.end - invested) * v.perf / 100, fundEnd = fund.end - perfFee;
    const paid = invested * v.entry / 100 + fund.balanceSum * v.fee / 1200 + perfFee, etfProfit = etf.end - invested, gap = etf.end - fundEnd;
    return {
      metrics: [metric("ETF", Fmt.eur(etf.end), `печалба ${Fmt.eur(etfProfit)}`, "hi"), metric("Фондът", Fmt.eur(fundEnd), `печалба ${Fmt.eur(fundEnd - invested)}`),
        metric("Разликата", Fmt.eur(gap), `фондът остава ${Fmt.pct(fundEnd / etf.end * 100, 0)} от сумата`, "r"),
        metric("Платени такси на фонда", Fmt.eur(paid), `другите ${Fmt.eur(gap - paid)} са печалба, която парите от таксите щяха да донесат`)],
      note: etfProfit > 0 ? `Таксите изяждат ${Fmt.pct(gap / etfProfit * 100, 0)} от печалбата, която би направил ETF-ът.` : "При тези числа ETF-ът няма печалба.", tone: etfProfit > 0 ? "warn" : "",
      series: [{ name: "ETF", color: COLOR.good, points: etf.balancePath }, { name: "Фонд", color: COLOR.bad, points: fund.balancePath }, { name: "Вложени", color: COLOR.muted, dashed: true, points: etf.depositPath }],
      xLabel: "години", footnote: "Годишните такси на фондовете в световни акции в България са между 1,5% и 4,1%, на чуждите фондове през банка — между 1,6% и 2,3%. На ETF върху световния индекс — около 0,2%." };
  }
}

export { FeeImpact };
