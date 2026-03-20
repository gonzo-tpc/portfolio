'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

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

function parseSheet(file: File): Promise<ParsedCapTable | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const wb = XLSX.read(data, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws, { defval: '' })
        if (!json.length) return resolve(null)
        const headers = Object.keys(json[0])
        resolve({ headers, rows: json.slice(0, 50) }) // cap at 50 rows for display
      } catch {
        resolve(null)
      }
    }
    reader.readAsBinaryString(file)
  })
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function DocumentsTab({ companyId }: { companyId: string }) {
  const [docs, setDocs] = useState<UploadedDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadDocs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.storage
      .from('documents')
      .list(`companies/${companyId}`, { sortBy: { column: 'created_at', order: 'desc' } })
    if (error) { setError(error.message); setLoading(false); return }
    const loaded: UploadedDoc[] = (data || []).map(f => {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(`companies/${companyId}/${f.name}`)
      return {
        name: f.name,
        path: `companies/${companyId}/${f.name}`,
        url: urlData.publicUrl,
        uploadedAt: f.created_at || '',
        size: f.metadata?.size || 0,
      }
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

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file, { upsert: false })

      if (uploadError) { setError(uploadError.message); continue }

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
      const parsed = isCapTable ? await parseSheet(file) : null

      newDocs.push({
        name: file.name,
        path,
        url: urlData.publicUrl,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        parsed,
      })
    }

    setDocs(prev => [...newDocs, ...prev])
    setUploading(false)
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
  }, [companyId])

  const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['xlsx', 'xls'].includes(ext || '')) return '📊'
    if (ext === 'csv') return '📋'
    if (ext === 'pdf') return '📄'
    return '📁'
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#22c55e' : '#2a2a3a'}`,
          borderRadius: 12,
          padding: '32px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          marginBottom: 24,
          background: dragging ? '#0d1f12' : 'transparent',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <div style={{ fontSize: 32, marginBottom: 8 }}>
          {uploading ? '⏳' : '📂'}
        </div>
        <div style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: 4 }}>
          {uploading ? 'Uploading...' : 'Drop cap tables or docs here'}
        </div>
        <div style={{ color: '#8888aa', fontSize: 13 }}>
          Supports .xlsx, .xls, .csv, .pdf · Click to browse
        </div>
      </div>

      {error && (
        <div style={{ background: '#2a1a1a', border: '1px solid #f87171', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Document list */}
      {loading && (
        <div style={{ color: '#8888aa', textAlign: 'center', padding: 32 }}>Loading documents...</div>
      )}

      {!loading && docs.length === 0 && (
        <div style={{ color: '#8888aa', textAlign: 'center', padding: '32px 0', fontSize: 13 }}>
          No documents uploaded yet.
        </div>
      )}

      {docs.map(doc => (
        <div key={doc.path} style={{ border: '1px solid #2a2a3a', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <span style={{ fontSize: 22 }}>{fileIcon(doc.name)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
              <div style={{ color: '#8888aa', fontSize: 12 }}>
                {doc.size ? formatBytes(doc.size) : ''}{doc.size ? ' · ' : ''}
                {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {doc.parsed && (
                <button
                  onClick={() => setExpandedDoc(expandedDoc === doc.path ? null : doc.path)}
                  style={{ background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 6, padding: '5px 12px', color: '#22c55e', fontSize: 12, cursor: 'pointer' }}
                >
                  {expandedDoc === doc.path ? 'Hide' : 'Preview'}
                </button>
              )}
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 6, padding: '5px 12px', color: '#8888aa', fontSize: 12, textDecoration: 'none' }}
              >
                Download
              </a>
              <button
                onClick={() => handleDelete(doc)}
                style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: 16, cursor: 'pointer', padding: '5px 8px' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Parsed cap table preview */}
          {expandedDoc === doc.path && doc.parsed && (
            <div style={{ borderTop: '1px solid #2a2a3a', overflowX: 'auto', maxHeight: 360, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#13131a' }}>
                  <tr>
                    {doc.parsed.headers.map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#8888aa', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid #2a2a3a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doc.parsed.rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1c1c26' }}>
                      {doc.parsed!.headers.map(h => (
                        <td key={h} style={{ padding: '8px 12px', color: '#f0f0f5', whiteSpace: 'nowrap' }}>{String(row[h] ?? '')}</td>
                      ))}
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
