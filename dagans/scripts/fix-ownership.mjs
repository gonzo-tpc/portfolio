import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
    .map(([k, ...v]) => [k, v.join('=')])
)
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Target ownership: 4 core (>10%), 1 non-core
// Ironveil: ~11.3% already core ✅
// Gridstone: bump Series A to lower entry valuation → 13.7% core
// Luminos: bump Seed shares → 16.1% core
// Stratum: lower entry valuation → 15% core
// Solara: keep as is → 7.5% non-core

const updates = [
  // Gridstone Energy: Series A at $25M post-money (was $60M), PPS=$25, 120,000 shares
  {
    inv: 'inv-ge1',
    company: 'gridstone-energy',
    fields: { civ_shares: 120000, pps: 25, post_money_valuation: 25000000, civ_ownership_pct: 12.00 }
  },
  // Luminos AI: Seed at $4M post-money (was $15M), PPS=$4, 125,000 shares
  {
    inv: 'inv-la1',
    company: 'luminos-ai',
    fields: { civ_shares: 125000, pps: 4, post_money_valuation: 4000000, civ_ownership_pct: 12.50 }
  },
  // Stratum Infrastructure: Series A at $20M post-money (was $80M), PPS=$16, 187,500 shares
  {
    inv: 'inv-si1',
    company: 'stratum-infra',
    fields: { civ_shares: 187500, pps: 16, post_money_valuation: 20000000, civ_ownership_pct: 15.00 }
  },
]

async function run() {
  // Update investments
  for (const u of updates) {
    const { error } = await supabase.from('investments').update(u.fields).eq('id', u.inv)
    if (error) { console.error(`${u.inv}:`, error); continue }
    console.log(`✅ Updated ${u.inv}`)
  }

  // Recompute marks and ownership for affected companies
  const affected = ['gridstone-energy', 'luminos-ai', 'stratum-infra']
  for (const companyId of affected) {
    const { data: allInv } = await supabase.from('investments').select('*').eq('company_id', companyId).order('date')
    if (!allInv?.length) continue

    const latestPPS = Math.max(...allInv.map(i => Number(i.pps)))
    const latestInv = allInv[allInv.length - 1]

    for (const inv of allInv) {
      const mark = Number(inv.civ_shares) * latestPPS
      const unrealized = mark - Number(inv.civ_amount)
      const moic = Number(inv.civ_amount) > 0 ? mark / Number(inv.civ_amount) : 0
      await supabase.from('investments').update({ current_mark: mark, unrealized_gain: unrealized, moic }).eq('id', inv.id)
    }

    const { data: co } = await supabase.from('companies').select('total_invested').eq('id', companyId).single()
    const totalMark = allInv.reduce((s, i) => s + Number(i.civ_shares) * latestPPS, 0)
    const moic = Number(co.total_invested) > 0 ? totalMark / Number(co.total_invested) : 0
    const entry_valuation = Number(allInv[0].post_money_valuation)
    const current_valuation = Number(latestInv.post_money_valuation)

    await supabase.from('companies').update({
      current_mark: totalMark,
      moic,
      entry_valuation,
      current_valuation,
    }).eq('id', companyId)

    const ownership = (totalMark / current_valuation * 100).toFixed(1)
    console.log(`✅ ${companyId}: mark=$${(totalMark/1e6).toFixed(2)}M, moic=${moic.toFixed(2)}x, ownership=${ownership}%`)
  }

  // Print all ownerships
  console.log('\n📊 Final ownership:')
  const { data: companies } = await supabase.from('companies').select('id, name, current_mark, current_valuation')
  for (const co of companies || []) {
    const pct = (Number(co.current_mark) / Number(co.current_valuation) * 100).toFixed(1)
    const core = Number(pct) > 10 ? '✅ CORE' : '  non-core'
    console.log(`  ${core} ${co.name}: ${pct}%`)
  }
}

run().catch(console.error)
