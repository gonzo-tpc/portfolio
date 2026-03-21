/**
 * Calculate IRR using Newton-Raphson method.
 * cashflows: array of { date: 'YYYY-MM-DD', amount: number }
 * Negative amounts = money out (investments), positive = money in (current value/exit).
 * Returns annualized IRR as a decimal (e.g. 0.25 = 25%), or null if it can't converge.
 */
export function calculateIRR(cashflows: { date: string; amount: number }[]): number | null {
  if (cashflows.length < 2) return null

  const dates = cashflows.map(cf => new Date(cf.date).getTime())
  const t0 = dates[0]
  // Convert dates to years from first cashflow
  const years = dates.map(d => (d - t0) / (365.25 * 24 * 60 * 60 * 1000))
  const amounts = cashflows.map(cf => cf.amount)

  const npv = (rate: number) =>
    amounts.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, years[i]), 0)

  const npvDerivative = (rate: number) =>
    amounts.reduce((sum, cf, i) =>
      sum - (years[i] * cf) / Math.pow(1 + rate, years[i] + 1), 0)

  // Newton-Raphson iteration
  let rate = 0.15 // initial guess: 15%
  for (let i = 0; i < 100; i++) {
    const n = npv(rate)
    const d = npvDerivative(rate)
    if (Math.abs(d) < 1e-12) break
    const newRate = rate - n / d
    if (Math.abs(newRate - rate) < 1e-8) return parseFloat(newRate.toFixed(6))
    rate = newRate
    if (rate < -0.999) rate = -0.999 // prevent blow-up
  }

  return null
}

/**
 * Calculate IRR for a single investment given its rounds and current marks.
 */
export function calcCompanyIRR(
  investments: { date: string; civ_amount: number; current_mark: number }[]
): number | null {
  if (!investments.length) return null

  const today = new Date().toISOString().split('T')[0]

  // Money out: each investment date
  const cashflows: { date: string; amount: number }[] = investments.map(inv => ({
    date: inv.date,
    amount: -Number(inv.civ_amount),
  }))

  // Money in: total current mark today
  const totalMark = investments.reduce((s, i) => s + Number(i.current_mark), 0)
  cashflows.push({ date: today, amount: totalMark })

  return calculateIRR(cashflows)
}
