import { Company, Fund, Investment, FundMetrics } from '@/types'

export const funds: Fund[] = [
  { id: 'fund-1', name: 'CIV Fund I', description: 'Early-stage venture fund focused on B2B software, AI, and deep tech.', vintage_year: 2020 }
]

export const companies: Company[] = [
  { id: 'nexus-ai', fund_id: 'fund-1', name: 'Nexus AI', sector: 'Artificial Intelligence', description: 'Enterprise AI platform for automating complex workflows.', status: 'active', total_invested: 3500000, current_mark: 9500000, entry_valuation: 18000000, current_valuation: 185000000, initial_investment_date: '2020-06-15', latest_investment_date: '2022-03-10', moic: 2.71, irr: 0.47 },
  { id: 'helix-bio', fund_id: 'fund-1', name: 'Helix Bio', sector: 'Biotech', description: 'AI-driven drug discovery platform targeting rare diseases.', status: 'active', total_invested: 2000000, current_mark: 4200000, entry_valuation: 22000000, current_valuation: 88000000, initial_investment_date: '2021-01-20', latest_investment_date: '2021-01-20', moic: 2.1, irr: 0.38 },
  { id: 'volt-energy', fund_id: 'fund-1', name: 'Volt Energy', sector: 'Clean Tech', description: 'Next-gen battery storage solutions for grid-scale deployment.', status: 'active', total_invested: 4000000, current_mark: 7200000, entry_valuation: 30000000, current_valuation: 120000000, initial_investment_date: '2020-11-05', latest_investment_date: '2022-08-22', moic: 1.8, irr: 0.29 },
  { id: 'cipher-sec', fund_id: 'fund-1', name: 'Cipher Security', sector: 'Cybersecurity', description: 'Zero-trust security infrastructure for enterprise cloud.', status: 'active', total_invested: 1500000, current_mark: 6750000, entry_valuation: 12000000, current_valuation: 210000000, initial_investment_date: '2020-04-01', latest_investment_date: '2020-04-01', moic: 4.5, irr: 0.68 },
  { id: 'bloom-co', fund_id: 'fund-1', name: 'Bloom Commerce', sector: 'E-Commerce', description: 'Social commerce platform connecting creators with shoppers.', status: 'active', total_invested: 1000000, current_mark: 800000, entry_valuation: 8000000, current_valuation: 7000000, initial_investment_date: '2021-09-14', latest_investment_date: '2021-09-14', moic: 0.8, irr: -0.12 },
]

export const investments: Record<string, Investment[]> = {
  'nexus-ai': [
    {
      id: 'inv-n1', company_id: 'nexus-ai', round_name: 'Seed', date: '2020-06-15',
      security_type: 'SAFE', round_size: 3000000, civ_amount: 500000,
      post_money_valuation: 18000000, civ_ownership_pct: 2.78, civ_shares: 27800,
      pps: 18.00, current_mark: 4250000, realized_gain: 0, unrealized_gain: 3750000,
      moic: 8.5, irr: 0.89,
      co_investors: [
        { id: 'c1', name: 'Sequoia Capital', amount: 1000000, ownership_pct: 5.56 },
        { id: 'c2', name: 'Y Combinator', amount: 500000, ownership_pct: 2.78 }
      ]
    },
    {
      id: 'inv-n2', company_id: 'nexus-ai', round_name: 'Series A', date: '2021-08-22',
      security_type: 'Preferred', round_size: 15000000, civ_amount: 1500000,
      post_money_valuation: 65000000, civ_ownership_pct: 2.31, civ_shares: 23100,
      pps: 65.00, current_mark: 3750000, realized_gain: 0, unrealized_gain: 2250000,
      moic: 2.5, irr: 0.44,
      co_investors: [
        { id: 'c3', name: 'Andreessen Horowitz', amount: 8000000, ownership_pct: 12.31 },
        { id: 'c4', name: 'Founders Fund', amount: 3000000, ownership_pct: 4.62 }
      ]
    },
    {
      id: 'inv-n3', company_id: 'nexus-ai', round_name: 'Series B', date: '2022-03-10',
      security_type: 'Preferred', round_size: 40000000, civ_amount: 1500000,
      post_money_valuation: 185000000, civ_ownership_pct: 0.81, civ_shares: 8100,
      pps: 185.00, current_mark: 1500000, realized_gain: 0, unrealized_gain: 0,
      moic: 1.0, irr: 0.02,
      co_investors: [
        { id: 'c5', name: 'Tiger Global', amount: 20000000, ownership_pct: 10.81 },
        { id: 'c6', name: 'General Catalyst', amount: 12000000, ownership_pct: 6.49 }
      ]
    },
  ],
  'helix-bio': [
    {
      id: 'inv-h1', company_id: 'helix-bio', round_name: 'Series A', date: '2021-01-20',
      security_type: 'Preferred', round_size: 12000000, civ_amount: 2000000,
      post_money_valuation: 42000000, civ_ownership_pct: 4.76, civ_shares: 47600,
      pps: 42.00, current_mark: 4200000, realized_gain: 0, unrealized_gain: 2200000,
      moic: 2.1, irr: 0.38,
      co_investors: [
        { id: 'c7', name: 'ARCH Venture Partners', amount: 5000000, ownership_pct: 11.90 },
        { id: 'c8', name: 'GV', amount: 3000000, ownership_pct: 7.14 }
      ]
    },
  ],
  'volt-energy': [
    {
      id: 'inv-v1', company_id: 'volt-energy', round_name: 'Series A', date: '2020-11-05',
      security_type: 'Preferred', round_size: 20000000, civ_amount: 2000000,
      post_money_valuation: 60000000, civ_ownership_pct: 3.33, civ_shares: 33300,
      pps: 60.00, current_mark: 3600000, realized_gain: 0, unrealized_gain: 1600000,
      moic: 1.8, irr: 0.22,
      co_investors: [
        { id: 'c9', name: 'Breakthrough Energy', amount: 10000000, ownership_pct: 16.67 },
        { id: 'c10', name: 'Kleiner Perkins', amount: 5000000, ownership_pct: 8.33 }
      ]
    },
    {
      id: 'inv-v2', company_id: 'volt-energy', round_name: 'Series B', date: '2022-08-22',
      security_type: 'Preferred', round_size: 50000000, civ_amount: 2000000,
      post_money_valuation: 120000000, civ_ownership_pct: 1.67, civ_shares: 16700,
      pps: 120.00, current_mark: 2200000, realized_gain: 0, unrealized_gain: 200000,
      moic: 1.1, irr: 0.08,
      co_investors: [
        { id: 'c11', name: 'Energy Impact Partners', amount: 25000000, ownership_pct: 20.83 },
        { id: 'c12', name: 'Prelude Ventures', amount: 15000000, ownership_pct: 12.50 }
      ]
    },
  ],
  'cipher-sec': [
    {
      id: 'inv-c1', company_id: 'cipher-sec', round_name: 'Seed', date: '2020-04-01',
      security_type: 'SAFE', round_size: 5000000, civ_amount: 1500000,
      post_money_valuation: 15000000, civ_ownership_pct: 10.00, civ_shares: 100000,
      pps: 15.00, current_mark: 6750000, realized_gain: 0, unrealized_gain: 5250000,
      moic: 4.5, irr: 0.68,
      co_investors: [
        { id: 'c13', name: 'Accel', amount: 2000000, ownership_pct: 13.33 },
        { id: 'c14', name: 'First Round Capital', amount: 1000000, ownership_pct: 6.67 }
      ]
    },
  ],
  'bloom-co': [
    {
      id: 'inv-b1', company_id: 'bloom-co', round_name: 'Seed', date: '2021-09-14',
      security_type: 'SAFE', round_size: 4000000, civ_amount: 1000000,
      post_money_valuation: 12000000, civ_ownership_pct: 8.33, civ_shares: 83300,
      pps: 12.00, current_mark: 800000, realized_gain: 0, unrealized_gain: -200000,
      moic: 0.8, irr: -0.12,
      co_investors: [
        { id: 'c15', name: 'Initialized Capital', amount: 2000000, ownership_pct: 16.67 },
        { id: 'c16', name: 'Precursor Ventures', amount: 500000, ownership_pct: 4.17 }
      ]
    },
  ],
}

export const fundMetrics: Record<string, FundMetrics> = {
  'fund-1': {
    total_invested: 12000000,
    current_value: 29500000,
    moic: 2.46,
    tvpi: 2.46,
    gross_irr: 0.42,
    net_irr: 0.35,
    num_companies: 5
  }
}
