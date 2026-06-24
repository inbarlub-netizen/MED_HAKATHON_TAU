import type { HiddenConcernState, IntentResult } from '@/types'
import type { PatientEmotion, PatientMeters, ScoringEvent } from '../types'

/** Spec-aligned starting meters, tuned to David (dizziness, polite, anxious). */
export function initialMeters(): PatientMeters {
  return {
    trust: 42,
    anxiety: 62,
    openness: 38,
    painDistress: 35,
    confusion: 42,
    hiddenConcernProgress: 0,
    hiddenConcernRevealed: false,
  }
}

const clamp = (v: number) => Math.max(0, Math.min(100, v))

/** Display-only mapping from the authoritative hidden-concern state machine. */
export function progressFromState(state: HiddenConcernState): number {
  switch (state) {
    case 'clue_given':
      return 45
    case 'partially_revealed':
      return 75
    case 'fully_revealed':
    case 'addressed_with_empathy':
      return 100
    default:
      return 0
  }
}

interface TurnContext {
  intent: IntentResult
  hiddenState: HiddenConcernState
  hiddenChanged: boolean
  hiddenSentiment: 'good' | 'missed' | 'warning' | 'unlock' | 'neutral'
}

/**
 * Applies one clinician turn to the numeric meters and emits scoring events.
 * The hidden-concern reveal itself is owned by hiddenConcernEngine; here we only
 * reflect it into the progress meter and drive trust/anxiety/openness for the
 * live visuals and pacing.
 */
export function applyTurn(
  m: PatientMeters,
  ctx: TurnContext,
  t: number
): { meters: PatientMeters; events: ScoringEvent[] } {
  const { intent, hiddenState, hiddenChanged, hiddenSentiment } = ctx
  const next: PatientMeters = { ...m }
  const events: ScoringEvent[] = []
  const before = m.trust

  const empathic =
    intent.topics.includes('empathy') || intent.hasReassurance || intent.hasNormalizingBridge
  const judgmental = intent.tone === 'judgmental'
  const rushed = intent.tone === 'rushed'
  const explained = intent.topics.includes('explanation') || intent.topics.includes('closure')
  const onAdherence = intent.topics.includes('medication_adherence')
  const wordCount = intent.rawText.trim().split(/\s+/).filter(Boolean).length

  if (empathic) {
    next.trust += 8
    next.openness += 8
    next.anxiety -= 6
  }
  if (intent.hasNormalizingBridge && onAdherence) {
    next.trust += 4
    next.openness += 6
  }
  if (judgmental) {
    next.trust -= 15
    next.openness -= 15
    next.anxiety += 10
  }
  if (rushed) {
    next.trust -= 5
    next.anxiety += 5
  }
  if (explained) {
    next.confusion -= 12
    next.trust += 4
  }
  if (intent.introducedSelf) {
    next.trust += 4
    next.anxiety -= 3
  }
  // Repeated closed / off-topic one-liners gently close the patient down.
  if (!empathic && !explained && intent.topics.includes('unknown') && wordCount < 6) {
    next.openness -= 6
  }

  // Distress eases as the patient settles, creeps up while anxious.
  next.painDistress += next.anxiety > 70 ? 2 : -2

  next.hiddenConcernProgress = progressFromState(hiddenState)
  next.hiddenConcernRevealed =
    hiddenState === 'fully_revealed' || hiddenState === 'addressed_with_empathy'

  next.trust = clamp(next.trust)
  next.anxiety = clamp(next.anxiety)
  next.openness = clamp(next.openness)
  next.painDistress = clamp(next.painDistress)
  next.confusion = clamp(next.confusion)

  const dTrust = Math.round(next.trust - before)
  if (hiddenChanged && hiddenSentiment === 'unlock') {
    events.push(ev(t, 'concern_revealed', 'unlock', 'Hidden concern revealed: David admits he stopped his blood-pressure medication.'))
  } else if (hiddenChanged && hiddenSentiment === 'good') {
    events.push(ev(t, 'hidden_concern_progress', 'good', 'David hinted at something about his medication. Stay gentle and follow up.'))
  } else if (hiddenSentiment === 'warning') {
    events.push(ev(t, 'missed_opportunity', 'warning', 'A judgmental tone made David guarded. Normalize the topic before asking again.'))
  }
  if (dTrust >= 5) {
    events.push(ev(t, 'trust_up', 'good', `Trust +${dTrust}: warm, patient-centered phrasing.`))
  } else if (dTrust <= -5) {
    events.push(ev(t, 'trust_down', 'warning', `Trust ${dTrust}: that phrasing felt judgmental or rushed.`))
  }

  return { meters: next, events }
}

export function emotionFromState(m: PatientMeters, hiddenState: HiddenConcernState): PatientEmotion {
  if (hiddenState === 'fully_revealed' || hiddenState === 'addressed_with_empathy') return 'relieved'
  if (m.trust < 30) return 'guarded'
  if (m.anxiety > 68) return 'anxious'
  if (m.confusion > 60) return 'confused'
  return 'cooperative'
}

let seq = 0
function ev(t: number, type: ScoringEvent['type'], sentiment: ScoringEvent['sentiment'], message: string): ScoringEvent {
  return { id: `ev-${++seq}`, t, type, sentiment, message }
}
