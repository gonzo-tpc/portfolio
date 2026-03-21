'use client'
import React, { useState } from 'react'
import { Company, Investment } from '@/types'

import { InvestmentBarChart, OwnershipChart } from './Charts'
import DocumentsTab from './DocumentsTab'
import TeamTab from './TeamTab'

function fmt(n: number) {
  if (Math.abs(n) >= 1e9) return '$' + (n/1e9).toFixed(1) + 'B'
  if (Math.abs(n) >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M'
  if (Math.abs(n) >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K'
  return '$' + n.toFixed(0)
}

const TABS = ['Investment History', 'Team', 'Co-Investors', 'Cap Table', 'Sensitivity', 'Documents']
const SC = ['#818cf8','#60a5fa','#f59e0b','#f87171','#34d399','#e879f9']

export default function CompanyTabs({ company, investments, companyId }: { company: Company, investments: Investment[], companyId: string, companyName?: string }) {
  const [tab, setTab] = useState('Investment History')
  const [hoveredInv, setHoveredInv] = useState<string|null>(null)
  const [newRound, setNewRound] = useState(20000000)
  const [preMoney, setPreMoney] = useState(company.current_valuation)
  const [followOn, setFollowOn] = useState(0)

  const allCIs = investments.flatMap(inv => inv.co_investors.map(ci => ({ ...ci, round: inv.round_name })))
  const uniqueCIs = allCIs.filter((ci, i, arr) => arr.findIndex(x => x.name === ci.name) === i)

  const postMoney = preMoney + newRound
  const curOwn = (company.current_mark / company.current_valuation) * 100
  // If you pass: diluted ownership
  const dilutedOwn = curOwn * (preMoney / postMoney)
  const dilution = curOwn - dilutedOwn
  // Pro-rata = invest enough to maintain current ownership
  const proRata = curOwn / 100 * newRound
  // If you invest followOn: ownership from new investment + diluted existing
  const followOnOwn = followOn > 0 ? (followOn / postMoney) * 100 : 0
  const totalOwnAfterFollowOn = dilutedOwn + followOnOwn
  // Mark after follow-on = diluted existing mark + new investment
  const markAfterFollowOn = (dilutedOwn / 100) * postMoney + followOn
  // Cost per 1% from follow-on
  const costPer1Pct = followOnOwn > 0 ? followOn / followOnOwn : 0

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #2a2a3a', marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', fontSize: 14, fontWeight: 500, color: tab===t ? '#22c55e' : '#8888aa', borderBottom: tab===t ? '2px solid #22c55e' : '2px solid transparent', marginBottom: -1 }}>{t}</button>
        ))}
      </div>

      {tab === 'Investment History' && (
  <div>
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
              {investments.map(investment => (
                <React.Fragment key={investment.id}>
                  <tr onMouseEnter={() => setHoveredInv(investment.id)} onMouseLeave={() => setHoveredInv(null)}
                    style={{ borderBottom: '1px solid #2a2a3a', background: hoveredInv===investment.id ? '#1c1c26' : 'transparent', cursor: 'pointer' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{investment.round_name}</td>
                    <td style={{ padding: 12, color: '#8888aa' }}>{investment.date}</td>
                    <td style={{ padding: 12, color: '#8888aa' }}>{investment.security_type}</td>
                    <td style={{ padding: 12 }}>{fmt(investment.round_size)}</td>
                    <td style={{ padding: 12, color: '#22c55e', fontWeight: 600 }}>{fmt(investment.civ_amount)}</td>
                    <td style={{ padding: 12 }}>{fmt(investment.post_money_valuation)}</td>
                    <td style={{ padding: 12 }}>{investment.civ_ownership_pct.toFixed(2)}%</td>
                    <td style={{ padding: 12 }}>{investment.civ_shares.toLocaleString()}</td>
                    <td style={{ padding: 12 }}>${investment.pps.toFixed(2)}</td>
                    <td style={{ padding: 12 }}>{fmt(investment.current_mark)}</td>
                    <td style={{ padding: 12, color: investment.unrealized_gain>=0?'#22c55e':'#f87171' }}>{fmt(investment.unrealized_gain)}</td>
                    <td style={{ padding: 12, fontWeight: 600, color: investment.moic>=1?'#22c55e':'#f87171' }}>{investment.moic.toFixed(2)}x</td>
                    <td style={{ padding: 12, color: investment.irr>=0?'#22c55e':'#f87171' }}>{(investment.irr*100).toFixed(1)}%</td>
                  </tr>
                  {hoveredInv===investment.id && (
                    <tr style={{ background: '#16161f' }}>
                      <td colSpan={13} style={{ padding: '8px 12px 14px' }}>
                        <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 6 }}>Co-investors:</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {investment.co_investors.map(ci => (
                            <span key={ci.id} style={{ background: '#2a2a3a', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>{ci.name} · {fmt(ci.amount)} · {ci.ownership_pct.toFixed(1)}%</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32, paddingTop: 24, borderTop: '1px solid #2a2a3a' }}>
          <InvestmentBarChart investments={investments} />
          <OwnershipChart investments={investments} />
        </div>


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
            {[
              { name: 'CIV', pct: investments[investments.length-1]?.civ_ownership_pct||0, color: '#22c55e' },
              ...uniqueCIs.slice(0,5).map((ci,i) => ({ name: ci.name, pct: ci.ownership_pct, color: SC[i] })),
              { name: 'Other', pct: 25, color: '#2a2a3a' }
            ].map(item => (
              <div key={item.name} title={item.name + ' ' + item.pct.toFixed(1) + '%'} style={{ flex: item.pct, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 4 }}>
                {item.pct > 4 ? item.name : ''}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {[
              { name: 'CIV', pct: investments[investments.length-1]?.civ_ownership_pct||0, color: '#22c55e' },
              ...uniqueCIs.slice(0,5).map((ci,i) => ({ name: ci.name, pct: ci.ownership_pct, color: SC[i] }))
            ].map(item => (
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
          {/* Step 1: New Round */}
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#f0f0f5' }}>New Round</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', color: '#8888aa', fontSize: 12, marginBottom: 6 }}>Pre-Money Valuation ($)</label>
              <input type="number" value={preMoney} onChange={e => setPreMoney(Number(e.target.value))} style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: '#f0f0f5', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#8888aa', fontSize: 12, marginBottom: 6 }}>Round Size ($)</label>
              <input type="number" value={newRound} onChange={e => setNewRound(Number(e.target.value))} style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: '#f0f0f5', fontSize: 14 }} />
            </div>
          </div>

          {/* If you pass */}
          <div style={{ background: '#1c1c26', borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <div style={{ color: '#8888aa', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>If you pass</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Post-Money', value: fmt(postMoney) },
                { label: 'Your Ownership', value: dilutedOwn.toFixed(2) + '%' },
                { label: 'Dilution', value: '−' + dilution.toFixed(2) + '%', red: true },
                { label: 'Your Mark', value: fmt((dilutedOwn / 100) * postMoney) },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ color: '#8888aa', fontSize: 11, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: item.red ? '#f87171' : '#f0f0f5', fontSize: 18, fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Follow-on */}
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: '#f0f0f5' }}>Model Your Follow-On</h3>
          <div style={{ color: '#8888aa', fontSize: 12, marginBottom: 14 }}>Pro-rata to maintain ownership: <span style={{ color: '#22c55e', fontWeight: 600 }}>{fmt(proRata)}</span></div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#8888aa', fontSize: 12, marginBottom: 6 }}>Your Follow-On Amount ($)</label>
            <input type="number" value={followOn} onChange={e => setFollowOn(Number(e.target.value))} placeholder="0" style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: '#f0f0f5', fontSize: 14 }} />
          </div>

          {followOn > 0 && (
            <div style={{ background: '#16261a', border: '1px solid #22c55e33', borderRadius: 10, padding: 16 }}>
              <div style={{ color: '#22c55e', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>If you invest {fmt(followOn)}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'New Ownership', value: totalOwnAfterFollowOn.toFixed(2) + '%' },
                  { label: 'Ownership Δ', value: (totalOwnAfterFollowOn > curOwn ? '+' : '') + (totalOwnAfterFollowOn - curOwn).toFixed(2) + '%' },
                  { label: 'Your Mark', value: fmt(markAfterFollowOn) },
                  { label: 'Cost per 1%', value: fmt(costPer1Pct) },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ color: '#8888aa', fontSize: 11, marginBottom: 4 }}>{item.label}</div>
                    <div className="metric-positive" style={{ fontSize: 18, fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'Team' && (
        <TeamTab companyId={companyId} />
      )}

      {tab === 'Documents' && (
        <DocumentsTab companyId={companyId} companyName={company.name} />
      )}
    </div>
  )
}
