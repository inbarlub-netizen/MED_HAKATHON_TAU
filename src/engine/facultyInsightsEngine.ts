import type { CohortInsight } from '@/types'

export interface FacultyRecommendation {
  forWho: 'Student' | 'Instructor' | 'Simulation Center'
  text: string
  tone: 'cyan' | 'violet' | 'success'
}

/** Derives "what to do next" recommendations from cohort insights. */
export function facultyRecommendations(cohort: CohortInsight): FacultyRecommendation[] {
  const recs: FacultyRecommendation[] = []
  const topGap = cohort.gaps[0]
  if (topGap) {
    recs.push({
      forWho: 'Student',
      text: 'Assign nonjudgmental medication-reconciliation practice to the 34 students flagged on adherence.',
      tone: 'cyan',
    })
    recs.push({
      forWho: 'Instructor',
      text: 'Run a 20-minute micro-teaching on normalizing bridges for sensitive histories.',
      tone: 'violet',
    })
  }
  if (cohort.unnecessaryTestRate > 30) {
    recs.push({
      forWho: 'Simulation Center',
      text: 'Add a "story before tests" checkpoint to the dizziness station to reduce over-ordering.',
      tone: 'success',
    })
  }
  return recs
}

export function lowestCoverage(cohort: CohortInsight) {
  return [...cohort.caseCoverage].sort((a, b) => a.covered - b.covered).slice(0, 3)
}
