import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const correct = process.env.SITE_PASSWORD

  if (!correct) return NextResponse.json({ error: 'No password configured' }, { status: 500 })
  if (password !== correct) return NextResponse.json({ error: 'Wrong password' }, { status: 401 })

  const res = NextResponse.json({ success: true })
  res.cookies.set('civ-auth', 'true', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
