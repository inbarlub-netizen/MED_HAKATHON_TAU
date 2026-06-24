import type { ClinicalCase, HiddenConcernState, IntentTopic } from '@/types'
import { scoreEncounter } from '@/engine/scoringEngine'
import type { CommSignals, DebriefResult, EncounterFlags, PatientMeters, ScoringEvent } from '../types'

const SUGGESTED_PHRASES = [
  'Many people have concerns about their medications. What have you heard or worried about?',
  'It makes sense that you wanted to protect yourself. Can you walk me through what made you stop?',
  'Nothing you say changes how I look after you. Let us figure this out together.',
  'Let us make a safe plan together so you feel steady again.',
]

interface DebriefInput {
  c: ClinicalCase
  meters: PatientMeters
  signals: CommSignals
  hiddenState: HiddenConcernState
  coveredTopics: IntentTopic[]
  flags: EncounterFlags
  events: ScoringEvent[]
  trustTimeline: { t: number; value: number }[]
}

/** Bridges the live encounter into the existing OSCE scoring engine + a debrief view. */
export function buildDebrief(input: DebriefInput): DebriefResult {
  const { c, meters, signals, hiddenState, coveredTopics, flags, events, trustTimeline } = input

  const presenceSub = [
    { label: 'Confidence', value: signals.confidence },
    { label: 'Listening', value: signals.listening },
    { label: 'Clarity', value: signals.clarity },
  ]
  const presence = Math.round((signals.confidence + signals.listening + signals.clarity) / 3)

  const osce = scoreEncounter({
    c,
    coveredTopics,
    flags,
    hiddenState,
    orderedMeasurements: [],
    trust: meters.trust,
    presence,
    presenceSub,
  })

  const unlocked = hiddenState === 'fully_revealed' || hiddenState === 'addressed_with_empathy'

  const strengths: string[] = []
  if (flags.empathyUsed) strengths.push('Used empathy and reassurance to put the patient at ease.')
  if (flags.usedNormalizing) strengths.push('Normalized a sensitive topic before asking about it.')
  if (flags.introducedSelf) strengths.push('Introduced yourself and set a respectful tone.')
  if (signals.openQuestionQuality >= 55) strengths.push('Opened with patient-centered, open questions.')
  if (unlocked) strengths.push('Built enough trust for David to reveal his hidden concern.')
  if (strengths.length === 0) strengths.push('Completed the encounter and kept the patient engaged.')

  const missed: string[] = []
  if (flags.judgmentalAttempt) missed.push('An early judgmental phrasing briefly lowered the patient\'s trust.')
  if (!unlocked) missed.push('The hidden concern stayed locked - normalize and ask non-judgmentally to unlock it.')
  if (!flags.redFlagsAsked) missed.push('Red-flag / cannot-miss screening was light this encounter.')
  if (signals.judgmentRisk >= 45) missed.push('Several questions carried judgment risk - lead with a normalizing bridge.')
  if (missed.length === 0) missed.push('Strong encounter - refine pacing and closure next time.')

  return {
    overallScore: osce.total,
    overallMax: osce.max,
    communicationScore: osce.communication,
    summary: osce.summary,
    strengths,
    missedOpportunities: missed,
    trustTimeline,
    hiddenConcernOutcome: hiddenState,
    suggestedPhrases: SUGGESTED_PHRASES,
    rubric: osce.items.map((i) => ({
      id: i.id,
      label: i.label,
      earned: i.earned,
      max: i.max,
      evidence: i.evidence,
      missed: i.missed,
    })),
  }
}
