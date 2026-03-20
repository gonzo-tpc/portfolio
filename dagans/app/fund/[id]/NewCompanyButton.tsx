'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SECTORS = ['Artificial Intelligence', 'Biotech', 'Clean Tech', 'Cybersecurity', 'E-Commerce', 'FinTech', 'SaaS', 'Healthcare', 'Consumer', 'Deep Tech', 'Other']

export default function NewCompanyButton({ fundId }: { fundId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), sector, description, fund_id: fundId }),
    })
    const json = await res.json()
    if (json.success) {
      router.push(`/company/${json.id}`)
    } else {
      setError(json.error)
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
      >
        + Add Company
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add New Company</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#8888aa', fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Company Name *</label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
                style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: '#f0f0f5', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#8888aa', fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Sector</label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: sector ? '#f0f0f5' : '#8888aa', fontSize: 14, boxSizing: 'border-box' }}
              >
                <option value="">Select a sector</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#8888aa', fontSize: 12, textTransform: 'uppercase', marginBottom: 6 }}>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="One-line description..."
                rows={2}
                style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: '#f0f0f5', fontSize: 14, boxSizing: 'border-box', resize: 'none' }}
              />
            </div>

            {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleCreate}
                disabled={saving || !name.trim()}
                style={{ flex: 1, background: name.trim() ? '#22c55e' : '#2a2a3a', border: 'none', borderRadius: 8, padding: '12px', color: name.trim() ? '#000' : '#8888aa', fontWeight: 700, fontSize: 14, cursor: name.trim() ? 'pointer' : 'not-allowed' }}
              >
                {saving ? 'Creating...' : 'Create & Open'}
              </button>
              <button onClick={() => setOpen(false)} style={{ flex: 1, background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '12px', color: '#8888aa', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>

            <p style={{ color: '#8888aa', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
              After creating, upload a cap table to auto-populate all the metrics.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
