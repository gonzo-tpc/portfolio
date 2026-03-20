import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  try {
    const body = await req.json()
    const id = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const company = {
      id,
      fund_id: body.fund_id,
      name: body.name,
      sector: body.sector || null,
      description: body.description || null,
      status: 'active',
      total_invested: 0,
      current_mark: 0,
      entry_valuation: 0,
      current_valuation: 0,
      moic: 0,
      irr: 0,
    }
    const { error } = await supabase.from('companies').insert(company)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
