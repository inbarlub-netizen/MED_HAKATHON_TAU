import type { CohortInsight } from '@/types'

export const cohort: CohortInsight = {
  id: 'tau-2026',
  cohort: 'TAU Med 2026',
  size: 84,
  casesCompleted: 1240,
  avgOsce: 71,
  hiddenConcernRate: 38,
  redFlagMissRate: 19,
  unnecessaryTestRate: 34,
  trustTrend: [
    { label: 'Wk 1', value: 60 },
    { label: 'Wk 2', value: 62 },
    { label: 'Wk 3', value: 64 },
    { label: 'Wk 4', value: 67 },
    { label: 'Wk 5', value: 68 },
    { label: 'Wk 6', value: 70 },
  ],
  presenceTrend: [
    { label: 'Wk 1', value: 57 },
    { label: 'Wk 2', value: 60 },
    { label: 'Wk 3', value: 62 },
    { label: 'Wk 4', value: 65 },
    { label: 'Wk 5', value: 66 },
    { label: 'Wk 6', value: 69 },
  ],
  skillHeatmap: [
    { skill: 'History', mastery: 78 },
    { skill: 'Red flags', mastery: 64 },
    { skill: 'Empathy', mastery: 75 },
    { skill: 'Hidden concerns', mastery: 41 },
    { skill: 'Med adherence', mastery: 38 },
    { skill: 'Nonjudgmental phrasing', mastery: 45 },
    { skill: 'Tests', mastery: 66 },
    { skill: 'Differential', mastery: 70 },
    { skill: 'Management', mastery: 63 },
  ],
  gaps: [
    {
      title: '62% of students missed medication adherence in elderly dizziness',
      detail: 'Students know which questions to ask, but many use judgmental phrasing for sensitive topics, keeping the hidden concern locked.',
      severity: 'high',
    },
    {
      title: 'Students over-order ECG & labs before clarifying medication changes',
      detail: 'Test-before-story pattern raises the unnecessary-test rate to 34% and delays the key finding.',
      severity: 'medium',
    },
    {
      title: 'Red-flag screening inconsistent in dizziness/falls',
      detail: 'Posterior-circulation stroke screening was skipped in 1 of 5 encounters.',
      severity: 'medium',
    },
  ],
  caseCoverage: [
    { type: 'Internal Medicine', covered: 88 },
    { type: 'Geriatrics', covered: 64 },
    { type: 'Emergency Medicine', covered: 52 },
    { type: 'OB-GYN', covered: 28 },
    { type: 'Pulmonology', covered: 35 },
    { type: 'Pediatrics', covered: 22 },
    { type: 'Psychiatry', covered: 18 },
  ],
}

/** Recommended teaching focus derived from gaps */
export const teachingRecommendations = [
  {
    title: 'Run a 20-minute micro-teaching on nonjudgmental medication reconciliation',
    impact: 'Targets the #1 cohort gap (62% missed adherence)',
    audience: '34 students flagged',
  },
  {
    title: 'Add a "story before tests" prompt to the dizziness station',
    impact: 'Reduces unnecessary ECG/lab ordering',
    audience: 'Cohort-wide',
  },
  {
    title: 'Assign Maya Cohen debrief to Dr. Dana Levi',
    impact: 'Focus: nonjudgmental medication reconciliation',
    audience: 'Maya Cohen',
  },
]
