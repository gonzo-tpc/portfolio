import { Company, Fund, Investment, FundMetrics } from '@/types'

export const funds: Fund[] = [
  { id: 'fund-1', name: 'CIV Fund I', description: 'Early-stage venture fund focused on energy transition, industrial automation, digital infrastructure, and applied AI.', vintage_year: 2021 }
]

export const companies: Company[] = [
  { id: 'forge-robotics', fund_id: 'fund-1', name: 'Forge Robotics', sector: 'Industrial Automation', description: 'Autonomous robotic systems for precision manufacturing and warehouse logistics.', status: 'active', total_invested: 4750000, current_mark: 17100000, entry_valuation: 12000000, current_valuation: 140000000, initial_investment_date: '2021-06-01', latest_investment_date: '2024-02-28', moic: 3.60, irr: 0.58 },
  { id: 'voltaic-systems', fund_id: 'fund-1', name: 'Voltaic Systems', sector: 'Energy Transition', description: 'Grid-scale battery storage and energy management software for utilities and industrials.', status: 'active', total_invested: 5500000, current_mark: 9900000, entry_valuation: 60000000, current_valuation: 150000000, initial_investment_date: '2022-03-15', latest_investment_date: '2023-09-20', moic: 1.80, irr: 0.31 },
  { id: 'meridian-ai', fund_id: 'fund-1', name: 'Meridian AI', sector: 'Applied AI', description: 'AI platform for predictive maintenance and process optimization in heavy industry.', status: 'active', total_invested: 3000000, current_mark: 13500000, entry_valuation: 15000000, current_valuation: 70000000, initial_investment_date: '2022-08-22', latest_investment_date: '2023-12-05', moic: 4.50, irr: 0.72 },
  { id: 'lattice-infra', fund_id: 'fund-1', name: 'Lattice Infrastructure', sector: 'Digital Infrastructure', description: 'Distributed edge compute and connectivity infrastructure for industrial IoT deployments.', status: 'active', total_invested: 3000000, current_mark: 5400000, entry_valuation: 80000000, current_valuation: 144000000, initial_investment_date: '2023-04-10', latest_investment_date: '2023-04-10', moic: 1.80, irr: 0.35 },
  { id: 'helios-power', fund_id: 'fund-1', name: 'Helios Power', sector: 'Energy Transition', description: 'Next-generation solar inverter technology enabling high-density, low-cost renewable deployment.', status: 'active', total_invested: 1500000, current_mark: 2250000, entry_valuation: 20000000, current_valuation: 30000000, initial_investment_date: '2023-07-14', latest_investment_date: '2023-07-14', moic: 1.50, irr: 0.28 },
]

export const investments: Record<string, Investment[]> = {
  'forge-robotics': [
    {
      id: 'inv-fr1', company_id: 'forge-robotics', round_name: 'Seed', date: '2021-06-01',
      security_type: 'SAFE', round_size: 4000000, civ_amount: 750000,
      post_money_valuation: 12000000, civ_ownership_pct: 6.25, civ_shares: 62500, pps: 12.00,
      current_mark: 5400000, realized_gain: 0, unrealized_gain: 4650000, moic: 7.20, irr: 0.89,
      co_investors: [
        { id: 'ci-fr1a', name: 'Lux Capital', amount: 1500000, ownership_pct: 12.50 },
        { id: 'ci-fr1b', name: 'Founders Fund', amount: 1000000, ownership_pct: 8.33 },
      ]
    },
    {
      id: 'inv-fr2', company_id: 'forge-robotics', round_name: 'Series A', date: '2022-11-15',
      security_type: 'Preferred', round_size: 18000000, civ_amount: 2000000,
      post_money_valuation: 55000000, civ_ownership_pct: 3.64, civ_shares: 36400, pps: 55.00,
      current_mark: 7280000, realized_gain: 0, unrealized_gain: 5280000, moic: 3.64, irr: 0.61,
      co_investors: [
        { id: 'ci-fr2a', name: 'Andreessen Horowitz', amount: 8000000, ownership_pct: 14.55 },
        { id: 'ci-fr2b', name: 'Khosla Ventures', amount: 5000000, ownership_pct: 9.09 },
      ]
    },
    {
      id: 'inv-fr3', company_id: 'forge-robotics', round_name: 'Series B', date: '2024-02-28',
      security_type: 'Preferred', round_size: 45000000, civ_amount: 2000000,
      post_money_valuation: 140000000, civ_ownership_pct: 1.43, civ_shares: 14300, pps: 140.00,
      current_mark: 4420000, realized_gain: 0, unrealized_gain: 2420000, moic: 2.21, irr: 0.38,
      co_investors: [
        { id: 'ci-fr3a', name: 'Tiger Global', amount: 20000000, ownership_pct: 14.29 },
        { id: 'ci-fr3b', name: 'General Catalyst', amount: 15000000, ownership_pct: 10.71 },
      ]
    },
  ],
  'voltaic-systems': [
    {
      id: 'inv-vs1', company_id: 'voltaic-systems', round_name: 'Series A', date: '2022-03-15',
      security_type: 'Preferred', round_size: 25000000, civ_amount: 3000000,
      post_money_valuation: 60000000, civ_ownership_pct: 5.00, civ_shares: 30000, pps: 100.00,
      current_mark: 4500000, realized_gain: 0, unrealized_gain: 1500000, moic: 1.50, irr: 0.20,
      co_investors: [
        { id: 'ci-vs1a', name: 'Breakthrough Energy', amount: 10000000, ownership_pct: 16.67 },
        { id: 'ci-vs1b', name: 'Energy Impact Partners', amount: 8000000, ownership_pct: 13.33 },
      ]
    },
    {
      id: 'inv-vs2', company_id: 'voltaic-systems', round_name: 'Series B', date: '2023-09-20',
      security_type: 'Preferred', round_size: 60000000, civ_amount: 2500000,
      post_money_valuation: 150000000, civ_ownership_pct: 1.67, civ_shares: 16700, pps: 150.00,
      current_mark: 5400000, realized_gain: 0, unrealized_gain: 2900000, moic: 2.16, irr: 0.42,
      co_investors: [
        { id: 'ci-vs2a', name: 'Prelude Ventures', amount: 25000000, ownership_pct: 16.67 },
        { id: 'ci-vs2b', name: 'Temasek', amount: 20000000, ownership_pct: 13.33 },
      ]
    },
  ],
  'meridian-ai': [
    {
      id: 'inv-ma1', company_id: 'meridian-ai', round_name: 'Seed', date: '2022-08-22',
      security_type: 'SAFE', round_size: 3000000, civ_amount: 500000,
      post_money_valuation: 15000000, civ_ownership_pct: 3.33, civ_shares: 33300, pps: 15.00,
      current_mark: 4000000, realized_gain: 0, unrealized_gain: 3500000, moic: 8.00, irr: 1.12,
      co_investors: [
        { id: 'ci-ma1a', name: 'Y Combinator', amount: 500000, ownership_pct: 3.33 },
        { id: 'ci-ma1b', name: 'Pear VC', amount: 1000000, ownership_pct: 6.67 },
      ]
    },
    {
      id: 'inv-ma2', company_id: 'meridian-ai', round_name: 'Series A', date: '2023-12-05',
      security_type: 'Preferred', round_size: 20000000, civ_amount: 2500000,
      post_money_valuation: 70000000, civ_ownership_pct: 3.57, civ_shares: 35700, pps: 70.00,
      current_mark: 9500000, realized_gain: 0, unrealized_gain: 7000000, moic: 3.80, irr: 0.68,
      co_investors: [
        { id: 'ci-ma2a', name: 'Sequoia Capital', amount: 10000000, ownership_pct: 14.29 },
        { id: 'ci-ma2b', name: 'Coatue', amount: 5000000, ownership_pct: 7.14 },
      ]
    },
  ],
  'lattice-infra': [
    {
      id: 'inv-li1', company_id: 'lattice-infra', round_name: 'Series A', date: '2023-04-10',
      security_type: 'Preferred', round_size: 35000000, civ_amount: 3000000,
      post_money_valuation: 80000000, civ_ownership_pct: 3.75, civ_shares: 37500, pps: 80.00,
      current_mark: 5400000, realized_gain: 0, unrealized_gain: 2400000, moic: 1.80, irr: 0.35,
      co_investors: [
        { id: 'ci-li1a', name: 'Bessemer Venture Partners', amount: 15000000, ownership_pct: 18.75 },
        { id: 'ci-li1b', name: 'Insight Partners', amount: 12000000, ownership_pct: 15.00 },
      ]
    },
  ],
  'helios-power': [
    {
      id: 'inv-hp1', company_id: 'helios-power', round_name: 'Seed', date: '2023-07-14',
      security_type: 'SAFE', round_size: 5000000, civ_amount: 1500000,
      post_money_valuation: 20000000, civ_ownership_pct: 7.50, civ_shares: 75000, pps: 20.00,
      current_mark: 2250000, realized_gain: 0, unrealized_gain: 750000, moic: 1.50, irr: 0.28,
      co_investors: [
        { id: 'ci-hp1a', name: 'Congruent Ventures', amount: 1500000, ownership_pct: 7.50 },
        { id: 'ci-hp1b', name: 'Powerhouse Ventures', amount: 1000000, ownership_pct: 5.00 },
      ]
    },
  ],
}

export const fundMetrics: Record<string, FundMetrics> = {
  'fund-1': {
    total_invested: 17750000,
    current_value: 48150000,
    moic: 2.71,
    tvpi: 2.71,
    gross_irr: 0.45,
    net_irr: 0.38,
    num_companies: 5
  }
}
