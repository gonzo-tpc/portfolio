import Link from 'next/link'
import { funds, companies, fundMetrics } from '@/lib/seed-data'
import { notFound } from 'next/navigation'
function fmt(n: number) { return n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M' : '$' + n.toLocaleString() }
const SC: Record<string,string> = { 'Artificial Intelligence':'#818cf8','Biotech':'#34d399','Clean Tech':'#fbbf24','Cybersecurity':'#f87171','E-Commerce':'#60a5fa' }
export default async function FundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fund = funds.find(f => f.id === id)
  if (!fund) notFound()
  const m = fundMetrics[fund.id]
  const cos = companies.filter(c => c.fund_id === fund.id)
  return (
    <div>
      <Link href="/" style={{ color: '#8888aa', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Back to Funds</Link>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{fund.name}</h1>
        <p style={{ color: '#8888aa' }}>{fund.description}</p>
      </div>
      <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 28, marginBottom: 32, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 24 }}>
        {[['Total Invested', fmt(m.total_invested)], ['Current Value', fmt(m.current_value)], ['MOIC', m.moic.toFixed(2)+'x'], ['TVPI', m.tvpi.toFixed(2)+'x'], ['Gross IRR', (m.gross_irr*100).toFixed(1)+'%'], ['Net IRR', (m.net_irr*100).toFixed(1)+'%']].map(([label, value]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
            <div style={{ color: '#22c55e', fontSize: 24, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Portfolio Companies</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {cos.map(co => {
          const color = SC[co.sector] || '#8888aa'
          return (
            <Link key={co.id} href={'/company/' + co.id} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20 }} className="hover:border-green-500 transition-colors cursor-pointer">
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#1c1c26', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color, marginBottom: 12 }}>{co.name.charAt(0)}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#f0f0f5' }}>{co.name}</h3>
                <span style={{ fontSize: 11, color, background: color+'22', padding: '2px 8px', borderRadius: 10 }}>{co.sector}</span>
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['MOIC', co.moic.toFixed(2)+'x', co.moic>=1], ['IRR', (co.irr*100).toFixed(1)+'%', co.irr>=0], ['Invested', fmt(co.total_invested), true], ['Mark', fmt(co.current_mark), true]].map(([label, value, pos]) => (
                    <div key={String(label)}>
                      <div style={{ color: '#8888aa', fontSize: 11, marginBottom: 2 }}>{label}</div>
                      <div style={{ color: label==='MOIC'||label==='IRR' ? (pos ? '#22c55e' : '#f87171') : '#f0f0f5', fontWeight: 600, fontSize: 15 }}>{value}</div>
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
