export type Language = 'en' | 'hi'
export type Availability = 'available' | 'limited' | 'not_available'

export interface LocationProfile { state: string; district: string; block: string; village: string; marketDistance: number }
export interface Entrepreneur {
  name: string; age: number; gender: string; location: LocationProfile; annualIncome: number; ownCapital: number;
  language: Language; skills: string[]; experience: 'none' | 'some' | 'experienced'; land: Availability;
  electricity: Availability; water: Availability; connectivity: Availability; transport: Availability; assets: string; interest: string; category: string
}
export interface LocalMarketData {
  village: string; population: number; households: number; marketDistance: number;
  existingBusinesses: Record<string, number>; demand: Record<string, 'low' | 'medium' | 'high'>; notes: string
}
export interface BusinessProfile {
  id: string; name: string; nameHi: string; category: string; startupCost: number; minCapital: number; equipmentCost: number;
  monthlyExpenses: number; revenueLow: number; revenueHigh: number; profitLow: number; profitHigh: number; risk: 'Low'|'Medium'|'High';
  skills: string[]; land: boolean; electricity: boolean; water: boolean; marketDependency: 'Low'|'Medium'|'High'; seasonality: 'Low'|'Medium'|'High'; customers: string[]; description: string; descriptionHi: string;
}
export interface BusinessRecommendation { business: BusinessProfile; score: number; factors: { financial: number; demand: number; skill: number; resources: number; competition: number; risk: number }; reasons: string[] }
export interface FinancialPlan { projectCost: number; ownContribution: number; loanAmount: number; interestRate: number; tenureYears: number; moratoriumMonths: number; repaymentFrequency: 'monthly'|'quarterly'; monthlyRevenue: number; monthlyExpenses: number }
export interface FinancialResults { annualInterest: number; installment: number; totalRepayment: number; operatingProfit: number; netCashFlow: number; debtServiceRatio: number; breakEvenMonths: number; roi: number; maximumFinancing: number }
export interface GovernmentScheme { id: string; name: string; projectMin: number; projectMax: number; maxLoan: number; interest: string; numericInterest: number; tenure: string; tenureYears: number; moratoriumMonths: number; frequency: 'quarterly'|'not_stated'; channel?: string; source: string; eligibility: string[] }
export interface SchemeMatch { scheme: GovernmentScheme; fit: 'Best Match'|'Potential Match'|'Needs Review'; reasons: string[]; issues: string[]; potentialAmount: number }
export interface BusinessRisk { risk: string; probability: 'Low'|'Medium'|'High'; impact: 'Low'|'Medium'|'High'; mitigation: string }
export interface Feasibility { score: number; label: string; components: { name: string; weight: number; score: number }[] }
