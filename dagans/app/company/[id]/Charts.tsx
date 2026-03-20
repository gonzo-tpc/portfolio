'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, Cell } from 'recharts'
import { Investment } from '@/types'

function fmt(n: number) {
  if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M'
  if (n >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K'
  return '$' + n.toFixed(0)
}

export function InvestmentBarChart({ investments }: { investments: Investment[] }) {
  const data = investments.map(inv => ({
    name: inv.round_name,
    'Invested': inv.civ_amount,
    'Current Mark': inv.current_mark,
  }))

  return (
    <div>
      <h4 style={{ color: '#8888aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Invested vs Current Mark by Round</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8 }}
            labelStyle={{ color: '#f0f0f5', marginBottom: 4 }}
            formatter={(value: number) => fmt(value)}
          />
          <Legend wrapperStyle={{ color: '#8888aa', fontSize: 12 }} />
          <Bar dataKey="Invested" fill="#3b82f6" radius={[4,4,0,0]} />
          <Bar dataKey="Current Mark" fill="#22c55e" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function OwnershipChart({ investments }: { investments: Investment[] }) {
  let runningShares = 0
  const data = investments.map(inv => {
    runningShares += inv.civ_shares
    const totalShares = inv.post_money_valuation / inv.pps
    const cumulative = parseFloat(((runningShares / totalShares) * 100).toFixed(2))
    return {
      name: inv.round_name,
      'This Round': parseFloat(inv.civ_ownership_pct.toFixed(2)),
      'Cumulative': cumulative,
    }
  })

  return (
    <div>
      <h4 style={{ color: '#8888aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>CIV Ownership % Over Rounds</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => v.toFixed(1) + '%'} tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8 }}
            labelStyle={{ color: '#f0f0f5', marginBottom: 4 }}
            formatter={(value: number) => value.toFixed(2) + '%'}
          />
          <Legend wrapperStyle={{ color: '#8888aa', fontSize: 12 }} />
          <Line type="monotone" dataKey="This Round" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Cumulative" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} strokeDasharray="5 5" activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MoicChart({ investments }: { investments: Investment[] }) {
  const data = investments.map(inv => ({
    name: inv.round_name,
    moic: inv.moic,
  }))

  return (
    <div>
      <h4 style={{ color: '#8888aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>MOIC by Round</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => v.toFixed(1) + 'x'} tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
          <Tooltip
            contentStyle={{ background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8 }}
            labelStyle={{ color: '#f0f0f5', marginBottom: 4 }}
            formatter={(value: number) => value.toFixed(2) + 'x'}
          />
          <Bar dataKey="moic" radius={[4,4,0,0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.moic >= 1 ? '#22c55e' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
