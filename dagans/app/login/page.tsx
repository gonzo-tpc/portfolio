'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/civ-logo.jpg" alt="CIV" style={{ height: 48, width: 'auto', filter: 'brightness(0) invert(1)', margin: '0 auto 24px', display: 'block' }} />
          <p style={{ color: '#8888aa', fontSize: 14 }}>Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{ width: '100%', background: '#13131a', border: `1px solid ${error ? '#f87171' : '#2a2a3a'}`, borderRadius: 10, padding: '14px 16px', color: '#f0f0f5', fontSize: 15, boxSizing: 'border-box', marginBottom: 12, outline: 'none' }}
          />
          {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            style={{ width: '100%', background: password ? '#22c55e' : '#2a2a3a', border: 'none', borderRadius: 10, padding: '14px', color: password ? '#000' : '#8888aa', fontWeight: 700, fontSize: 15, cursor: password ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
