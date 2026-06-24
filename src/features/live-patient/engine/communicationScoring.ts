import type { AudioMetrics, IntentResult } from '@/types'
import type { CommSignals } from '../types'

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

export function emptySignals(): CommSignals {
  return {
    empathy: 0,
    clarity: 0,
    openQuestionQuality: 0,
    judgmentRisk: 0,
    confidence: 0,
    listening: 0,
    clinicalRelevance: 0,
  }
}

const CLINICAL_TOPICS = [
  'open_question',
  'symptom_history',
  'onset_duration',
  'associated_symptoms',
  'red_flags',
  'medications',
  'medication_adherence',
  'allergies',
  'social_history',
  'differential',
  'management_plan',
]

/** Deterministic per-turn communication scoring from intent + delivery metrics. */
export function scoreTurn(intent: IntentResult, audio: AudioMetrics): CommSignals {
  const empathic = intent.topics.includes('empathy')
  const judgmental = intent.tone === 'judgmental'
  const rushed = intent.tone === 'rushed'
  const explained = intent.topics.includes('explanation') || intent.topics.includes('closure')
  const open = intent.topics.includes('open_question')
  const wordCount = intent.rawText.trim().split(/\s+/).filter(Boolean).length
  const clinicalHits = intent.topics.filter((t) => CLINICAL_TOPICS.includes(t)).length

  const empathy = clamp(
    35 + (empathic ? 30 : 0) + (intent.hasReassurance ? 15 : 0) + (intent.hasNormalizingBridge ? 20 : 0) - (judgmental ? 45 : 0)
  )
  const clarity = clamp(
    52 + (explained ? 25 : 0) - audio.fillerWordRate * 120 - audio.hesitationCount * 5 - (wordCount < 3 ? 20 : 0)
  )
  const openQuestionQuality = clamp(
    28 + (open ? 42 : 0) + (intent.rawText.includes('?') && wordCount > 6 ? 16 : 0) - (wordCount < 5 && !open ? 18 : 0)
  )
  const judgmentRisk = clamp((judgmental ? 75 : 10) + (rushed ? 15 : 0) - (intent.hasNormalizingBridge ? 20 : 0))
  const confidence = clamp(82 - audio.hesitationCount * 8 - audio.fillerWordCount * 6 - audio.longPauseCount * 5)
  const listening = clamp(42 + (empathic ? 22 : 0) + (intent.hasReassurance ? 12 : 0) + (explained ? 10 : 0))
  const clinicalRelevance = clamp(clinicalHits > 0 ? 62 + clinicalHits * 8 : 24)

  return { empathy, clarity, openQuestionQuality, judgmentRisk, confidence, listening, clinicalRelevance }
}

/** Running average so the panel reflects the whole encounter, not just the last line. */
export function mergeSignals(prev: CommSignals, next: CommSignals, n: number): CommSignals {
  const avg = (a: number, b: number) => Math.round((a * n + b) / (n + 1))
  return {
    empathy: avg(prev.empathy, next.empathy),
    clarity: avg(prev.clarity, next.clarity),
    openQuestionQuality: avg(prev.openQuestionQuality, next.openQuestionQuality),
    judgmentRisk: avg(prev.judgmentRisk, next.judgmentRisk),
    confidence: avg(prev.confidence, next.confidence),
    listening: avg(prev.listening, next.listening),
    clinicalRelevance: avg(prev.clinicalRelevance, next.clinicalRelevance),
  }
}
