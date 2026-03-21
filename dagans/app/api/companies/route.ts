import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple in-memory rate limiter (resets on cold start, good enough for low-traffic internal tool)
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20       // max requests
const RATE_WINDOW_MS = 60_000 // per 60 seconds

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

// Input validation
function validateCompanyInput(body: Record<string, unknown>): string | null {
  if (!body.name || typeof body.name !== 'string') return 'name is required'
  if (body.name.trim().length < 2) return 'name must be at least 2 characters'
  if (body.name.trim().length > 100) return 'name too long'
  if (!body.fund_id || typeof body.fund_id !== 'string') return 'fund_id is required'
  if (body.fund_id.length > 50) return 'fund_id invalid'
  if (body.sector && typeof body.sector !== 'string') return 'sector must be a string'
  if (body.description && typeof body.description !== 'string') return 'description must be a string'
  if (body.description && (body.description as string).length > 500) return 'description too long'
  return null
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const body = await req.json()

    // Validate input
    const validationError = validateCompanyInput(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const name = (body.name as string).trim()
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const company = {
      id,
      fund_id: (body.fund_id as string).trim(),
      name,
      sector: typeof body.sector === 'string' ? body.sector.trim().slice(0, 100) : null,
      description: typeof body.description === 'string' ? body.description.trim().slice(0, 500) : null,
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
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
