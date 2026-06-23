import { create } from 'zustand'
import type {
  ClinicalCase,
  EmotionalState,
  HiddenConcernState,
  IntentTopic,
  OsceResult,
  ReplayEvent,
  TranscriptTurn,
} from '@/types'
import { classifyIntent } from '@/engine/intentClassifier'
import { evaluateCommunication } from '@/engine/communicationEngine'
import { patientRespond } from '@/engine/patientAgent'
import { computeAudioMetrics } from '@/engine/audioMetricsEngine'
import { coachAfterTurn, type CoachTip } from '@/engine/coachEngine'
import { scoreEncounter, type ReasoningSubmission } from '@/engine/scoringEngine'
import { clamp } from '@/lib/utils'

type Mode = 'practice' | 'exam' | 'coaching'

interface PresenceSub {
  calmLeadership: number
  verbalStructure: number
  clarity: number
  empathy: number
  nonjudgmental: number
  reassurance: number
}

interface Flags {
  introducedSelf: boolean
  usedNormalizing: boolean
  judgmentalAttempt: boolean
  empathyUsed: boolean
  confidentialityUsed: boolean
  closureUsed: boolean
  redFlagsAsked: boolean
}

interface SessionState {
  c: ClinicalCase | null
  started: boolean
  mode: Mode
  accessibilityMode: boolean
  fluencyScoring: boolean
  patientTts: boolean

  transcript: TranscriptTurn[]
  trust: number
  presence: number
  presenceSub: PresenceSub
  emotion: EmotionalState
  hiddenState: HiddenConcernState
  coveredTopics: IntentTopic[]
  flags: Flags
  orderedMeasurements: string[]
  replay: ReplayEvent[]
  coachTip: CoachTip | null
  elapsed: number

  reasoning: ReasoningSubmission | null
  result: OsceResult | null

  /** patient turn computed but not yet revealed (for two-phase pacing) */
  pendingPatient: TranscriptTurn | null
  patientTyping: boolean

  start: (c: ClinicalCase) => void
  ask: (text: string, durationSec?: number) => void
  /** add the student turn + compute everything, but defer the patient reply */
  askStudent: (text: string, durationSec?: number) => void
  /** reveal the deferred patient reply; returns its text */
  flushPatient: () => string
  order: (id: string) => void
  setMode: (m: Mode) => void
  toggleAccessibility: (v: boolean) => void
  toggleFluency: (v: boolean) => void
  togglePatientTts: (v: boolean) => void
  submitReasoning: (r: ReasoningSubmission) => void
  finish: () => OsceResult
  reset: () => void
}

const INITIAL_PRESENCE: PresenceSub = {
  calmLeadership: 58,
  verbalStructure: 55,
  clarity: 60,
  empathy: 62,
  nonjudgmental: 60,
  reassurance: 55,
}

let uid = 0
const nid = (p: string) => `${p}-${++uid}`

function presenceAvg(p: PresenceSub) {
  const vals = Object.values(p)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export const useSession = create<SessionState>((set, get) => ({
  c: null,
  started: false,
  mode: 'practice',
  accessibilityMode: false,
  fluencyScoring: true,
  patientTts: true,

  transcript: [],
  trust: 60,
  presence: presenceAvg(INITIAL_PRESENCE),
  presenceSub: { ...INITIAL_PRESENCE },
  emotion: 'calm',
  hiddenState: 'locked',
  coveredTopics: [],
  flags: {
    introducedSelf: false,
    usedNormalizing: false,
    judgmentalAttempt: false,
    empathyUsed: false,
    confidentialityUsed: false,
    closureUsed: false,
    redFlagsAsked: false,
  },
  orderedMeasurements: [],
  replay: [],
  coachTip: null,
  elapsed: 0,
  reasoning: null,
  result: null,
  pendingPatient: null,
  patientTyping: false,

  start: (c) =>
    set({
      c,
      started: true,
      pendingPatient: null,
      patientTyping: false,
      transcript: [
        {
          id: nid('t'),
          role: 'patient',
          text: c.patient.openingLine,
          t: 0,
        },
      ],
      trust: 60,
      presence: presenceAvg(INITIAL_PRESENCE),
      presenceSub: { ...INITIAL_PRESENCE },
      emotion: 'calm',
      hiddenState: 'locked',
      coveredTopics: [],
      flags: {
        introducedSelf: false,
        usedNormalizing: false,
        judgmentalAttempt: false,
        empathyUsed: false,
        confidentialityUsed: false,
        closureUsed: false,
        redFlagsAsked: false,
      },
      orderedMeasurements: [],
      replay: [],
      coachTip: null,
      elapsed: 0,
      reasoning: null,
      result: null,
    }),

  ask: (text, durationSec) => {
    get().askStudent(text, durationSec)
    get().flushPatient()
  },

  flushPatient: () => {
    const s = get()
    if (!s.pendingPatient) return ''
    set({
      transcript: [...s.transcript, s.pendingPatient],
      pendingPatient: null,
      patientTyping: false,
    })
    return s.pendingPatient.text
  },

  askStudent: (text, durationSec) => {
    const s = get()
    if (!s.c || !text.trim()) return
    const t = s.elapsed + 8 + Math.round(Math.random() * 6)

    const intent = classifyIntent(text)
    const comm = evaluateCommunication(intent)
    const audio = computeAudioMetrics(text, durationSec)

    // Apply presence subscores (skip fluency penalties in accessibility mode).
    const fluencyOn = s.fluencyScoring && !s.accessibilityMode
    const presenceSub: PresenceSub = {
      calmLeadership: clamp(s.presenceSub.calmLeadership + comm.presence.calmLeadership),
      verbalStructure: clamp(s.presenceSub.verbalStructure + comm.presence.verbalStructure),
      clarity: clamp(
        s.presenceSub.clarity + comm.presence.clarity - (fluencyOn && audio.fillerWordCount > 2 ? 3 : 0)
      ),
      empathy: clamp(s.presenceSub.empathy + comm.presence.empathy),
      nonjudgmental: clamp(s.presenceSub.nonjudgmental + comm.presence.nonjudgmental),
      reassurance: clamp(s.presenceSub.reassurance + comm.presence.reassurance),
    }
    const presence = presenceAvg(presenceSub)
    const trust = clamp(s.trust + comm.trustDelta)

    // Patient response (hidden concern + disclosure).
    const pt = patientRespond(s.c, intent, s.hiddenState, s.emotion)

    // Live coaching for this turn (also drives the AI analysis panel).
    const coachTip = coachAfterTurn(intent, pt.hiddenConcernState, s.transcript.length)

    // Build transcript turns.
    const studentTurn: TranscriptTurn = {
      id: nid('t'),
      role: 'student',
      text,
      t,
      intent,
      trustDelta: comm.trustDelta,
      presenceDelta: presence - s.presence,
      audio,
      toneLabel: intent.tone,
      hiddenSentiment: pt.hiddenConcernSentiment,
      hiddenStateAfter: pt.hiddenConcernState,
      coach: coachTip?.text,
    }
    const patientTurn: TranscriptTurn = {
      id: nid('t'),
      role: 'patient',
      text: pt.text,
      t: t + 2,
    }

    // Update flags.
    const flags: Flags = {
      introducedSelf: s.flags.introducedSelf || intent.introducedSelf,
      usedNormalizing: s.flags.usedNormalizing || intent.hasNormalizingBridge,
      judgmentalAttempt: s.flags.judgmentalAttempt || intent.tone === 'judgmental',
      empathyUsed: s.flags.empathyUsed || intent.topics.includes('empathy'),
      confidentialityUsed: s.flags.confidentialityUsed || intent.hasConfidentiality,
      closureUsed: s.flags.closureUsed || intent.topics.includes('closure'),
      redFlagsAsked: s.flags.redFlagsAsked || intent.topics.includes('red_flags'),
    }

    const coveredTopics = Array.from(new Set([...s.coveredTopics, ...intent.topics]))

    // Replay events.
    const newEvents: ReplayEvent[] = []
    if (intent.tone === 'judgmental') {
      newEvents.push({
        id: nid('r'),
        t,
        category: 'communication',
        sentiment: 'missed',
        title: 'Judgmental phrasing',
        detail: `"${text}"`,
        why: 'Sensitive questions asked without a normalizing bridge make patients defensive.',
        rubricImpact: 'Communication −, Patient Trust −',
        coaching: 'Lead with: "Many people stop or change medications because of side effects…"',
        studentText: text,
        patientText: pt.text,
      })
    } else if (intent.hasNormalizingBridge) {
      newEvents.push({
        id: nid('r'),
        t,
        category: 'communication',
        sentiment: 'good',
        title: 'Normalizing bridge',
        detail: `"${text}"`,
        why: 'Normalizing a sensitive topic lowers shame and invites disclosure.',
        rubricImpact: 'Communication +, Patient Trust +',
        studentText: text,
        patientText: pt.text,
      })
    }
    if (pt.hiddenConcernSentiment === 'unlock') {
      newEvents.push({
        id: nid('r'),
        t: t + 2,
        category: 'hidden_concern',
        sentiment: 'unlock',
        title: 'Hidden concern unlocked',
        detail: s.c.hiddenConcern.label,
        why: 'The patient disclosed the concealed information after safe, nonjudgmental questioning.',
        rubricImpact: 'Hidden concern +15',
        studentText: text,
        patientText: pt.text,
      })
    } else if (pt.hiddenConcernSentiment === 'warning') {
      newEvents.push({
        id: nid('r'),
        t: t + 2,
        category: 'hidden_concern',
        sentiment: 'warning',
        title: 'Patient became guarded',
        detail: 'Hidden concern stayed locked',
        why: 'The phrasing made the patient defensive, so the concealed information was withheld.',
        coaching: 'Rephrase nonjudgmentally and try again.',
        studentText: text,
        patientText: pt.text,
      })
    } else if (pt.hiddenConcernSentiment === 'good') {
      newEvents.push({
        id: nid('r'),
        t: t + 2,
        category: 'hidden_concern',
        sentiment: 'good',
        title: 'Patient hinted',
        detail: 'Partial disclosure',
        why: 'You are on the right topic - a gentle follow-up can complete the disclosure.',
        studentText: text,
        patientText: pt.text,
      })
    }
    if (intent.topics.includes('red_flags')) {
      newEvents.push({
        id: nid('r'),
        t,
        category: 'red_flags',
        sentiment: 'good',
        title: 'Red-flag screen',
        detail: 'Asked about neuro / cannot-miss features',
        why: 'Screening the cannot-miss diagnosis is essential for safety.',
        rubricImpact: 'Red flags +',
        studentText: text,
      })
    }

    set({
      transcript: [...s.transcript, studentTurn],
      pendingPatient: patientTurn,
      patientTyping: true,
      trust,
      presence,
      presenceSub,
      emotion: pt.emotion,
      hiddenState: pt.hiddenConcernState,
      coveredTopics,
      flags,
      replay: [...s.replay, ...newEvents],
      coachTip,
      elapsed: t + 2,
    })
  },

  order: (id) => {
    const s = get()
    if (!s.c || s.orderedMeasurements.includes(id)) return
    const m = s.c.measurements.find((x) => x.id === id)
    if (!m) return
    const ev: ReplayEvent = {
      id: nid('r'),
      t: s.elapsed + 4,
      category: 'tests',
      sentiment: m.indicated ? 'good' : 'warning',
      title: m.indicated ? `Ordered ${m.label}` : `Low-yield: ${m.label}`,
      detail: m.result,
      why: m.indicated
        ? 'An indicated investigation that advances the diagnosis safely.'
        : 'Low-yield given the presentation - counts against test efficiency.',
      rubricImpact: m.indicated ? 'Tests +' : 'Test efficiency −',
    }
    set({
      orderedMeasurements: [...s.orderedMeasurements, id],
      replay: [...s.replay, ev],
      elapsed: s.elapsed + 4,
    })
  },

  setMode: (mode) => set({ mode }),
  toggleAccessibility: (accessibilityMode) => set({ accessibilityMode }),
  toggleFluency: (fluencyScoring) => set({ fluencyScoring }),
  togglePatientTts: (patientTts) => set({ patientTts }),

  submitReasoning: (reasoning) => {
    const s = get()
    set({ reasoning })
    if (s.c) {
      const ev: ReplayEvent = {
        id: nid('r'),
        t: s.elapsed + 4,
        category: 'reasoning',
        sentiment: 'good',
        title: 'Clinical reasoning submitted',
        detail: reasoning.summary || 'Differential & plan submitted',
        why: 'Synthesis of the encounter into a prioritized differential and plan.',
      }
      set({ replay: [...s.replay, ev], elapsed: s.elapsed + 4 })
    }
  },

  finish: () => {
    const s = get()
    if (!s.c) throw new Error('No case')
    const result = scoreEncounter({
      c: s.c,
      coveredTopics: s.coveredTopics,
      flags: s.flags,
      hiddenState: s.hiddenState,
      orderedMeasurements: s.orderedMeasurements,
      trust: s.trust,
      presence: s.presence,
      presenceSub: [
        { label: 'Calm Leadership', value: s.presenceSub.calmLeadership },
        { label: 'Verbal Structure', value: s.presenceSub.verbalStructure },
        { label: 'Clarity', value: s.presenceSub.clarity },
        { label: 'Empathy', value: s.presenceSub.empathy },
        { label: 'Nonjudgmental Delivery', value: s.presenceSub.nonjudgmental },
        { label: 'Patient Reassurance', value: s.presenceSub.reassurance },
      ],
      reasoning: s.reasoning ?? undefined,
    })
    const ev: ReplayEvent = {
      id: nid('r'),
      t: s.elapsed + 4,
      category: 'scoring',
      sentiment: result.total >= 70 ? 'good' : 'neutral',
      title: `OSCE score: ${result.total}/${result.max}`,
      detail: result.summary,
      why: 'Formative OSCE-style score across seven domains.',
    }
    set({ result, replay: [...s.replay, ev] })
    return result
  },

  reset: () =>
    set({
      c: null,
      started: false,
      transcript: [],
      result: null,
      reasoning: null,
      replay: [],
      coachTip: null,
    }),
}))
