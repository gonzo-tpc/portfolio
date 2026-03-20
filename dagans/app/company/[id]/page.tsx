import Link from 'next/link'
import { getCompany, getInvestments } from '@/lib/db'
import { notFound } from 'next/navigation'
import CompanyTabs from './CompanyTabs'
import ErrorBoundary from './ErrorBoundary'

export const revalidate = 60

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

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [co, investments] = await Promise.all([getCompany(id), getInvestments(id)])
  if (!co) notFound()

  const totalCivShares = investments.reduce((sum, inv) => sum + Number(inv.civ_shares), 0)
  const latestInv = investments[investments.length - 1]
  const currentOwnership = latestInv
    ? ((totalCivShares / (Number(latestInv.post_money_valuation) / Number(latestInv.pps))) * 100).toFixed(2) + '%'
    : 'N/A'
  const color = SC[co.sector || ''] || '#8888aa'

  return (
    <div>
      <Link href={'/fund/' + co.fund_id} style={{ color: '#8888aa', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
        ← Back to Fund
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: 14, background: '#1c1c26', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color, flexShrink: 0 }}>
          {co.name.charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>{co.name}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color, background: color + '22', padding: '3px 10px', borderRadius: 12 }}>{co.sector}</span>
            <span style={{ color: '#8888aa', fontSize: 13 }}>{co.description}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {([
          ['Total Invested', fmt(Number(co.total_invested)), ''],
          ['Current Mark', fmt(Number(co.current_mark)), ''],
          ['Entry Valuation', fmt(Number(co.entry_valuation)), ''],
          ['Current Valuation', fmt(Number(co.current_valuation)), ''],
          ['MOIC', Number(co.moic).toFixed(2) + 'x', Number(co.moic) >= 1 ? '#22c55e' : '#f87171'],
          ['IRR', (Number(co.irr) * 100).toFixed(1) + '%', Number(co.irr) >= 0 ? '#22c55e' : '#f87171'],
          ['First Investment', co.initial_investment_date || '', ''],
          ['Latest Investment', co.latest_investment_date || '', ''],
          ['Current Ownership', currentOwnership, '#22c55e'],
        ] as [string, string, string][]).map(([label, value, clr]) => (
          <div key={label} style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 10, padding: 16 }}>
            <div style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
            <div style={{ color: clr || '#f0f0f5', fontSize: 16, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 24 }}>
        <ErrorBoundary>
          <CompanyTabs company={co} investments={investments} companyId={co.id} />
        </ErrorBoundary>
      </div>
    </div>
  )
}
