import { NextRequest, NextResponse } from 'next/server'

// Brute-force protection: max 10 attempts per IP per 15 minutes
const authAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 10
const LOCKOUT_MS = 15 * 60_000

function isLockedOut(ip: string): boolean {
  const now = Date.now()
  const entry = authAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    authAttempts.set(ip, { count: 1, resetAt: now + LOCKOUT_MS })
    return false
  }
  entry.count++
  return entry.count > MAX_ATTEMPTS
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (isLockedOut(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  try {
    const { password } = await req.json()
    const correct = process.env.SITE_PASSWORD

    if (!correct) return NextResponse.json({ error: 'No password configured' }, { status: 500 })
    if (password !== correct) return NextResponse.json({ error: 'Wrong password' }, { status: 401 })

    // Clear attempts on success
    authAttempts.delete(ip)

    const res = NextResponse.json({ success: true })
    res.cookies.set('civ-auth', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
