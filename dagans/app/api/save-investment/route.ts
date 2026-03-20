import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Recalculate and update company totals
    const { data: allInv } = await supabase
      .from('investments')
      .select('civ_amount, current_mark, moic, irr')
      .eq('company_id', companyId)

    if (allInv?.length) {
      const total_invested = allInv.reduce((s, i) => s + Number(i.civ_amount), 0)
      const current_mark = allInv.reduce((s, i) => s + Number(i.current_mark), 0)
      const moic = total_invested > 0 ? current_mark / total_invested : 0
      const avg_irr = allInv.reduce((s, i) => s + Number(i.irr), 0) / allInv.length

      await supabase
        .from('companies')
        .update({ total_invested, current_mark, moic, irr: avg_irr, latest_investment_date: investment.date })
        .eq('id', companyId)
    }

    return NextResponse.json({ success: true, investmentId: invId })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
