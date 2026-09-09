import type { Entrepreneur, BusinessProfile, BusinessRecommendation, FinancialPlan, FinancialResults, GovernmentScheme, SchemeMatch, BusinessRisk, Feasibility, LocalMarketData } from './types'

const cap = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
export const rupees = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)
export const shortRupees = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(n % 100000 ? 1 : 0)} lakh` : rupees(n)

export function calculateFinancials(plan: FinancialPlan): FinancialResults {
  const principal = Math.max(0, Math.min(plan.loanAmount, plan.projectCost - plan.ownContribution))
  const periods = Math.max(1, plan.tenureYears * (plan.repaymentFrequency === 'quarterly' ? 4 : 12))
  const rate = plan.interestRate / 100 / (plan.repaymentFrequency === 'quarterly' ? 4 : 12)
  const installment = rate ? principal * rate * Math.pow(1 + rate, periods) / (Math.pow(1 + rate, periods) - 1) : principal / periods
  const totalRepayment = installment * periods
  const operatingProfit = plan.monthlyRevenue - plan.monthlyExpenses
  const monthlyDebt = plan.repaymentFrequency === 'quarterly' ? installment / 3 : installment
  const netCashFlow = operatingProfit - monthlyDebt
  return { annualInterest: principal * plan.interestRate / 100, installment, totalRepayment, operatingProfit, netCashFlow, debtServiceRatio: operatingProfit > 0 ? monthlyDebt / operatingProfit : 9, breakEvenMonths: operatingProfit > 0 ? Math.ceil(plan.projectCost / operatingProfit) : 0, roi: plan.projectCost ? operatingProfit * 12 / plan.projectCost * 100 : 0, maximumFinancing: Math.max(0, plan.projectCost - plan.ownContribution) }
}

export function recommendBusinesses(user: Entrepreneur, profiles: BusinessProfile[], market: LocalMarketData): BusinessRecommendation[] {
  return profiles.map(business => {
    const financial = cap(user.ownCapital >= business.minCapital ? 65 + Math.min(35, (user.ownCapital / business.startupCost) * 100) : (user.ownCapital / business.minCapital) * 55)
    const demandWord = market.demand[business.id] ?? 'medium'
    const demand = demandWord === 'high' ? 92 : demandWord === 'medium' ? 68 : 42
    const skill = business.skills.some(s => user.skills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))) ? 92 : user.experience !== 'none' ? 62 : 42
    const resources = cap(((!business.land || user.land === 'available') ? 30 : 5) + ((!business.electricity || user.electricity === 'available') ? 25 : 6) + ((!business.water || user.water === 'available') ? 25 : 6) + (user.transport === 'available' ? 20 : user.transport === 'limited' ? 12 : 4))
    const existing = market.existingBusinesses[business.name.replace(' Farming','').replace(' & Accessories','').replace(' Store','')] ?? market.existingBusinesses[business.category] ?? 1
    const competition = cap(90 - existing * 11)
    const risk = business.risk === 'Low' ? 88 : business.risk === 'Medium' ? 67 : 45
    const score = cap(financial*.3 + demand*.2 + skill*.15 + resources*.15 + competition*.1 + risk*.1)
    const reasons = [
      `${demandWord === 'high' ? 'Strong' : 'Visible'} estimated local demand for this category`,
      user.ownCapital >= business.minCapital ? `Your available capital meets the estimated minimum contribution` : `May require staged investment or additional own contribution`,
      (!business.land || user.land === 'available') && (!business.water || user.water === 'available') ? 'Available local resources support the operating model' : 'Resource requirements need verification before launch'
    ]
    return { business, score, factors: { financial, demand, skill, resources, competition, risk }, reasons }
  }).sort((a,b) => b.score - a.score)
}

export function getSchemeMatches(user: Entrepreneur, plan: FinancialPlan, schemes: GovernmentScheme[]): SchemeMatch[] {
 return schemes.map(scheme => {
   const projectFits = plan.projectCost >= scheme.projectMin && plan.projectCost <= scheme.projectMax
   const incomeFits = user.annualIncome <= 500000
   const categoryFits = user.category.toLowerCase().includes('scheduled caste')
   const potentialAmount = Math.min(scheme.maxLoan, plan.loanAmount, scheme.id === 'micro' ? plan.projectCost * .9 : Infinity)
   const reasons = [projectFits ? 'Project cost is within the stated range' : 'Project cost is outside the stated range', `Potential financing may be up to ${rupees(potentialAmount)}, subject to eligibility and approval`, 'Business is income-generating']
   const issues = [!incomeFits ? 'Demo income input is above the stated ₹5 lakh ceiling' : 'Annual-income eligibility needs official verification', !categoryFits ? 'SC eligibility and certificate need official verification' : 'Caste certificate and channel-specific requirements must be verified', 'Final decision is made by an authorized channelizing agency']
   const fit: SchemeMatch['fit'] = projectFits && incomeFits && categoryFits ? (scheme.id === 'micro' ? 'Best Match' : 'Potential Match') : 'Needs Review'
   return { scheme, fit, reasons, issues, potentialAmount }
 }).sort((a,b) => {
   const rank: Record<SchemeMatch['fit'], number> = {'Best Match':0,'Potential Match':1,'Needs Review':2}
   return rank[a.fit] - rank[b.fit]
 })
}

export function feasibility(recommendation: BusinessRecommendation, fin: FinancialResults): Feasibility {
 const components = [
   { name:'Market potential', weight:25, score: recommendation.factors.demand },
   { name:'Financial feasibility', weight:25, score: cap(65 + Math.min(30, fin.roi)) },
   { name:'Repayment capacity', weight:20, score: cap(100 - fin.debtServiceRatio * 65) },
   { name:'Resource availability', weight:10, score: recommendation.factors.resources },
   { name:'Experience / skill fit', weight:10, score: recommendation.factors.skill },
   { name:'Risk', weight:10, score: recommendation.factors.risk }
 ]
 const score = cap(components.reduce((sum, c) => sum + c.score * c.weight / 100, 0))
 return { score, label: score >= 80 ? 'Excellent Potential' : score >= 65 ? 'Good Potential' : score >= 50 ? 'Moderate Potential' : 'High Risk / Needs Revision', components }
}

const commonRisks: BusinessRisk[] = [
 {risk:'Demand may differ from the local estimate',probability:'Medium',impact:'Medium',mitigation:'Validate demand with 15–20 prospective customers before committing funds.'},
 {risk:'Working-capital pressure during the first months',probability:'Medium',impact:'High',mitigation:'Keep a cash buffer and start at a phased scale.'},
 {risk:'Pricing changes in local markets',probability:'Medium',impact:'Medium',mitigation:'Track prices weekly and build more than one buyer channel.'}
]
export function businessRisks(id: string): BusinessRisk[] {
 const map: Record<string,BusinessRisk[]> = {
 dairy:[{risk:'Animal disease or mortality',probability:'Medium',impact:'High',mitigation:'Use veterinary advice, vaccination schedules and suitable insurance where available.'},{risk:'Feed price fluctuation',probability:'High',impact:'Medium',mitigation:'Compare suppliers and plan feed inventory carefully.'},{risk:'Milk price / collection disruption',probability:'Medium',impact:'High',mitigation:'Maintain links with multiple buyers and local collection points.'}],
 poultry:[{risk:'Disease outbreak',probability:'Medium',impact:'High',mitigation:'Maintain hygiene, vaccination and veterinarian access.'},{risk:'Feed cost volatility',probability:'High',impact:'High',mitigation:'Use batch planning and supplier quotations.'}],
 vegetable:[{risk:'Weather and crop loss',probability:'High',impact:'High',mitigation:'Use seasonal planning, irrigation and agricultural extension advice.'},{risk:'Perishable inventory',probability:'High',impact:'Medium',mitigation:'Harvest to orders where possible and identify multiple markets.'}],
 mobile:[{risk:'Limited technical capability',probability:'Medium',impact:'Medium',mitigation:'Complete a practical repair course before launch.'},{risk:'Low initial footfall',probability:'Medium',impact:'Medium',mitigation:'Offer common accessories and build referral partnerships.'}]
 }
 return [...(map[id] ?? []), ...commonRisks].slice(0,5)
}

export function opportunityScore(rec: BusinessRecommendation) { return cap(rec.factors.demand*.28 + rec.factors.competition*.18 + rec.factors.resources*.22 + rec.factors.financial*.12 + rec.factors.risk*.20) }
