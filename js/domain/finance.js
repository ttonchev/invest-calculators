/** Layer 1 — domain: pure finance functions (no DOM, no formatting). */

const Finance = (() => {
  const monthlyRate = annual => Math.pow(1 + annual, 1 / 12) - 1;
  const inflate = (amount, annualInflation, years) => amount * Math.pow(1 + annualInflation, years);
  const deflate = (amount, annualInflation, years) => amount / Math.pow(1 + annualInflation, years);

  /** Accumulation with recurring deposits. Returns yearly paths and totals. */
  function project({ initial = 0, monthly = 0, step = 0, rate, months }) {
    const m = monthlyRate(rate);
    let balance = initial, deposited = initial, deposit = monthly, balanceSum = 0;
    const balancePath = [[0, initial]], depositPath = [[0, initial]];
    for (let k = 1; k <= months; k++) {
      balance = (balance + deposit) * (1 + m);
      deposited += deposit;
      balanceSum += balance;
      if (k % 12 === 0) deposit *= 1 + step;
      if (k % 12 === 0 || k === months) { balancePath.push([k / 12, balance]); depositPath.push([k / 12, deposited]); }
    }
    return { balancePath, depositPath, end: balance, deposited, balanceSum };
  }

  /** Decumulation: inflation-indexed withdrawals from a capital. */
  function drawdown({ capital, withdrawal, rate, inflation, months }) {
    const m = monthlyRate(rate);
    let balance = capital, w = withdrawal, depletedAt = null;
    const path = [[0, capital]];
    for (let k = 1; k <= months; k++) {
      balance = (balance - w) * (1 + m);
      if (depletedAt === null && balance <= 0) depletedAt = k;
      if (k % 12 === 0) { w *= 1 + inflation; path.push([k / 12, Math.max(0, balance)]); }
    }
    return { path, depletedAt, final: balance };
  }

  /** Root of an increasing f on [lo, hi]. null if f(hi) < 0, lo if f(lo) >= 0. */
  function solveIncreasing(f, lo, hi) {
    if (f(hi) < 0) return null;
    if (f(lo) >= 0) return lo;
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; f(mid) < 0 ? lo = mid : hi = mid; }
    return (lo + hi) / 2;
  }

  /** Smallest month count in [1, max] for which predicate holds, or null. */
  const firstMonth = (pred, max = 1200) => { for (let k = 1; k <= max; k++) if (pred(k)) return k; return null; };

  return { monthlyRate, inflate, deflate, project, drawdown, solveIncreasing, firstMonth };
})();

export { Finance };
