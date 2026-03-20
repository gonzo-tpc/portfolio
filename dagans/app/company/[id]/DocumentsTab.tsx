'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
// xlsx loaded dynamically to avoid SSR issues

interface UploadedDoc {
  name: string
  path: string
  url: string
  uploadedAt: string
  size: number
  parsed?: ParsedCapTable | null
}

interface ParsedCapTable {
  headers: string[]
  rows: Record<string, string | number>[]
}

interface ExtractedData {
  company_name: string | null
  round_name: string | null
  date: string | null
  security_type: string | null
  round_size: number | null
  civ_amount: number | null
  post_money_valuation: number | null
  civ_ownership_pct: number | null
  civ_shares: number | null
  pps: number | null
  current_mark: number | null
  co_investors: { name: string; amount: number | null; ownership_pct: number | null }[]
  flags: { field: string; question: string; options?: string[] }[]
  confidence: 'high' | 'medium' | 'low'
  notes: string | null
}

function fmt(n: number | null) {
  if (n === null || n === undefined) return '—'
  if (Math.abs(n) >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M'
  if (Math.abs(n) >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K'
  return '$' + n.toFixed(0)
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function parseSheet(file: File): Promise<ParsedCapTable | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx')
        const data = e.target?.result
        const wb = XLSX.read(data, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws, { defval: '' })
        if (!json.length) return resolve(null)
        const headers = Object.keys(json[0])
        resolve({ headers, rows: json.slice(0, 50) })
      } catch {
        resolve(null)
      }
    }
    reader.readAsBinaryString(file)
  })
}

export default function DocumentsTab({ companyId, companyName }: { companyId: string; companyName?: string }) {
  const [docs, setDocs] = useState<UploadedDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [reviewData, setReviewData] = useState<ExtractedData | null>(null)
  const [editedData, setEditedData] = useState<ExtractedData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadDocs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.storage
      .from('documents')
      .list(`companies/${companyId}`, { sortBy: { column: 'created_at', order: 'desc' } })
    if (error) { setError(error.message); setLoading(false); return }
    const loaded: UploadedDoc[] = (data || []).map(f => {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(`companies/${companyId}/${f.name}`)
      return { name: f.name, path: `companies/${companyId}/${f.name}`, url: urlData.publicUrl, uploadedAt: f.created_at || '', size: f.metadata?.size || 0 }
    })
    setDocs(loaded)
    setLoading(false)
    setLoadedOnce(true)
  }, [companyId])

  useEffect(() => { loadDocs() }, [loadDocs])

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return
    setUploading(true)
    setError(null)
    const newDocs: UploadedDoc[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const isCapTable = ['xlsx', 'xls', 'csv'].includes(ext || '')
      const path = `companies/${companyId}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, { upsert: false })
      if (uploadError) { setError(uploadError.message); continue }

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
      const parsed = isCapTable ? await parseSheet(file) : null

      newDocs.push({ name: file.name, path, url: urlData.publicUrl, uploadedAt: new Date().toISOString(), size: file.size, parsed })

      // Auto-analyze cap tables with AI
      if (isCapTable && parsed) {
        setUploading(false)
        setAnalyzing(true)
        try {
          const res = await fetch('/api/parse-captable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ headers: parsed.headers, rows: parsed.rows, companyId, companyName }),
          })
          const json = await res.json()
          if (json.success) {
            setReviewData(json.data)
            setEditedData(json.data)
          } else {
            setError('AI parsing failed: ' + json.error)
          }
        } catch (e) {
          setError('AI parsing error: ' + String(e))
        }
        setAnalyzing(false)
      }
    }

    setDocs(prev => [...newDocs, ...prev])
    setUploading(false)
  }

  const handleSave = async () => {
    if (!editedData) return
    setSaving(true)
    const { co_investors, flags, confidence, notes, company_name, ...investment } = editedData
    const res = await fetch('/api/save-investment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, investment, co_investors }),
    })
    const json = await res.json()
    if (json.success) {
      setSaveSuccess(true)
      setReviewData(null)
      setEditedData(null)
      setTimeout(() => { setSaveSuccess(false); window.location.reload() }, 1500)
    } else {
      setError('Save failed: ' + json.error)
    }
    setSaving(false)
  }

  const handleDelete = async (doc: UploadedDoc) => {
    await supabase.storage.from('documents').remove([doc.path])
    setDocs(prev => prev.filter(d => d.path !== doc.path))
    if (expandedDoc === doc.path) setExpandedDoc(null)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [companyId, companyName])

  const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['xlsx', 'xls'].includes(ext || '')) return '📊'
    if (ext === 'csv') return '📋'
    if (ext === 'pdf') return '📄'
    return '📁'
  }

  const confidenceColor = (c: string) => c === 'high' ? '#22c55e' : c === 'medium' ? '#f59e0b' : '#f87171'

  return (
    <div>
      {/* AI Review Modal */}
      {reviewData && editedData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 16, padding: 28, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>AI Extracted Data</h3>
                <span style={{ fontSize: 12, color: confidenceColor(editedData.confidence), background: confidenceColor(editedData.confidence) + '22', padding: '2px 8px', borderRadius: 10 }}>
                  {editedData.confidence} confidence
                </span>
              </div>
              <button onClick={() => { setReviewData(null); setEditedData(null) }} style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {editedData.notes && (
              <div style={{ background: '#1c1c26', borderRadius: 8, padding: '10px 14px', color: '#8888aa', fontSize: 13, marginBottom: 16 }}>
                💡 {editedData.notes}
              </div>
            )}

            {editedData.flags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {editedData.flags.map((flag, i) => (
                  <div key={i} style={{ background: '#2a1e0a', border: '1px solid #f59e0b44', borderRadius: 8, padding: '10px 14px', color: '#f59e0b', fontSize: 13, marginBottom: 8 }}>
                    ⚠️ <strong>{flag.field}:</strong> {flag.question}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {([
                ['round_name', 'Round Name', 'text'],
                ['date', 'Date', 'text'],
                ['security_type', 'Security Type', 'text'],
                ['round_size', 'Round Size ($)', 'number'],
                ['civ_amount', 'CIV Amount ($)', 'number'],
                ['post_money_valuation', 'Post-Money Val ($)', 'number'],
                ['civ_ownership_pct', 'CIV Ownership (%)', 'number'],
                ['civ_shares', 'CIV Shares', 'number'],
                ['pps', 'Price Per Share ($)', 'number'],
                ['current_mark', 'Current Mark ($)', 'number'],
              ] as [keyof ExtractedData, string, string][]).map(([field, label, type]) => (
                <div key={field}>
                  <label style={{ display: 'block', color: '#8888aa', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>{label}</label>
                  <input
                    type={type}
                    value={String(editedData[field] ?? '')}
                    onChange={e => setEditedData(prev => prev ? { ...prev, [field]: type === 'number' ? (e.target.value ? Number(e.target.value) : null) : e.target.value } : prev)}
                    style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 6, padding: '8px 10px', color: editedData[field] === null ? '#8888aa' : '#f0f0f5', fontSize: 13, boxSizing: 'border-box' }}
                    placeholder="Not found"
                  />
                </div>
              ))}
            </div>

            {editedData.co_investors.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: '#8888aa', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>Co-Investors</div>
                {editedData.co_investors.map((ci, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                    <span style={{ flex: 2, background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}>{ci.name}</span>
                    <span style={{ flex: 1, color: '#8888aa', fontSize: 13 }}>{fmt(ci.amount)}</span>
                    <span style={{ flex: 1, color: '#8888aa', fontSize: 13 }}>{ci.ownership_pct != null ? ci.ownership_pct.toFixed(2) + '%' : '—'}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, background: '#22c55e', border: 'none', borderRadius: 8, padding: '12px', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                {saving ? 'Saving...' : '✓ Save to Portfolio'}
              </button>
              <button
                onClick={() => { setReviewData(null); setEditedData(null) }}
                style={{ flex: 1, background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '12px', color: '#8888aa', fontSize: 14, cursor: 'pointer' }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div style={{ background: '#0d1f12', border: '1px solid #22c55e', borderRadius: 8, padding: '12px 16px', color: '#22c55e', marginBottom: 16, fontWeight: 600 }}>
          ✓ Investment saved! Refreshing data...
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? '#22c55e' : '#2a2a3a'}`, borderRadius: 12, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s', marginBottom: 24, background: dragging ? '#0d1f12' : 'transparent' }}
      >
        <input ref={inputRef} type="file" multiple accept=".xlsx,.xls,.csv,.pdf" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        <div style={{ fontSize: 32, marginBottom: 8 }}>{uploading || analyzing ? '⏳' : '📂'}</div>
        <div style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: 4 }}>
          {analyzing ? 'AI is reading the cap table...' : uploading ? 'Uploading...' : 'Drop cap tables or docs here'}
        </div>
        <div style={{ color: '#8888aa', fontSize: 13 }}>
          {analyzing ? 'Extracting investment data automatically' : 'Supports .xlsx, .xls, .csv, .pdf · Click to browse'}
        </div>
      </div>

      {error && (
        <div style={{ background: '#2a1a1a', border: '1px solid #f87171', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      {loading && <div style={{ color: '#8888aa', textAlign: 'center', padding: 32 }}>Loading documents...</div>}
      {!loading && docs.length === 0 && <div style={{ color: '#8888aa', textAlign: 'center', padding: '32px 0', fontSize: 13 }}>No documents uploaded yet.</div>}

      {docs.map(doc => (
        <div key={doc.path} style={{ border: '1px solid #2a2a3a', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <span style={{ fontSize: 22 }}>{fileIcon(doc.name)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
              <div style={{ color: '#8888aa', fontSize: 12 }}>{doc.size ? formatBytes(doc.size) : ''}{doc.size && doc.uploadedAt ? ' · ' : ''}{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {doc.parsed && (
                <button onClick={() => setExpandedDoc(expandedDoc === doc.path ? null : doc.path)} style={{ background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 6, padding: '5px 12px', color: '#22c55e', fontSize: 12, cursor: 'pointer' }}>
                  {expandedDoc === doc.path ? 'Hide' : 'Preview'}
                </button>
              )}
              <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 6, padding: '5px 12px', color: '#8888aa', fontSize: 12, textDecoration: 'none' }}>Download</a>
              <button onClick={() => handleDelete(doc)} style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: 16, cursor: 'pointer', padding: '5px 8px' }}>✕</button>
            </div>
          </div>

          {expandedDoc === doc.path && doc.parsed && (
            <div style={{ borderTop: '1px solid #2a2a3a', overflowX: 'auto', maxHeight: 360, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#13131a' }}>
                  <tr>{doc.parsed.headers.map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#8888aa', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid #2a2a3a' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {doc.parsed.rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1c1c26' }}>
                      {doc.parsed!.headers.map(h => <td key={h} style={{ padding: '8px 12px', color: '#f0f0f5', whiteSpace: 'nowrap' }}>{String(row[h] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
