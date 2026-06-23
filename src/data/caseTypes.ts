import type { Specialty } from '@/types'

export interface CaseTypeDef {
  specialty: Specialty
  tagline: string
  focus: string[]
  accent: 'cyan' | 'violet' | 'success' | 'warning' | 'danger' | 'blue'
  implemented: boolean
}

export const caseTypes: CaseTypeDef[] = [
  {
    specialty: 'Internal Medicine',
    tagline: 'Reasoning, medications & safety-netting',
    focus: ['History depth', 'Medications', 'Adherence', 'Differential', 'Tests', 'Safety netting'],
    accent: 'cyan',
    implemented: true,
  },
  {
    specialty: 'Geriatrics',
    tagline: 'Falls, polypharmacy & function',
    focus: ['Falls', 'Medication review', 'Cognition', 'Adherence', 'Functional status', 'Caregiver context'],
    accent: 'violet',
    implemented: true,
  },
  {
    specialty: 'Emergency Medicine',
    tagline: 'Stability first, cannot-miss reasoning',
    focus: ['Red flags', 'Stability', 'Urgent testing', 'Cannot-miss dx', 'Prioritization'],
    accent: 'danger',
    implemented: false,
  },
  {
    specialty: 'OB-GYN',
    tagline: 'Privacy & sensitive communication',
    focus: ['Privacy', 'Pregnancy status', 'Sexual history', 'Radiation safety', 'Sensitive communication'],
    accent: 'blue',
    implemented: false,
  },
  {
    specialty: 'Pulmonology',
    tagline: 'Literacy, technique & access',
    focus: ['Dyspnea', 'Inhaler technique', 'Oxygenation', 'Health literacy', 'Affordability', 'Teach-back'],
    accent: 'success',
    implemented: false,
  },
  {
    specialty: 'Pediatrics',
    tagline: 'Parent communication & red flags',
    focus: ['Parent communication', 'Hydration/red flags', 'Age-appropriate assessment', 'Safety netting'],
    accent: 'warning',
    implemented: false,
  },
  {
    specialty: 'Psychiatry',
    tagline: 'Risk, empathy & safety planning',
    focus: ['Risk assessment', 'Empathy', 'Nonjudgmental questions', 'Safety planning', 'Confidentiality'],
    accent: 'violet',
    implemented: false,
  },
]
