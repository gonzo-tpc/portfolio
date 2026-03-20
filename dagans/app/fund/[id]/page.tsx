import Link from 'next/link'
import { getFunds, getCompanies } from '@/lib/db'
import { notFound } from 'next/navigation'
import NewCompanyButton from './NewCompanyButton'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  if (Math.abs(n) >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M'
  return '$' + n.toLocaleString()
}

const SC: Record<string,string> = {
  'Artificial Intelligence': '#818cf8',
  'Biotech': '#34d399',
  'Clean Tech': '#fbbf24',
  'Cybersecurity': '#f87171',
  'E-Commerce': '#60a5fa'
}

export default async function FundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [funds, companies] = await Promise.all([getFunds(), getCompanies(id)])
  const fund = funds.find(f => f.id === id)
  if (!fund) notFound()

  const totalInvested = companies.reduce((s, c) => s + Number(c.total_invested), 0)
  const currentValue = companies.reduce((s, c) => s + Number(c.current_mark), 0)
  const moic = totalInvested > 0 ? (currentValue / totalInvested).toFixed(2) + 'x' : 'N/A'

  return (
    <div>
      <Link href="/" style={{ color: '#8888aa', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← All Funds</Link>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{fund.name}</h1>
        <p style={{ color: '#8888aa', fontSize: 14 }}>{fund.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 40 }}>
        {[
          ['Portfolio Companies', companies.length],
          ['Total Invested', fmt(totalInvested)],
          ['Current Value', fmt(currentValue)],
          ['Fund MOIC', moic],
        ].map(([label, value]) => (
          <div key={String(label)} style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 10, padding: 16 }}>
            <div style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
            <div style={{ color: '#f0f0f5', fontSize: 20, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Portfolio</h2>
        <NewCompanyButton fundId={id} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {companies.map(co => {
          const color = SC[co.sector] || '#8888aa'
          return (
            <Link key={co.id} href={'/company/' + co.id} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 10, padding: 20, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1c1c26', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color, flexShrink: 0 }}>
                    {co.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{co.name}</div>
                    <span style={{ fontSize: 11, color, background: color + '22', padding: '2px 8px', borderRadius: 10 }}>{co.sector}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[['Invested', fmt(Number(co.total_invested))], ['Mark', fmt(Number(co.current_mark))], ['MOIC', Number(co.moic).toFixed(2) + 'x']].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ color: '#8888aa', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
