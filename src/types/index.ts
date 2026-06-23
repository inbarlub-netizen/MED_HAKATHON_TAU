/* ============ ClinFlight OS - Domain Types ============ */

export type Specialty =
  | 'Internal Medicine'
  | 'Emergency Medicine'
  | 'OB-GYN'
  | 'Geriatrics'
  | 'Pulmonology'
  | 'Pediatrics'
  | 'Psychiatry'

export type Persona =
  | 'anxious'
  | 'guarded'
  | 'embarrassed'
  | 'confused-elderly'
  | 'low-health-literacy'
  | 'talkative'
  | 'skeptical'
  | 'cooperative'
  | 'stoic'

export type EmotionalState = 'calm' | 'guarded' | 'open' | 'anxious' | 'defensive' | 'reassured'

/* ---- Intent ---- */
export type IntentTopic =
  | 'open_question'
  | 'symptom_history'
  | 'onset_duration'
  | 'associated_symptoms'
  | 'red_flags'
  | 'medications'
  | 'medication_adherence'
  | 'allergies'
  | 'social_history'
  | 'substance_use'
  | 'sexual_history'
  | 'pregnancy'
  | 'empathy'
  | 'reassurance'
  | 'confidentiality'
  | 'explanation'
  | 'closure'
  | 'differential'
  | 'management_plan'
  | 'introduction'
  | 'unknown'

export type Tone =
  | 'empathetic'
  | 'neutral'
  | 'judgmental'
  | 'rushed'
  | 'unclear'
  | 'patient_centered'

export interface IntentResult {
  topics: IntentTopic[]
  tone: Tone
  nonjudgmental: boolean
  hasConfidentiality: boolean
  hasReassurance: boolean
  hasNormalizingBridge: boolean
  introducedSelf: boolean
  rawText: string
}

/* ---- Hidden Concern ---- */
export type HiddenConcernState =
  | 'locked'
  | 'clue_given'
  | 'partially_revealed'
  | 'fully_revealed'
  | 'missed'
  | 'addressed_with_empathy'

export interface HiddenConcern {
  id: string
  label: string
  description: string
  /** topic that must be addressed to unlock */
  requiredTopic: IntentTopic
  requiresNonjudgmental: boolean
  requiresConfidentiality?: boolean
  clueResponse: string
  guardedResponse: string
  partialResponse: string
  revealResponse: string
}

/* ---- Disclosure rules ---- */
export interface DisclosureRule {
  /** topic(s) that trigger this fact */
  topics: IntentTopic[]
  response: string
  /** if true, only reveals when tone is acceptable */
  requiresGoodTone?: boolean
  guardedResponse?: string
}

/* ---- Patient & Case ---- */
export interface Vitals {
  bp: string
  hr: number
  rr: number
  temp: number
  o2: number
  pain: number
}

export interface PatientProfile {
  name: string
  age: number
  sex: 'male' | 'female'
  chiefComplaint: string
  persona: Persona
  personaLabel: string
  healthLiteracy: 'low' | 'moderate' | 'high'
  recallReliability: 'low' | 'moderate' | 'high'
  baselineVitals: Vitals
  openingLine: string
}

export interface Measurement {
  id: string
  label: string
  category: 'vitals' | 'exam' | 'lab' | 'imaging' | 'review'
  result: string
  interpretation: 'normal' | 'abnormal' | 'key' | 'info'
  indicated: boolean // counts toward good test selection
  unlockedByHiddenConcern?: boolean
}

export interface RubricItemDef {
  id: string
  label: string
  category: string
  max: number
}

export interface ClinicalCase {
  id: string
  title: string
  specialty: Specialty
  secondarySpecialty?: Specialty
  difficulty: 'Intro' | 'Intermediate' | 'Advanced'
  simulatedMinutes: number
  summary: string
  learningObjectives: string[]
  targetSkills: string[]
  patient: PatientProfile
  disclosures: DisclosureRule[]
  hiddenConcern: HiddenConcern
  measurements: Measurement[]
  expectedDifferential: string[]
  cannotMiss: string
  expectedPlan: string[]
  status: 'live' | 'preview'
}

/* ---- Session / Replay ---- */
export type ReplayCategory =
  | 'communication'
  | 'hidden_concern'
  | 'tests'
  | 'red_flags'
  | 'scoring'
  | 'voice'
  | 'reasoning'

export type ReplaySentiment = 'good' | 'missed' | 'warning' | 'neutral' | 'unlock'

export interface ReplayEvent {
  id: string
  t: number // seconds into encounter
  category: ReplayCategory
  sentiment: ReplaySentiment
  title: string
  detail: string
  why: string
  rubricImpact?: string
  coaching?: string
  studentText?: string
  patientText?: string
}

export interface TranscriptTurn {
  id: string
  role: 'student' | 'patient' | 'system'
  text: string
  t: number
  intent?: IntentResult
  trustDelta?: number
  presenceDelta?: number
  audio?: AudioMetrics
  toneLabel?: Tone
  /** analysis attached to a student turn for the live AI panel */
  hiddenSentiment?: ReplaySentiment
  hiddenStateAfter?: HiddenConcernState
  coach?: string
}

/* ---- Scoring ---- */
export interface RubricScore {
  id: string
  label: string
  earned: number
  max: number
  evidence: string
  missed?: string
  suggestion?: string
}

export interface EpaScore {
  id: string
  label: string
  level: 1 | 2 | 3 | 4 | 5
  note: string
}

export interface OsceResult {
  total: number
  max: number
  items: RubricScore[]
  epas: EpaScore[]
  trust: number
  presence: number
  presenceSub: { label: string; value: number }[]
  communication: number
  hiddenConcern: HiddenConcernState
  summary: string
}

/* ---- Audio metrics ---- */
export interface AudioMetrics {
  speechRateWpm: number
  pauseRatio: number
  longPauseCount: number
  averagePauseMs: number
  fillerWordCount: number
  fillerWordRate: number
  hesitationCount: number
  volumeStability: number
  averageVolume: number
  responseLatency: number
  durationSec: number
  simulated: boolean
}

/* ---- People ---- */
export interface CompetencyPoint {
  skill: string
  value: number
}

export interface StudentProfile {
  id: string
  name: string
  year: string
  rotation: string
  cohort: string
  avatarInitials: string
  casesCompleted: number
  avgOsce: number
  osceTrend: { label: string; score: number }[]
  competencies: CompetencyPoint[]
  weakSkills: string[]
  strongSkills: string[]
  hiddenConcernRate: number
  empathyScore: number
  trustTrend: { label: string; value: number }[]
  presenceTrend: { label: string; value: number }[]
  redFlagScore: number
  testEfficiency: number
  recommendedCaseId: string
  detectedWeakness: string[]
  replayLibrary: { id: string; caseTitle: string; date: string; score: number }[]
  feedbackHistory: { instructor: string; date: string; note: string }[]
}

export interface Instructor {
  id: string
  name: string
  title: string
  load: number // 0-100 teaching load
  specialties: Specialty[]
}

export interface CohortInsight {
  id: string
  cohort: string
  size: number
  casesCompleted: number
  avgOsce: number
  hiddenConcernRate: number
  redFlagMissRate: number
  unnecessaryTestRate: number
  trustTrend: { label: string; value: number }[]
  presenceTrend: { label: string; value: number }[]
  skillHeatmap: { skill: string; mastery: number }[]
  gaps: { title: string; detail: string; severity: 'high' | 'medium' | 'low' }[]
  caseCoverage: { type: string; covered: number }[]
}
