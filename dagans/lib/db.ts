import { supabase } from './supabase'
import { Company, Fund, Investment, FundMetrics } from '@/types'

// Compute current mark for a set of investment rows using latest PPS × total shares
function computeMarkFromInvestments(invRows: { civ_shares: number | string; pps: number | string }[]) {
  if (!invRows.length) return { latestPPS: 0, totalShares: 0, totalMark: 0 }
  const latestPPS = invRows.reduce((max, r) => Math.max(max, Number(r.pps)), 0)
  const totalShares = invRows.reduce((sum, r) => sum + Number(r.civ_shares), 0)
  return { latestPPS, totalShares, totalMark: latestPPS * totalShares }
}

export async function getFunds(): Promise<Fund[]> {
  try {
    const { data, error } = await supabase.from('funds').select('*').order('vintage_year')
    if (error) { console.error('getFunds:', error); return [] }
    return data || []
  } catch (e) { console.error('getFunds:', e); return [] }
}

export async function getCompanies(fundId?: string): Promise<Company[]> {
  try {
    // Fetch companies
    let query = supabase.from('companies').select('*')
    if (fundId) query = query.eq('fund_id', fundId)
    const { data: companies, error } = await query
    if (error) { console.error('getCompanies:', error); return [] }
    if (!companies || companies.length === 0) return []

    // Batch fetch all investments for these companies
    const companyIds = companies.map((c: Company) => c.id)
    const { data: allInvestments } = await supabase
      .from('investments')
      .select('company_id, civ_shares, pps, civ_amount')
      .in('company_id', companyIds)

    // Group investments by company and compute marks
    const invByCompany: Record<string, { civ_shares: number; pps: number }[]> = {}
    for (const inv of allInvestments || []) {
      if (!invByCompany[inv.company_id]) invByCompany[inv.company_id] = []
      invByCompany[inv.company_id].push(inv)
    }

    const withMarks = companies.map((co: Company) => {
      const invRows = invByCompany[co.id] || []
      if (invRows.length === 0) return co
      const { totalMark } = computeMarkFromInvestments(invRows)
      const totalInvested = Number(co.total_invested)
      const moic = totalInvested > 0 ? totalMark / totalInvested : 0
      return { ...co, current_mark: totalMark, moic: parseFloat(moic.toFixed(4)) }
    })

    // Sort by total_invested descending (so highest-invested company is first)
    return withMarks.sort((a: Company, b: Company) => Number(b.total_invested) - Number(a.total_invested))
  } catch (e) { console.error('getCompanies:', e); return [] }
}

export async function getCompany(id: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single()
    if (error) return null

    // Compute mark from investments
    const { data: invRows } = await supabase
      .from('investments')
      .select('civ_shares, pps')
      .eq('company_id', id)

    if (invRows && invRows.length > 0) {
      const { totalMark } = computeMarkFromInvestments(invRows)
      const totalInvested = Number(data.total_invested)
      const moic = totalInvested > 0 ? totalMark / totalInvested : 0
      return { ...data, current_mark: totalMark, moic: parseFloat(moic.toFixed(4)) }
    }

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
    if (investments.length === 0) return []

    // Compute latest PPS across all rounds for this company
    const { latestPPS } = computeMarkFromInvestments(investments)

    // Fetch co-investors
    const invIds = investments.map((i: Investment) => i.id)
    const { data: ciData } = await supabase
      .from('co_investors')
      .select('*')
      .in('investment_id', invIds)

    const ciMap: Record<string, typeof ciData> = {}
    for (const ci of ciData || []) {
      if (!ciMap[ci.investment_id]) ciMap[ci.investment_id] = []
      ciMap[ci.investment_id]!.push(ci)
    }

    // Annotate each investment: current_mark = shares × latestPPS
    return investments.map((inv: Investment) => {
      const shares = Number(inv.civ_shares)
      const currentMark = shares * latestPPS
      const unrealizedGain = currentMark - Number(inv.civ_amount)
      const moic = Number(inv.civ_amount) > 0 ? currentMark / Number(inv.civ_amount) : 0
      return {
        ...inv,
        current_mark: currentMark,
        unrealized_gain: unrealizedGain,
        moic: parseFloat(moic.toFixed(4)),
        co_investors: ciMap[inv.id] || [],
      }
    })
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
