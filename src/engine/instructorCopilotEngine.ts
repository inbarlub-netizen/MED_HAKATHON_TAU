import type { OsceResult } from '@/types'

export interface DebriefGuide {
  student: string
  caseTitle: string
  mainIssue: string
  opening: string
  practicePrompt: string
  goal: string
  strengths: string[]
}

/** Generates a focused, supportive debrief guide for an instructor. */
export function buildDebriefGuide(student: string, caseTitle: string, result?: OsceResult): DebriefGuide {
  const unlocked =
    result?.hiddenConcern === 'fully_revealed' || result?.hiddenConcern === 'addressed_with_empathy'
  return {
    student,
    caseTitle,
    mainIssue: unlocked
      ? 'Hidden concern was uncovered, but only after an initial judgmental phrasing reduced trust.'
      : 'Medication adherence was on-topic but the hidden concern was not fully disclosed.',
    opening: 'Walk me through how you decided which medications were relevant.',
    practicePrompt: 'Rewrite your first medication question in a nonjudgmental way.',
    goal: 'Next attempt: ask about medication changes and side effects within the first 4 minutes, with a normalizing bridge.',
    strengths: ['Warm rapport and empathy', 'Solid open-ended history', 'Good red-flag screening'],
  }
}

export const groupWeaknessSummary = {
  title: 'Group weakness - sensitive-topic delivery',
  detail:
    'Most students know which questions to ask but use judgmental phrasing for medication and substance histories. The clinical content is present; the delivery is the gap.',
  recommendation: '20-minute micro-teaching: "Normalizing bridges for sensitive histories" with paired practice.',
}
