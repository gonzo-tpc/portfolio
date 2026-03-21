'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Founder {
  id: string
  company_id: string
  name: string
  title: string | null
  linkedin_url: string | null
  notes: string | null
}

export default function TeamTab({ companyId }: { companyId: string }) {
  const [founders, setFounders] = useState<Founder[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Founder | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', title: '', linkedin_url: '', notes: '' })

  useEffect(() => {
    supabase.from('founders').select('*').eq('company_id', companyId).order('name')
      .then(({ data }) => { setFounders(data || []); setLoading(false) })
  }, [companyId])

  const openAdd = () => { setForm({ name: '', title: '', linkedin_url: '', notes: '' }); setEditing(null); setAdding(true) }
  const openEdit = (f: Founder) => { setForm({ name: f.name, title: f.title || '', linkedin_url: f.linkedin_url || '', notes: f.notes || '' }); setEditing(f); setAdding(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    if (editing) {
      const { data } = await supabase.from('founders').update({ ...form }).eq('id', editing.id).select().single()
      if (data) setFounders(prev => prev.map(f => f.id === editing.id ? data : f))
    } else {
      const { data } = await supabase.from('founders').insert({ ...form, company_id: companyId }).select().single()
      if (data) setFounders(prev => [...prev, data])
    }
    setAdding(false)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('founders').delete().eq('id', id)
    setFounders(prev => prev.filter(f => f.id !== id))
  }

  const linkedinHandle = (url: string) => {
    const match = url.match(/linkedin\.com\/in\/([^/]+)/)
    return match ? match[1] : url
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ color: '#8888aa', fontSize: 13 }}>{founders.length} team member{founders.length !== 1 ? 's' : ''}</div>
        <button onClick={openAdd} style={{ background: '#22c55e', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          + Add Person
        </button>
      </div>

      {/* Add/Edit modal */}
      {adding && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{editing ? 'Edit Person' : 'Add Team Member'}</h3>
              <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {[
              ['Name', 'name', 'text', 'e.g. Jane Smith'],
              ['Title', 'title', 'text', 'e.g. CEO & Co-Founder'],
              ['LinkedIn URL', 'linkedin_url', 'url', 'https://linkedin.com/in/...'],
              ['Notes', 'notes', 'text', 'Anything worth noting...'],
            ].map(([label, field, , placeholder]) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#8888aa', fontSize: 11, textTransform: 'uppercase', marginBottom: 5 }}>{label}</label>
                <input
                  value={form[field as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '9px 12px', color: '#f0f0f5', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                style={{ flex: 1, background: form.name.trim() ? '#22c55e' : '#2a2a3a', border: 'none', borderRadius: 8, padding: '11px', color: form.name.trim() ? '#000' : '#8888aa', fontWeight: 700, fontSize: 14, cursor: form.name.trim() ? 'pointer' : 'not-allowed' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setAdding(false)} style={{ flex: 1, background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '11px', color: '#8888aa', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ color: '#8888aa', textAlign: 'center', padding: 40 }}>Loading...</div>}

      {!loading && founders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#8888aa' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
          <p style={{ marginBottom: 4 }}>No team members yet</p>
          <p style={{ fontSize: 13 }}>Add founders and key people for this company.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {founders.map(f => (
          <div key={f.id} style={{ background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#f0f0f5', flexShrink: 0 }}>
                  {f.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{f.name}</div>
                  {f.title && <div style={{ color: '#8888aa', fontSize: 13 }}>{f.title}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(f)} style={{ background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }}>✎</button>
                <button onClick={() => handleDelete(f.id)} style={{ background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }}>✕</button>
              </div>
            </div>

            {f.linkedin_url && (
              <a href={f.linkedin_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60a5fa', fontSize: 13, textDecoration: 'none', marginBottom: f.notes ? 10 : 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                {linkedinHandle(f.linkedin_url)}
              </a>
            )}

            {f.notes && <div style={{ color: '#8888aa', fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{f.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
