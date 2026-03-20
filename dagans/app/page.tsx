import Link from 'next/link'
import { funds, fundMetrics } from '@/lib/seed-data'
function fmt(n: number) { return n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M' : '$' + n.toLocaleString() }
export default function Home() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Funds</h1>
      <p style={{ color: '#8888aa', marginBottom: 32 }}>Select a fund to view portfolio details</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
        {funds.map(fund => {
          const m = fundMetrics[fund.id]
          return (
            <Link key={fund.id} href={'/fund/' + fund.id} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 28 }}
                className="hover:border-green-500 transition-colors cursor-pointer">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f5' }}>{fund.name}</h2>
                    <p style={{ color: '#8888aa', fontSize: 14, marginTop: 4 }}>Vintage {fund.vintage_year}</p>
                  </div>
                  <span style={{ background: '#16a34a22', color: '#22c55e', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                  {[['Total Invested', fmt(m.total_invested)], ['Current Value', fmt(m.current_value)], ['MOIC', m.moic.toFixed(2) + 'x'], ['TVPI', m.tvpi.toFixed(2) + 'x'], ['Gross IRR', (m.gross_irr*100).toFixed(1) + '%'], ['Net IRR', (m.net_irr*100).toFixed(1) + '%']].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                      <div style={{ color: '#f0f0f5', fontSize: 18, fontWeight: 600 }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #2a2a3a', color: '#8888aa', fontSize: 13 }}>{m.num_companies} portfolio companies</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
