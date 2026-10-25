/** Locale-specific formatting (Bulgarian). Kept out of the domain. */

const Fmt = (() => {
  const loc = "bg-BG";
  const num = (n, d = 0) => n.toLocaleString(loc, { maximumFractionDigits: d });
  const sign = n => (n > 0 ? "+" : n < 0 ? "−" : "");
  return {
    eur: n => `${num(n)} €`,
    pct: (n, d = 1) => `${num(n, d)}%`,
    signedPct: (n, d = 1) => `${sign(Math.round(n * 10 ** d) / 10 ** d)}${num(Math.abs(n), d)}%`,
    signedEur: n => `${sign(Math.round(n))}${num(Math.abs(n))} €`,
    years(y) { const m = Math.round(y * 12), Y = Math.floor(m / 12), M = m % 12; return (Y ? `${Y} г.` : "") + (M ? `${Y ? " и " : ""}${M} мес.` : "") || "0 мес."; },
    compact: n => (n >= 1e6 ? `${num(n / 1e6, 1)} млн` : n >= 1e3 ? `${num(n / 1e3)} хил` : String(n)),
  };
})();

export { Fmt };
