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

// Fetch all investments grouped by company and compute correct marks
async function run() {
  const { data: companies } = await supabase.from('companies').select('id, total_invested')
  const { data: investments } = await supabase.from('investments').select('*').order('date')

  if (!companies || !investments) { console.error('Failed to fetch data'); process.exit(1) }

  const invByCompany = {}
  for (const inv of investments) {
    if (!invByCompany[inv.company_id]) invByCompany[inv.company_id] = []
    invByCompany[inv.company_id].push(inv)
  }

  for (const company of companies) {
    const invRows = invByCompany[company.id] || []
    if (!invRows.length) continue

    const latestPPS = Math.max(...invRows.map(r => Number(r.pps)))
    const totalShares = invRows.reduce((s, r) => s + Number(r.civ_shares), 0)
    const totalMark = latestPPS * totalShares
    const moic = Number(company.total_invested) > 0 ? totalMark / Number(company.total_invested) : 0

    // Update each investment's current_mark and unrealized_gain
    for (const inv of invRows) {
      const invMark = Number(inv.civ_shares) * latestPPS
      const unrealized = invMark - Number(inv.civ_amount)
      const invMoic = Number(inv.civ_amount) > 0 ? invMark / Number(inv.civ_amount) : 0
      const { error } = await supabase.from('investments').update({
        current_mark: invMark,
        unrealized_gain: unrealized,
        moic: parseFloat(invMoic.toFixed(4)),
      }).eq('id', inv.id)
      if (error) console.error(`investment ${inv.id}:`, error)
      else console.log(`  ✓ ${inv.company_id} / ${inv.round_name}: mark=$${(invMark/1e6).toFixed(2)}M, moic=${invMoic.toFixed(2)}x`)
    }

    // Update company mark and moic
    const { error } = await supabase.from('companies').update({
      current_mark: totalMark,
      moic: parseFloat(moic.toFixed(4)),
    }).eq('id', company.id)
    if (error) console.error(`company ${company.id}:`, error)
    else console.log(`✅ ${company.id}: mark=$${(totalMark/1e6).toFixed(2)}M, moic=${moic.toFixed(2)}x`)
  }

  console.log('\nDone!')
}

run().catch(console.error)
