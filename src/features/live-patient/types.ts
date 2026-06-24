import type { HiddenConcernState, IntentTopic } from '@/types'

/** Continuous patient meters (0-100) that drive the live cockpit feel. */
export interface PatientMeters {
  trust: number
  anxiety: number
  openness: number
  painDistress: number
  confusion: number
  hiddenConcernProgress: number
  hiddenConcernRevealed: boolean
}

/** Per-encounter communication signals (running average, 0-100). */
export interface CommSignals {
  empathy: number
  clarity: number
  openQuestionQuality: number
  judgmentRisk: number
  confidence: number
  listening: number
  clinicalRelevance: number
}

export type PatientEmotion =
  | 'guarded'
  | 'anxious'
  | 'relieved'
  | 'confused'
  | 'cooperative'

export type RoomPhase = 'idle' | 'listening' | 'processing' | 'patient-speaking' | 'debrief'

export type ScoringEventType =
  | 'trust_up'
  | 'trust_down'
  | 'hidden_concern_progress'
  | 'missed_opportunity'
  | 'concern_revealed'

export type EventSentiment = 'good' | 'warning' | 'unlock' | 'neutral'

export interface ScoringEvent {
  id: string
  t: number
  type: ScoringEventType
  message: string
  sentiment: EventSentiment
}

export interface LiveTurn {
  id: string
  role: 'clinician' | 'patient'
  text: string
  t: number
  emotion?: PatientEmotion
}

/** Visual driver for the avatar. Only `fallback` is used browser-side; the others
 *  are reserved for the optional local lip-sync video upgrade. */
export type AvatarMode = 'fallback' | 'sadtalker' | 'wav2lip' | 'musetalk'

export interface RuntimeStatus {
  online: boolean
  llm: 'mock' | 'ollama' | 'lmstudio'
  stt: 'browser' | 'whisper' | 'mock'
  tts: 'browser' | 'kokoro'
  avatar: AvatarMode
}

export interface EncounterFlags {
  introducedSelf: boolean
  usedNormalizing: boolean
  judgmentalAttempt: boolean
  empathyUsed: boolean
  confidentialityUsed: boolean
  closureUsed: boolean
  redFlagsAsked: boolean
}

export interface DebriefResult {
  overallScore: number
  overallMax: number
  communicationScore: number
  summary: string
  strengths: string[]
  missedOpportunities: string[]
  trustTimeline: { t: number; value: number }[]
  hiddenConcernOutcome: HiddenConcernState
  suggestedPhrases: string[]
  rubric: { id: string; label: string; earned: number; max: number; evidence: string; missed?: string }[]
}

export type { HiddenConcernState, IntentTopic }
