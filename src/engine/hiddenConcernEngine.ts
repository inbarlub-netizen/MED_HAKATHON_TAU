import type { HiddenConcern, HiddenConcernState, IntentResult } from '@/types'

export interface HiddenConcernOutcome {
  nextState: HiddenConcernState
  patientResponse: string
  /** event sentiment for replay */
  sentiment: 'good' | 'missed' | 'warning' | 'unlock' | 'neutral'
  changed: boolean
}

/**
 * The Hidden Concern Engine - the signature feature.
 * The patient only reveals sensitive information if the student addresses the
 * correct topic with the right tone (and confidentiality where required).
 */
export function evaluateHiddenConcern(
  concern: HiddenConcern,
  state: HiddenConcernState,
  intent: IntentResult
): HiddenConcernOutcome {
  const onTopic = intent.topics.includes(concern.requiredTopic)
  const noChange = (): HiddenConcernOutcome => ({
    nextState: state,
    patientResponse: '',
    sentiment: 'neutral',
    changed: false,
  })

  if (state === 'fully_revealed' || state === 'addressed_with_empathy') return noChange()
  if (!onTopic) return noChange()

  const judgmental = intent.tone === 'judgmental'
  const rushed = intent.tone === 'rushed'
  const supportive =
    intent.nonjudgmental && (intent.hasNormalizingBridge || intent.topics.includes('empathy') || intent.hasReassurance)
  const confidentialityOk = !concern.requiresConfidentiality || intent.hasConfidentiality

  // Bad phrasing → patient becomes guarded, concern stays locked.
  if (judgmental || rushed) {
    return {
      nextState: state === 'locked' ? 'locked' : state,
      patientResponse: concern.guardedResponse,
      sentiment: 'warning',
      changed: false,
    }
  }

  // Correct topic + good tone + confidentiality (if needed) → full reveal.
  if (supportive && confidentialityOk) {
    return {
      nextState: 'fully_revealed',
      patientResponse: concern.revealResponse,
      sentiment: 'unlock',
      changed: true,
    }
  }

  // On topic, neutral tone, missing the confidentiality / normalizing piece → partial.
  if (concern.requiresNonjudgmental) {
    if (state === 'locked') {
      return {
        nextState: 'clue_given',
        patientResponse: concern.clueResponse,
        sentiment: 'good',
        changed: true,
      }
    }
    if (state === 'clue_given') {
      return {
        nextState: 'partially_revealed',
        patientResponse: concern.partialResponse,
        sentiment: 'good',
        changed: true,
      }
    }
    if (state === 'partially_revealed') {
      return {
        nextState: 'fully_revealed',
        patientResponse: concern.revealResponse,
        sentiment: 'unlock',
        changed: true,
      }
    }
  }

  return noChange()
}
