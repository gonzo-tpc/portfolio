export interface Fund {
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
