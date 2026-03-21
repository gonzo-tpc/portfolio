import { supabase } from './supabase'
import { Company, Fund, Investment, FundMetrics } from '@/types'

export async function getFunds(): Promise<Fund[]> {
  try {
    const { data, error } = await supabase.from('funds').select('*').order('vintage_year')
    if (error) { console.error('getFunds:', error); return [] }
    return data || []
  } catch (e) { console.error('getFunds:', e); return [] }
}

export async function getCompanies(fundId?: string): Promise<Company[]> {
  try {
    let query = supabase.from('companies').select('*').order('total_invested', { ascending: false })
    if (fundId) query = query.eq('fund_id', fundId)
    const { data, error } = await query
    if (error) { console.error('getCompanies:', error); return [] }
    return data || []
  } catch (e) { console.error('getCompanies:', e); return [] }
}

export async function getCompany(id: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single()
    if (error) return null
    return data
  } catch (e) { console.error('getCompany:', e); return null }
}

export async function getInvestments(companyId: string): Promise<Investment[]> {
  try {
  const { data: invData, error: invError } = await supabase
    .from('investments')
    .select('*')
    .eq('company_id', companyId)
    .order('date')
  if (invError) { console.error('getInvestments:', invError); return [] }

  const investments = invData || []

  // Fetch co-investors for all investments
  const invIds = investments.map(i => i.id)
  if (invIds.length === 0) return []

  const { data: ciData } = await supabase
    .from('co_investors')
    .select('*')
    .in('investment_id', invIds)

  const ciMap: Record<string, typeof ciData> = {}
  for (const ci of ciData || []) {
    if (!ciMap[ci.investment_id]) ciMap[ci.investment_id] = []
    ciMap[ci.investment_id]!.push(ci)
  }

  return investments.map(inv => ({
    ...inv,
    co_investors: ciMap[inv.id] || [],
  }))
  } catch (e) { console.error('getInvestments:', e); return [] }
}

export async function getFundMetrics(fundId: string): Promise<FundMetrics> {
  const companies = await getCompanies(fundId)
  const total_invested = companies.reduce((s, c) => s + Number(c.total_invested), 0)
  const current_value = companies.reduce((s, c) => s + Number(c.current_mark), 0)
  const moic = total_invested > 0 ? current_value / total_invested : 0
  const avg_irr = companies.length > 0
    ? companies.reduce((s, c) => s + Number(c.irr), 0) / companies.length
    : 0
  return {
    total_invested,
    current_value,
    moic: parseFloat(moic.toFixed(2)),
    tvpi: parseFloat(moic.toFixed(2)),
    gross_irr: parseFloat(avg_irr.toFixed(4)),
    net_irr: parseFloat((avg_irr * 0.85).toFixed(4)),
    num_companies: companies.length,
  }
}
