const fs = require('fs');
const path = require('path');
const BASE = __dirname;

function write(filePath, content) {
  const full = path.join(BASE, filePath);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, content);
  console.log('✓ ' + filePath);
}

write('types/index.ts', `export interface Fund {
  id: string; name: string; description: string; vintage_year: number;
}
export interface Company {
  id: string; fund_id: string; name: string; logo_url?: string;
  sector: string; description: string; website?: string;
  status: 'active' | 'exited' | 'written_off';
  total_invested: number; current_mark: number;
  entry_valuation: number; current_valuation: number;
  initial_investment_date: string; latest_investment_date: string;
  moic: number; irr: number;
}
export interface CoInvestor {
  id: string; name: string; amount: number; ownership_pct: number;
}
export interface Investment {
  id: string; company_id: string; round_name: string; date: string;
  security_type: string; round_size: number; civ_amount: number;
  post_money_valuation: number; civ_ownership_pct: number;
  civ_shares: number; pps: number; current_mark: number;
  realized_gain: number; unrealized_gain: number;
  moic: number; irr: number; co_investors: CoInvestor[];
}
export interface FundMetrics {
  total_invested: number; current_value: number;
  moic: number; tvpi: number; gross_irr: number; net_irr: number;
  num_companies: number;
}
`);

write('lib/supabase.ts', `import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`);

write('lib/seed-data.ts', `import { Company, Fund, Investment, FundMetrics } from '@/types'

export const funds: Fund[] = [
  { id: 'fund-1', name: 'CIV Fund I', description: 'Early-stage venture fund focused on B2B software, AI, and deep tech.', vintage_year: 2020 }
]

export const companies: Company[] = [
  { id: 'nexus-ai', fund_id: 'fund-1', name: 'Nexus AI', sector: 'Artificial Intelligence', description: 'Enterprise AI platform for automating complex workflows.', status: 'active', total_invested: 3500000, current_mark: 11200000, entry_valuation: 18000000, current_valuation: 185000000, initial_investment_date: '2020-06-15', latest_investment_date: '2022-03-10', moic: 3.2, irr: 0.47 },
  { id: 'helix-bio', fund_id: 'fund-1', name: 'Helix Bio', sector: 'Biotech', description: 'AI-driven drug discovery platform targeting rare diseases.', status: 'active', total_invested: 2000000, current_mark: 4200000, entry_valuation: 22000000, current_valuation: 88000000, initial_investment_date: '2021-01-20', latest_investment_date: '2021-01-20', moic: 2.1, irr: 0.38 },
  { id: 'volt-energy', fund_id: 'fund-1', name: 'Volt Energy', sector: 'Clean Tech', description: 'Next-gen battery storage solutions for grid-scale deployment.', status: 'active', total_invested: 4000000, current_mark: 7200000, entry_valuation: 30000000, current_valuation: 120000000, initial_investment_date: '2020-11-05', latest_investment_date: '2022-08-22', moic: 1.8, irr: 0.29 },
  { id: 'cipher-sec', fund_id: 'fund-1', name: 'Cipher Security', sector: 'Cybersecurity', description: 'Zero-trust security infrastructure for enterprise cloud.', status: 'active', total_invested: 1500000, current_mark: 6750000, entry_valuation: 12000000, current_valuation: 210000000, initial_investment_date: '2020-04-01', latest_investment_date: '2020-04-01', moic: 4.5, irr: 0.68 },
  { id: 'bloom-co', fund_id: 'fund-1', name: 'Bloom Commerce', sector: 'E-Commerce', description: 'Social commerce platform connecting creators with shoppers.', status: 'active', total_invested: 1000000, current_mark: 800000, entry_valuation: 8000000, current_valuation: 7000000, initial_investment_date: '2021-09-14', latest_investment_date: '2021-09-14', moic: 0.8, irr: -0.12 },
]

export const investments: Record<string, Investment[]> = {
  'nexus-ai': [
    { id: 'inv-n1', company_id: 'nexus-ai', round_name: 'Seed', date: '2020-06-15', security_type: 'SAFE', round_size: 3000000, civ_amount: 500000, post_money_valuation: 18000000, civ_ownership_pct: 2.78, civ_shares: 27800, pps: 18.00, current_mark: 1600000, realized_gain: 0, unrealized_gain: 1100000, moic: 3.2, irr: 0.47, co_investors: [{ id: 'c1', name: 'Sequoia Capital', amount: 1000000, ownership_pct: 5.56 }, { id: 'c2', name: 'Y Combinator', amount: 500000, ownership_pct: 2.78 }] },
    { id: 'inv-n2', company_id: 'nexus-ai', round_name: 'Series A', date: '2021-08-22', security_type: 'Preferred', round_size: 15000000, civ_amount: 1500000, post_money_valuation: 65000000, civ_ownership_pct: 2.31, civ_shares: 23100, pps: 65.00, current_mark: 4800000, realized_gain: 0, unrealized_gain: 3300000, moic: 3.2, irr: 0.52, co_investors: [{ id: 'c3', name: 'Andreessen Horowitz', amount: 8000000, ownership_pct: 12.31 }, { id: 'c4', name: 'Founders Fund', amount: 3000000, ownership_pct: 4.62 }] },
    { id: 'inv-n3', company_id: 'nexus-ai', round_name: 'Series B', date: '2022-03-10', security_type: 'Preferred', round_size: 40000000, civ_amount: 1500000, post_money_valuation: 185000000, civ_ownership_pct: 0.81, civ_shares: 8100, pps: 185.00, current_mark: 4800000, realized_gain: 0, unrealized_gain: 3300000, moic: 3.2, irr: 0.41, co_investors: [{ id: 'c5', name: 'Tiger Global', amount: 20000000, ownership_pct: 10.81 }, { id: 'c6', name: 'General Catalyst', amount: 12000000, ownership_pct: 6.49 }] },
  ],
  'helix-bio': [
    { id: 'inv-h1', company_id: 'helix-bio', round_name: 'Series A', date: '2021-01-20', security_type: 'Preferred', round_size: 12000000, civ_amount: 2000000, post_money_valuation: 42000000, civ_ownership_pct: 4.76, civ_shares: 47600, pps: 42.00, current_mark: 4200000, realized_gain: 0, unrealized_gain: 2200000, moic: 2.1, irr: 0.38, co_investors: [{ id: 'c7', name: 'ARCH Venture Partners', amount: 5000000, ownership_pct: 11.90 }, { id: 'c8', name: 'GV', amount: 3000000, ownership_pct: 7.14 }] },
  ],
  'volt-energy': [
    { id: 'inv-v1', company_id: 'volt-energy', round_name: 'Series A', date: '2020-11-05', security_type: 'Preferred', round_size: 20000000, civ_amount: 2000000, post_money_valuation: 60000000, civ_ownership_pct: 3.33, civ_shares: 33300, pps: 60.00, current_mark: 3600000, realized_gain: 0, unrealized_gain: 1600000, moic: 1.8, irr: 0.22, co_investors: [{ id: 'c9', name: 'Breakthrough Energy', amount: 10000000, ownership_pct: 16.67 }, { id: 'c10', name: 'Kleiner Perkins', amount: 5000000, ownership_pct: 8.33 }] },
    { id: 'inv-v2', company_id: 'volt-energy', round_name: 'Series B', date: '2022-08-22', security_type: 'Preferred', round_size: 50000000, civ_amount: 2000000, post_money_valuation: 120000000, civ_ownership_pct: 1.67, civ_shares: 16700, pps: 120.00, current_mark: 3600000, realized_gain: 0, unrealized_gain: 1600000, moic: 1.8, irr: 0.35, co_investors: [{ id: 'c11', name: 'Energy Impact Partners', amount: 25000000, ownership_pct: 20.83 }, { id: 'c12', name: 'Prelude Ventures', amount: 15000000, ownership_pct: 12.50 }] },
  ],
  'cipher-sec': [
    { id: 'inv-c1', company_id: 'cipher-sec', round_name: 'Seed', date: '2020-04-01', security_type: 'SAFE', round_size: 5000000, civ_amount: 1500000, post_money_valuation: 15000000, civ_ownership_pct: 10.00, civ_shares: 100000, pps: 15.00, current_mark: 6750000, realized_gain: 0, unrealized_gain: 5250000, moic: 4.5, irr: 0.68, co_investors: [{ id: 'c13', name: 'Accel', amount: 2000000, ownership_pct: 13.33 }, { id: 'c14', name: 'First Round Capital', amount: 1000000, ownership_pct: 6.67 }] },
  ],
  'bloom-co': [
    { id: 'inv-b1', company_id: 'bloom-co', round_name: 'Seed', date: '2021-09-14', security_type: 'SAFE', round_size: 4000000, civ_amount: 1000000, post_money_valuation: 12000000, civ_ownership_pct: 8.33, civ_shares: 83300, pps: 12.00, current_mark: 800000, realized_gain: 0, unrealized_gain: -200000, moic: 0.8, irr: -0.12, co_investors: [{ id: 'c15', name: 'Initialized Capital', amount: 2000000, ownership_pct: 16.67 }, { id: 'c16', name: 'Precursor Ventures', amount: 500000, ownership_pct: 4.17 }] },
  ],
}

export const fundMetrics: Record<string, FundMetrics> = {
  'fund-1': { total_invested: 12000000, current_value: 30150000, moic: 2.51, tvpi: 2.51, gross_irr: 0.42, net_irr: 0.35, num_companies: 5 }
}
`);

write('app/globals.css', `@import "tailwindcss";
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0a0f; color: #f0f0f5; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
input:focus { outline: none; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #13131a; }
::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
`);

write('app/layout.tsx', `import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'CIV Portfolio', description: 'CIV Portfolio Management' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', background: '#0a0a0f' }}>
        <nav style={{ background: '#13131a', borderBottom: '1px solid #2a2a3a', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ background: '#22c55e', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#000', fontWeight: 800, fontSize: 16 }}>C</span>
            </div>
            <span style={{ color: '#f0f0f5', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>CIV</span>
          </a>
          <span style={{ color: '#2a2a3a' }}>|</span>
          <span style={{ color: '#8888aa', fontSize: 14 }}>Portfolio</span>
        </nav>
        <main style={{ padding: '32px', maxWidth: 1280, margin: '0 auto' }}>{children}</main>
      </body>
    </html>
  )
}
`);

write('app/page.tsx', `import Link from 'next/link'
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
`);

write('app/fund/[id]/page.tsx', `import Link from 'next/link'
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
`);

write('app/company/[id]/CompanyTabs.tsx', `'use client'
import { useState } from 'react'
import { Company, Investment } from '@/types'

function fmt(n: number) {
  if (Math.abs(n) >= 1e9) return '$' + (n/1e9).toFixed(1) + 'B'
  if (Math.abs(n) >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M'
  if (Math.abs(n) >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K'
  return '$' + n.toFixed(0)
}

const TABS = ['Investment History', 'Co-Investors', 'Cap Table', 'Sensitivity', 'Documents']
const SC = ['#818cf8','#60a5fa','#f59e0b','#f87171','#34d399','#e879f9']

export default function CompanyTabs({ company, investments }: { company: Company, investments: Investment[] }) {
  const [tab, setTab] = useState('Investment History')
  const [hoveredInv, setHoveredInv] = useState<string|null>(null)
  const [newRound, setNewRound] = useState(20000000)
  const [preMoney, setPreMoney] = useState(company.current_valuation)

  const allCIs = investments.flatMap(inv => inv.co_investors.map(ci => ({ ...ci, round: inv.round_name })))
  const uniqueCIs = allCIs.filter((ci, i, arr) => arr.findIndex(x => x.name === ci.name) === i)

  const postMoney = preMoney + newRound
  const curOwn = (company.current_mark / company.current_valuation) * 100
  const newOwn = curOwn * (preMoney / postMoney)
  const dilution = curOwn - newOwn
  const newMark = (newOwn / 100) * postMoney

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #2a2a3a', marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 14, fontWeight: 500, color: tab===t ? '#22c55e' : '#8888aa', borderBottom: tab===t ? '2px solid #22c55e' : '2px solid transparent', marginBottom: -1 }}>{t}</button>
        ))}
      </div>

      {tab === 'Investment History' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
                {['Round','Date','Security','Round Size','CIV Amount','Post-Money','Ownership','Shares','PPS','Current Mark','Unreal. Gain','MOIC','IRR'].map(h => (
                  <th key={h} style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', padding: '0 12px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <>
                  <tr key={inv.id} onMouseEnter={() => setHoveredInv(inv.id)} onMouseLeave={() => setHoveredInv(null)}
                    style={{ borderBottom: '1px solid #2a2a3a', background: hoveredInv===inv.id ? '#1c1c26' : 'transparent', cursor: 'pointer' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{inv.round_name}</td>
                    <td style={{ padding: 12, color: '#8888aa' }}>{inv.date}</td>
                    <td style={{ padding: 12, color: '#8888aa' }}>{inv.security_type}</td>
                    <td style={{ padding: 12 }}>{fmt(inv.round_size)}</td>
                    <td style={{ padding: 12, color: '#22c55e', fontWeight: 600 }}>{fmt(inv.civ_amount)}</td>
                    <td style={{ padding: 12 }}>{fmt(inv.post_money_valuation)}</td>
                    <td style={{ padding: 12 }}>{inv.civ_ownership_pct.toFixed(2)}%</td>
                    <td style={{ padding: 12 }}>{inv.civ_shares.toLocaleString()}</td>
                    <td style={{ padding: 12 }}>${inv.pps.toFixed(2)}</td>
                    <td style={{ padding: 12 }}>{fmt(inv.current_mark)}</td>
                    <td style={{ padding: 12, color: inv.unrealized_gain>=0?'#22c55e':'#f87171' }}>{fmt(inv.unrealized_gain)}</td>
                    <td style={{ padding: 12, fontWeight: 600, color: inv.moic>=1?'#22c55e':'#f87171' }}>{inv.moic.toFixed(2)}x</td>
                    <td style={{ padding: 12, color: inv.irr>=0?'#22c55e':'#f87171' }}>{(inv.irr*100).toFixed(1)}%</td>
                  </tr>
                  {hoveredInv===inv.id && (
                    <tr key={inv.id+'-ci'} style={{ background: '#16161f' }}>
                      <td colSpan={13} style={{ padding: '8px 12px 14px' }}>
                        <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 6 }}>Co-investors:</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {inv.co_investors.map(ci => (
                            <span key={ci.id} style={{ background: '#2a2a3a', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>{ci.name} · {fmt(ci.amount)} · {ci.ownership_pct.toFixed(1)}%</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Co-Investors' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
              {['Investor','Round','Amount','Ownership'].map(h => (
                <th key={h} style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', padding: '0 12px 12px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allCIs.map((ci, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1c1c26' }}>
                <td style={{ padding: 12, fontWeight: 500 }}>{ci.name}</td>
                <td style={{ padding: 12, color: '#8888aa' }}>{ci.round}</td>
                <td style={{ padding: 12 }}>{fmt(ci.amount)}</td>
                <td style={{ padding: 12 }}>{ci.ownership_pct.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'Cap Table' && (
        <div>
          <div style={{ display: 'flex', gap: 3, height: 44, borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
            {[{ name: 'CIV', pct: investments[investments.length-1]?.civ_ownership_pct||0, color: '#22c55e' }, ...uniqueCIs.slice(0,5).map((ci,i) => ({ name: ci.name, pct: ci.ownership_pct, color: SC[i] })), { name: 'Other', pct: 25, color: '#2a2a3a' }].map(item => (
              <div key={item.name} title={item.name + ' ' + item.pct.toFixed(1) + '%'} style={{ flex: item.pct, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 4 }}>
                {item.pct > 4 ? item.name : ''}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {[{ name: 'CIV', pct: investments[investments.length-1]?.civ_ownership_pct||0, color: '#22c55e' }, ...uniqueCIs.slice(0,5).map((ci,i) => ({ name: ci.name, pct: ci.ownership_pct, color: SC[i] }))].map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{item.name}</span>
                <span style={{ color: '#8888aa', fontSize: 13, marginLeft: 'auto' }}>{item.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Sensitivity' && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>New Round Dilution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div>
              <label style={{ display: 'block', color: '#8888aa', fontSize: 12, marginBottom: 6 }}>New Round Size ($)</label>
              <input type="number" value={newRound} onChange={e => setNewRound(Number(e.target.value))} style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: '#f0f0f5', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#8888aa', fontSize: 12, marginBottom: 6 }}>Pre-Money Valuation ($)</label>
              <input type="number" value={preMoney} onChange={e => setPreMoney(Number(e.target.value))} style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: '#f0f0f5', fontSize: 14 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            {[['Post-Money Val', fmt(postMoney), ''], ['Current Ownership', curOwn.toFixed(2)+'%', ''], ['New Ownership', newOwn.toFixed(2)+'%', ''], ['Dilution', '-'+dilution.toFixed(2)+'%', '#f87171']].map(([label, value, color]) => (
              <div key={String(label)} style={{ background: '#1c1c26', borderRadius: 10, padding: 16 }}>
                <div style={{ color: '#8888aa', fontSize: 11, marginBottom: 6 }}>{label}</div>
                <div style={{ color: color||'#f0f0f5', fontSize: 20, fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Exit Scenarios</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
                {['Exit Multiple','Exit Valuation','CIV Return','MOIC'].map(h => (
                  <th key={h} style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', padding: '0 12px 12px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0.5,1,2,3,5,10].map(mult => {
                const ret = newMark * mult
                const moic = ret / company.total_invested
                return (
                  <tr key={mult} style={{ borderBottom: '1px solid #1c1c26' }}>
                    <td style={{ padding: 12, color: '#8888aa' }}>{mult}x</td>
                    <td style={{ padding: 12 }}>{fmt(postMoney * mult)}</td>
                    <td style={{ padding: 12, color: ret>=company.total_invested?'#22c55e':'#f87171' }}>{fmt(ret)}</td>
                    <td style={{ padding: 12, fontWeight: 600, color: moic>=1?'#22c55e':'#f87171' }}>{moic.toFixed(2)}x</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Documents' && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8888aa' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <p style={{ marginBottom: 4, fontSize: 16 }}>No documents yet</p>
          <p style={{ fontSize: 13 }}>Forward cap tables and round docs to your inbox to add them here</p>
        </div>
      )}
    </div>
  )
}
`);

write('app/company/[id]/page.tsx', `import Link from 'next/link'
import { companies, investments as allInv } from '@/lib/seed-data'
import { notFound } from 'next/navigation'
import CompanyTabs from './CompanyTabs'
function fmt(n: number) { return Math.abs(n)>=1e6 ? '$'+(n/1e6).toFixed(1)+'M' : '$'+n.toLocaleString() }
const SC: Record<string,string> = { 'Artificial Intelligence':'#818cf8','Biotech':'#34d399','Clean Tech':'#fbbf24','Cybersecurity':'#f87171','E-Commerce':'#60a5fa' }
export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const co = companies.find(c => c.id === id)
  if (!co) notFound()
  const inv = allInv[co.id] || []
  const color = SC[co.sector] || '#8888aa'
  return (
    <div>
      <Link href={'/fund/'+co.fund_id} style={{ color: '#8888aa', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Back to Fund</Link>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: 14, background: '#1c1c26', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color, flexShrink: 0 }}>{co.name.charAt(0)}</div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>{co.name}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color, background: color+'22', padding: '3px 10px', borderRadius: 12 }}>{co.sector}</span>
            <span style={{ color: '#8888aa', fontSize: 13 }}>{co.description}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[['Total Invested', fmt(co.total_invested), ''], ['Current Mark', fmt(co.current_mark), ''], ['Entry Valuation', fmt(co.entry_valuation), ''], ['Current Valuation', fmt(co.current_valuation), ''], ['MOIC', co.moic.toFixed(2)+'x', co.moic>=1?'#22c55e':'#f87171'], ['IRR', (co.irr*100).toFixed(1)+'%', co.irr>=0?'#22c55e':'#f87171'], ['First Investment', co.initial_investment_date, ''], ['Latest Investment', co.latest_investment_date, '']].map(([label, value, clr]) => (
          <div key={String(label)} style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 10, padding: 16 }}>
            <div style={{ color: '#8888aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
            <div style={{ color: clr||'#f0f0f5', fontSize: 16, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 24 }}>
        <CompanyTabs company={co} investments={inv} />
      </div>
    </div>
  )
`);
