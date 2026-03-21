import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calcCompanyIRR } from '@/lib/irr'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  try {
    const { companyId, investment, co_investors } = await req.json()

    const invId = `inv-${companyId}-${Date.now()}`

    // Upsert the investment round
    const { error: invError } = await supabase
      .from('investments')
      .upsert({ id: invId, company_id: companyId, ...investment })

    if (invError) return NextResponse.json({ error: invError.message }, { status: 500 })

    // Insert co-investors
    if (co_investors?.length) {
      const ciRows = co_investors.map((ci: Record<string, unknown>, i: number) => ({
        id: `${invId}-ci-${i}`,
        investment_id: invId,
        ...ci,
      }))
      const { error: ciError } = await supabase.from('co_investors').upsert(ciRows)
      if (ciError) console.error('co_investor error:', ciError)
    }

    // Recalculate company totals using round-aware mark logic
    const { data: allInv } = await supabase
      .from('investments')
      .select('civ_amount, civ_shares, pps, post_money_valuation, date, moic, irr')
      .eq('company_id', companyId)
      .order('date', { ascending: true })

    if (allInv?.length) {
      const sorted = allInv.sort((a, b) => a.date.localeCompare(b.date))
      const latest = sorted[sorted.length - 1]
      const latestPps = Number(latest.pps)

      // Re-price all rounds at latest PPS, except the latest round stays at cost
      const markedInvestments = sorted.map((inv, i) => {
        const isLatest = i === sorted.length - 1
        const mark = isLatest
          ? Number(inv.civ_amount) // at cost
          : Number(inv.civ_shares) * latestPps // re-priced at latest round PPS
        return { ...inv, mark }
      })

      // Update each round's current_mark
      for (const inv of markedInvestments) {
        await supabase
          .from('investments')
          .update({ current_mark: inv.mark })
          .eq('company_id', companyId)
          .eq('date', inv.date)
      }

      const total_invested = sorted.reduce((s, i) => s + Number(i.civ_amount), 0)
      const current_mark = markedInvestments.reduce((s, i) => s + i.mark, 0)
      const moic = total_invested > 0 ? current_mark / total_invested : 0

      // Proper IRR using actual cashflow dates
      const irrInputs = markedInvestments.map(i => ({
        date: i.date,
        civ_amount: Number(i.civ_amount),
        current_mark: i.mark,
      }))
      const irr = calcCompanyIRR(irrInputs) ?? 0

      const entry_valuation = Number(sorted[0].post_money_valuation)
      const current_valuation = Number(latest.post_money_valuation)

      await supabase
        .from('companies')
        .update({
          total_invested,
          current_mark,
          moic,
          irr,
          entry_valuation,
          current_valuation,
          initial_investment_date: sorted[0].date,
          latest_investment_date: latest.date,
        })
        .eq('id', companyId)
    }

    return NextResponse.json({ success: true, investmentId: invId })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
