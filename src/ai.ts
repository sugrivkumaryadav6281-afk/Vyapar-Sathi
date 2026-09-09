import type { Entrepreneur, BusinessProfile } from './types'

export interface AIService { analyzeBusinessIdea(text: string): Partial<Entrepreneur>; askFollowUpQuestions(user: Entrepreneur, business?: BusinessProfile): string[]; generateBusinessExplanation(business: BusinessProfile, hindi: boolean): string; generateBusinessPlanText(user: Entrepreneur, business: BusinessProfile): string }

export class DemoAIService implements AIService {
  analyzeBusinessIdea(text: string) { const lower = text.toLowerCase(); const capitalMatch = text.replace(/,/g,'').match(/(?:₹|rs\.?|rupees?\s*)(\d{4,7})/i); const business = ['dairy','poultry','goat','mushroom','grocery','mobile','tailoring','food','vegetable'].find(x => lower.includes(x) || (x === 'dairy' && /डेयरी|doodh/.test(lower))); return { ownCapital: capitalMatch ? Number(capitalMatch[1]) : undefined, interest: business } }
  askFollowUpQuestions(user: Entrepreneur, business?: BusinessProfile) { const q:string[]=[]; if (business?.land && user.land !== 'available') q.push('Do you have access to suitable land or a shed for this activity?'); if (!user.assets) q.push('What equipment, livestock, tools or shop space do you already own?'); if (user.experience === 'none') q.push('What training or practical experience do you have in this business?'); if (user.location.marketDistance > 5) q.push('How will you transport products to the nearest market?'); q.push(business?.id === 'dairy' ? 'Do you already own cattle, and can you access veterinary services?' : 'Who are your first likely customers, and how will they find you?'); return q.slice(0,4) }
  generateBusinessExplanation(business: BusinessProfile, hindi: boolean) { return hindi ? `${business.nameHi} को स्थानीय अवसर, उपलब्ध संसाधनों और आपकी शुरुआती पूंजी के आधार पर सुझाया गया है। अनुमानित आँकड़ों को शुरू करने से पहले स्थानीय सत्यापन से मिलाएँ।` : `${business.name} is recommended based on the local opportunity estimate, available resources and your starting capital. Validate the estimates locally before making a commitment.` }
  generateBusinessPlanText(user: Entrepreneur, business: BusinessProfile) { return `${user.name} proposes to establish a ${business.name} enterprise in ${user.location.village}. This advisory project report uses demo/local-market estimates and must be validated with suppliers, customers and the authorized financing agency.` }
}

export class LLMAIService extends DemoAIService { /* Safe placeholder: connect through a server-side proxy; never expose VITE_AI_API_KEY in client code. */ }
export const aiService: AIService = new DemoAIService()
