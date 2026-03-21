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

const FUND_ID = 'fund-1'

const companies = [
  {
    id: 'ironveil-robotics',
    fund_id: FUND_ID,
    name: 'Ironveil Robotics',
    sector: 'Industrial Automation',
    description: 'Autonomous robotic systems for precision manufacturing and warehouse logistics.',
    status: 'active',
    total_invested: 4750000,
    current_mark: 17100000,
    entry_valuation: 12000000,
    current_valuation: 140000000,
    initial_investment_date: '2021-06-01',
    latest_investment_date: '2024-02-28',
    moic: 3.60,
    irr: 0.58,
  },
  {
    id: 'gridstone-energy',
    fund_id: FUND_ID,
    name: 'Gridstone Energy',
    sector: 'Energy Transition',
    description: 'Grid-scale battery storage and energy management software for utilities and industrials.',
    status: 'active',
    total_invested: 5500000,
    current_mark: 9900000,
    entry_valuation: 60000000,
    current_valuation: 150000000,
    initial_investment_date: '2022-03-15',
    latest_investment_date: '2023-09-20',
    moic: 1.80,
    irr: 0.31,
  },
  {
    id: 'luminos-ai',
    fund_id: FUND_ID,
    name: 'Luminos AI',
    sector: 'Applied AI',
    description: 'AI platform for predictive maintenance and process optimization in heavy industry.',
    status: 'active',
    total_invested: 3000000,
    current_mark: 13500000,
    entry_valuation: 15000000,
    current_valuation: 70000000,
    initial_investment_date: '2022-08-22',
    latest_investment_date: '2023-12-05',
    moic: 4.50,
    irr: 0.72,
  },
  {
    id: 'stratum-infra',
    fund_id: FUND_ID,
    name: 'Stratum Infrastructure',
    sector: 'Digital Infrastructure',
    description: 'Distributed edge compute and connectivity infrastructure for industrial IoT deployments.',
    status: 'active',
    total_invested: 3000000,
    current_mark: 5400000,
    entry_valuation: 80000000,
    current_valuation: 144000000,
    initial_investment_date: '2023-04-10',
    latest_investment_date: '2023-04-10',
    moic: 1.80,
    irr: 0.35,
  },
  {
    id: 'solara-power',
    fund_id: FUND_ID,
    name: 'Solara Power',
    sector: 'Energy Transition',
    description: 'Next-generation solar inverter technology enabling high-density, low-cost renewable deployment.',
    status: 'active',
    total_invested: 1500000,
    current_mark: 2250000,
    entry_valuation: 20000000,
    current_valuation: 30000000,
    initial_investment_date: '2023-07-14',
    latest_investment_date: '2023-07-14',
    moic: 1.50,
    irr: 0.28,
  },
]

const investments = [
  // Ironveil Robotics — 3 rounds
  {
    id: 'inv-ir1', company_id: 'ironveil-robotics', round_name: 'Seed', date: '2021-06-01',
    security_type: 'SAFE', round_size: 4000000, civ_amount: 750000,
    post_money_valuation: 12000000, civ_ownership_pct: 6.25, civ_shares: 62500, pps: 12.00,
    current_mark: 5400000, realized_gain: 0, unrealized_gain: 4650000, moic: 7.20, irr: 0.89,
  },
  {
    id: 'inv-ir2', company_id: 'ironveil-robotics', round_name: 'Series A', date: '2022-11-15',
    security_type: 'Preferred', round_size: 18000000, civ_amount: 2000000,
    post_money_valuation: 55000000, civ_ownership_pct: 3.64, civ_shares: 36400, pps: 55.00,
    current_mark: 7280000, realized_gain: 0, unrealized_gain: 5280000, moic: 3.64, irr: 0.61,
  },
  {
    id: 'inv-ir3', company_id: 'ironveil-robotics', round_name: 'Series B', date: '2024-02-28',
    security_type: 'Preferred', round_size: 45000000, civ_amount: 2000000,
    post_money_valuation: 140000000, civ_ownership_pct: 1.43, civ_shares: 14300, pps: 140.00,
    current_mark: 4420000, realized_gain: 0, unrealized_gain: 2420000, moic: 2.21, irr: 0.38,
  },
  // Gridstone Energy — 2 rounds
  {
    id: 'inv-ge1', company_id: 'gridstone-energy', round_name: 'Series A', date: '2022-03-15',
    security_type: 'Preferred', round_size: 25000000, civ_amount: 3000000,
    post_money_valuation: 60000000, civ_ownership_pct: 5.00, civ_shares: 30000, pps: 100.00,
    current_mark: 4500000, realized_gain: 0, unrealized_gain: 1500000, moic: 1.50, irr: 0.20,
  },
  {
    id: 'inv-ge2', company_id: 'gridstone-energy', round_name: 'Series B', date: '2023-09-20',
    security_type: 'Preferred', round_size: 60000000, civ_amount: 2500000,
    post_money_valuation: 150000000, civ_ownership_pct: 1.67, civ_shares: 16700, pps: 150.00,
    current_mark: 5400000, realized_gain: 0, unrealized_gain: 2900000, moic: 2.16, irr: 0.42,
  },
  // Luminos AI — 2 rounds
  {
    id: 'inv-la1', company_id: 'luminos-ai', round_name: 'Seed', date: '2022-08-22',
    security_type: 'SAFE', round_size: 3000000, civ_amount: 500000,
    post_money_valuation: 15000000, civ_ownership_pct: 3.33, civ_shares: 33300, pps: 15.00,
    current_mark: 4000000, realized_gain: 0, unrealized_gain: 3500000, moic: 8.00, irr: 1.12,
  },
  {
    id: 'inv-la2', company_id: 'luminos-ai', round_name: 'Series A', date: '2023-12-05',
    security_type: 'Preferred', round_size: 20000000, civ_amount: 2500000,
    post_money_valuation: 70000000, civ_ownership_pct: 3.57, civ_shares: 35700, pps: 70.00,
    current_mark: 9500000, realized_gain: 0, unrealized_gain: 7000000, moic: 3.80, irr: 0.68,
  },
  // Stratum Infrastructure — 1 round
  {
    id: 'inv-si1', company_id: 'stratum-infra', round_name: 'Series A', date: '2023-04-10',
    security_type: 'Preferred', round_size: 35000000, civ_amount: 3000000,
    post_money_valuation: 80000000, civ_ownership_pct: 3.75, civ_shares: 37500, pps: 80.00,
    current_mark: 5400000, realized_gain: 0, unrealized_gain: 2400000, moic: 1.80, irr: 0.35,
  },
  // Solara Power — 1 round
  {
    id: 'inv-sp1', company_id: 'solara-power', round_name: 'Seed', date: '2023-07-14',
    security_type: 'SAFE', round_size: 5000000, civ_amount: 1500000,
    post_money_valuation: 20000000, civ_ownership_pct: 7.50, civ_shares: 75000, pps: 20.00,
    current_mark: 2250000, realized_gain: 0, unrealized_gain: 750000, moic: 1.50, irr: 0.28,
  },
]

const coInvestors = [
  { id: 'ci-ir1a', investment_id: 'inv-ir1', name: 'Lux Capital', amount: 1500000, ownership_pct: 12.50 },
  { id: 'ci-ir1b', investment_id: 'inv-ir1', name: 'Founders Fund', amount: 1000000, ownership_pct: 8.33 },
  { id: 'ci-ir2a', investment_id: 'inv-ir2', name: 'Andreessen Horowitz', amount: 8000000, ownership_pct: 14.55 },
  { id: 'ci-ir2b', investment_id: 'inv-ir2', name: 'Khosla Ventures', amount: 5000000, ownership_pct: 9.09 },
  { id: 'ci-ir3a', investment_id: 'inv-ir3', name: 'Tiger Global', amount: 20000000, ownership_pct: 14.29 },
  { id: 'ci-ir3b', investment_id: 'inv-ir3', name: 'General Catalyst', amount: 15000000, ownership_pct: 10.71 },
  { id: 'ci-ge1a', investment_id: 'inv-ge1', name: 'Breakthrough Energy', amount: 10000000, ownership_pct: 16.67 },
  { id: 'ci-ge1b', investment_id: 'inv-ge1', name: 'Energy Impact Partners', amount: 8000000, ownership_pct: 13.33 },
  { id: 'ci-ge2a', investment_id: 'inv-ge2', name: 'Prelude Ventures', amount: 25000000, ownership_pct: 16.67 },
  { id: 'ci-ge2b', investment_id: 'inv-ge2', name: 'Temasek', amount: 20000000, ownership_pct: 13.33 },
  { id: 'ci-la1a', investment_id: 'inv-la1', name: 'Y Combinator', amount: 500000, ownership_pct: 3.33 },
  { id: 'ci-la1b', investment_id: 'inv-la1', name: 'Pear VC', amount: 1000000, ownership_pct: 6.67 },
  { id: 'ci-la2a', investment_id: 'inv-la2', name: 'Sequoia Capital', amount: 10000000, ownership_pct: 14.29 },
  { id: 'ci-la2b', investment_id: 'inv-la2', name: 'Coatue', amount: 5000000, ownership_pct: 7.14 },
  { id: 'ci-si1a', investment_id: 'inv-si1', name: 'Bessemer Venture Partners', amount: 15000000, ownership_pct: 18.75 },
  { id: 'ci-si1b', investment_id: 'inv-si1', name: 'Insight Partners', amount: 12000000, ownership_pct: 15.00 },
  { id: 'ci-sp1a', investment_id: 'inv-sp1', name: 'Congruent Ventures', amount: 1500000, ownership_pct: 7.50 },
  { id: 'ci-sp1b', investment_id: 'inv-sp1', name: 'Powerhouse Ventures', amount: 1000000, ownership_pct: 5.00 },
]

async function run() {
  const oldIds = ['forge-robotics', 'voltaic-systems', 'meridian-ai', 'lattice-infra', 'helios-power']
  const oldInvIds = ['inv-fr1','inv-fr2','inv-fr3','inv-vs1','inv-vs2','inv-ma1','inv-ma2','inv-li1','inv-hp1']

  console.log('🗑  Removing old co_investors...')
  const { error: e1 } = await supabase.from('co_investors').delete().in('investment_id', oldInvIds)
  if (e1) console.error('co_investors delete:', e1)

  console.log('🗑  Removing old investments...')
  const { error: e2 } = await supabase.from('investments').delete().in('company_id', oldIds)
  if (e2) console.error('investments delete:', e2)

  console.log('🗑  Removing old companies...')
  const { error: e3 } = await supabase.from('companies').delete().in('id', oldIds)
  if (e3) console.error('companies delete:', e3)

  console.log('✅  Inserting new companies...')
  const { error: e4 } = await supabase.from('companies').insert(companies)
  if (e4) { console.error('companies insert:', e4); process.exit(1) }

  console.log('✅  Inserting new investments...')
  const { error: e5 } = await supabase.from('investments').insert(investments)
  if (e5) { console.error('investments insert:', e5); process.exit(1) }

  console.log('✅  Inserting co-investors...')
  const { error: e6 } = await supabase.from('co_investors').insert(coInvestors)
  if (e6) { console.error('co_investors insert:', e6); process.exit(1) }

  console.log('\n🎉 Done! New portfolio:')
  companies.forEach(c => console.log(`  • ${c.name} (${c.sector}) — ${c.moic}x MOIC`))
}

run().catch(console.error)
