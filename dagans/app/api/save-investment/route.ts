import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calcCompanyIRR } from '@/lib/irr'

// Rate limiting: 30 requests per minute per IP
const rateMap = new Map<string, { count: number; resetAt: number }>()
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  entry.count++
  return entry.count > 30
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { companyId, investment, co_investors } = await req.json()

    if (!companyId || typeof companyId !== 'string') {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

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

    // Recalculate company totals using latest PPS × total shares
    const { data: allInv } = await supabase
      .from('investments')
      .select('id, civ_amount, civ_shares, pps, post_money_valuation, date')
      .eq('company_id', companyId)
      .order('date', { ascending: true })

    if (allInv?.length) {
      // Latest PPS determines mark for ALL rounds
      const latestPPS = Math.max(...allInv.map(i => Number(i.pps)))

      // Update each investment's mark: shares × latestPPS
      for (const inv of allInv) {
        const mark = Number(inv.civ_shares) * latestPPS
        const unrealized = mark - Number(inv.civ_amount)
        const moic = Number(inv.civ_amount) > 0 ? mark / Number(inv.civ_amount) : 0
        await supabase
          .from('investments')
          .update({ current_mark: mark, unrealized_gain: unrealized, moic })
          .eq('id', inv.id)
      }

      const total_invested = allInv.reduce((s, i) => s + Number(i.civ_amount), 0)
      const current_mark = allInv.reduce((s, i) => s + Number(i.civ_shares) * latestPPS, 0)
      const moic = total_invested > 0 ? current_mark / total_invested : 0

      // IRR using actual cashflow dates
      const irrInputs = allInv.map(i => ({
        date: i.date,
        civ_amount: Number(i.civ_amount),
        current_mark: Number(i.civ_shares) * latestPPS,
      }))
      const irr = calcCompanyIRR(irrInputs) ?? 0

      const sorted = allInv
      const entry_valuation = Number(sorted[0].post_money_valuation)
      const current_valuation = Number(sorted[sorted.length - 1].post_money_valuation)

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
          latest_investment_date: sorted[sorted.length - 1].date,
        })
        .eq('id', companyId)
    }

    return NextResponse.json({ success: true, investmentId: invId })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
