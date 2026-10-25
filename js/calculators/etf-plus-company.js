/** Use case — 3. Index fund core + one stock. */
import { Fmt } from "../format.js";
import { metric, Calculator } from "./base.js";

class EtfPlusCompany extends Calculator {
  constructor() {
    super({ id: "etf", tab: "ETF + една компания", title: "ETF + една компания",
      description: "Ядрото е индексен фонд. Малка част отива в компания, която си оценил и купуваш под справедливата ѝ цена. Виж какво става с портфейла, когато индексът стои на място, и колко губиш, ако си сбъркал.",
      groups: [
        { title: "Портфейлът", fields: [
          { key: "amount", label: "Сума, €", value: 1000, min: 0 }, { key: "etfShare", label: "В ETF, %", value: 90, min: 0, max: 100 },
          { key: "index", label: "Индексът за периода, %", value: 0, min: -100 }, { key: "company", label: "Компанията за периода, %", value: 134, min: -100 }] },
        { title: "Колко може да качи компанията", fields: [
          { key: "fair", label: "Справедлива цена, $", value: 190, min: 0.01 }, { key: "buy", label: "Купувам на, $", value: 91, min: 0.01 }] }] });
  }
  calculate(v) {
    const w = v.etfShare / 100, mix = (i, c) => w * i + (1 - w) * c;
    const ret = mix(v.index, v.company), crash = mix(v.index, -50), upside = (v.fair / v.buy - 1) * 100, gain = ret - v.index;
    const cols = [-50, -25, 0, 25, 50, 100, 150], rows = [-30, -20, -10, 0, 10, 20, 30];
    const cell = x => ({ text: Fmt.signedPct(x), tone: x > 0.0001 ? "pos" : x < -0.0001 ? "neg" : "" });
    return {
      metrics: [metric("Портфейлът", Fmt.eur(v.amount * (1 + ret / 100)), `${Fmt.signedPct(ret)} за периода`, "hi"),
        metric("Само с индекса", Fmt.eur(v.amount * (1 + v.index / 100)), `${Fmt.signedPct(v.index)} за периода`),
        metric("Разликата от компанията", Fmt.signedEur(v.amount * gain / 100), `${Fmt.signedPct(gain)} спрямо индекса`, gain >= 0 ? "g" : "r"),
        metric("Ако компанията падне наполовина", Fmt.signedPct(crash), `при същия индекс; ${Fmt.eur(v.amount * (1 + crash / 100))} от ${Fmt.eur(v.amount)}`, "r")],
      note: `${Fmt.eur(v.amount * w)} са в ETF и ${Fmt.eur(v.amount * (1 - w))} в компанията. До справедливата цена: ${Fmt.signedPct(upside)}. Ако компанията падне наполовина, губиш ${Fmt.pct(Math.abs(crash - v.index))} от портфейла спрямо индекса.`,
      actions: [{ label: `Сложи го като доходност на компанията (${Fmt.signedPct(upside)})`, patch: { company: +upside.toFixed(1) } }],
      tableTitle: "Портфейлът при всяка комбинация",
      table: { head: ["Индекс ↓ Компания →", ...cols.map(c => Fmt.signedPct(c, 0))], rows: rows.map(i => [Fmt.signedPct(i, 0), ...cols.map(c => cell(mix(i, c)))]) },
      footnote: "Редовете са индексът, колоните — компанията. В клетката е резултатът за целия портфейл при избраното разпределение." };
  }
}

export { EtfPlusCompany };
