import type { Instructor } from '@/types'

export const instructors: Instructor[] = [
  { id: 'dana', name: 'Dr. Dana Levi', title: 'Attending, Internal Medicine', load: 72, specialties: ['Internal Medicine', 'Geriatrics'] },
  { id: 'amir', name: 'Dr. Amir Cohen', title: 'Attending, Emergency Medicine', load: 58, specialties: ['Emergency Medicine'] },
  { id: 'noa', name: 'Dr. Noa Bar', title: 'Clinical Educator', load: 41, specialties: ['Pulmonology', 'Internal Medicine'] },
]

export interface DebriefQueueItem {
  id: string
  student: string
  caseTitle: string
  flag: string
  severity: 'high' | 'medium' | 'low'
  minutes: number
}

export const debriefQueue: DebriefQueueItem[] = [
  { id: 'd1', student: 'Maya Cohen', caseTitle: 'Elderly Dizziness - Med Non-Adherence', flag: 'Hidden concern found late (2nd question)', severity: 'high', minutes: 10 },
  { id: 'd2', student: 'Yossi Adler', caseTitle: 'Chest Pain - Hidden Substance Use', flag: 'Judgmental substance-use phrasing', severity: 'high', minutes: 12 },
  { id: 'd3', student: 'Rina Katz', caseTitle: 'COPD Dyspnea - Cost Barrier', flag: 'Missed affordability barrier', severity: 'medium', minutes: 8 },
  { id: 'd4', student: 'Tom Geva', caseTitle: 'Abdominal Pain - Pregnancy', flag: 'CT ordered before pregnancy test', severity: 'high', minutes: 9 },
  { id: 'd5', student: 'Liat Shaked', caseTitle: 'Elderly Dizziness - Med Non-Adherence', flag: 'Strong - light touch only', severity: 'low', minutes: 5 },
]
