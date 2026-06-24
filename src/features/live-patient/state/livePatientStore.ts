import { create } from 'zustand'
import type { ClinicalCase, EmotionalState, HiddenConcernState, IntentTopic } from '@/types'
import { classifyIntent } from '@/engine/intentClassifier'
import { patientRespond } from '@/engine/patientAgent'
import { computeAudioMetrics } from '@/engine/audioMetricsEngine'
import { elderlyDizzinessAdherence } from '@/data/cases'
import { demoScenarios } from '@/data/demoScenarios'
import { applyTurn, emotionFromState, initialMeters } from '../engine/patientStateMachine'
import { emptySignals, mergeSignals, scoreTurn } from '../engine/communicationScoring'
import { buildDebrief } from '../engine/debriefAdapter'
import { BROWSER_RUNTIME, checkRuntime } from '../engine/runtimeClient'
import { primeAudio } from '../engine/audioController'
import { playMedia, stopMedia } from '../engine/mediaController'
import type {
  CommSignals,
  DebriefResult,
  EncounterFlags,
  LiveTurn,
  PatientEmotion,
  PatientMeters,
  RoomPhase,
  RuntimeStatus,
  ScoringEvent,
} from '../types'

const CASE: ClinicalCase = elderlyDizzinessAdherence

function emptyFlags(): EncounterFlags {
  return {
    introducedSelf: false,
    usedNormalizing: false,
    judgmentalAttempt: false,
    empathyUsed: false,
    confidentialityUsed: false,
    closureUsed: false,
    redFlagsAsked: false,
  }
}

interface LivePatientState {
  started: boolean
  phase: RoomPhase
  processing: boolean
  meters: PatientMeters
  prevTrust: number
  signals: CommSignals
  turnCount: number
  hiddenState: HiddenConcernState
  emotionalState: EmotionalState
  emotion: PatientEmotion
  turns: LiveTurn[]
  events: ScoringEvent[]
  coveredTopics: IntentTopic[]
  flags: EncounterFlags
  trustTimeline: { t: number; value: number }[]
  runtime: RuntimeStatus
  debrief: DebriefResult | null
  startedAt: number

  isAutoPlaying: boolean
  start: () => void
  submitClinician: (text: string) => Promise<void>
  playDemo: () => Promise<void>
  stopDemo: () => void
  endCase: () => void
  reset: () => void
  refreshRuntime: () => Promise<void>
}

const now = () => Date.now()

export const useLivePatient = create<LivePatientState>((set, get) => ({
  started: false,
  isAutoPlaying: false,
  phase: 'idle',
  processing: false,
  meters: initialMeters(),
  prevTrust: initialMeters().trust,
  signals: emptySignals(),
  turnCount: 0,
  hiddenState: 'locked',
  emotionalState: 'anxious',
  emotion: 'anxious',
  turns: [],
  events: [],
  coveredTopics: [],
  flags: emptyFlags(),
  trustTimeline: [],
  runtime: BROWSER_RUNTIME,
  debrief: null,
  startedAt: 0,

  start: () => {
    if (get().started) return
    primeAudio()
    const startedAt = now()
    const opening: LiveTurn = {
      id: 'patient-opening',
      role: 'patient',
      text: CASE.patient.openingLine,
      t: 0,
      emotion: 'anxious',
    }
    set({
      started: true,
      phase: 'patient-speaking',
      startedAt,
      turns: [opening],
      trustTimeline: [{ t: 0, value: initialMeters().trust }],
    })
    void playMedia(CASE.patient.openingLine).then(() => {
      if (get().phase === 'patient-speaking') set({ phase: 'listening' })
    })
  },

  submitClinician: async (raw: string) => {
    const text = raw.trim()
    const st = get()
    if (!text || st.processing || st.phase === 'debrief') return

    set({ processing: true, phase: 'processing' })
    const t = Math.round((now() - st.startedAt) / 1000)

    const intent = classifyIntent(text)
    const audio = computeAudioMetrics(text)

    // Authoritative patient turn (scripted, persona-consistent, voiced where available).
    const turn = patientRespond(CASE, intent, st.hiddenState, st.emotionalState)

    const { meters, events } = applyTurn(
      st.meters,
      {
        intent,
        hiddenState: turn.hiddenConcernState,
        hiddenChanged: turn.hiddenConcernChanged,
        hiddenSentiment: turn.hiddenConcernSentiment,
      },
      t
    )

    const signals = mergeSignals(st.signals, scoreTurn(intent, audio), st.turnCount)
    const emotion = emotionFromState(meters, turn.hiddenConcernState)

    const coveredTopics = Array.from(new Set([...st.coveredTopics, ...intent.topics]))
    const flags: EncounterFlags = {
      introducedSelf: st.flags.introducedSelf || intent.introducedSelf,
      usedNormalizing: st.flags.usedNormalizing || intent.hasNormalizingBridge,
      judgmentalAttempt: st.flags.judgmentalAttempt || intent.tone === 'judgmental',
      empathyUsed: st.flags.empathyUsed || intent.topics.includes('empathy') || intent.hasReassurance,
      confidentialityUsed: st.flags.confidentialityUsed || intent.hasConfidentiality,
      closureUsed: st.flags.closureUsed || intent.topics.includes('closure'),
      redFlagsAsked: st.flags.redFlagsAsked || intent.topics.includes('red_flags'),
    }

    const clinicianTurn: LiveTurn = { id: `c-${now()}`, role: 'clinician', text, t }
    set({
      turns: [...st.turns, clinicianTurn],
      meters,
      prevTrust: st.meters.trust,
      signals,
      turnCount: st.turnCount + 1,
      coveredTopics,
      flags,
      hiddenState: turn.hiddenConcernState,
      emotionalState: turn.emotion,
      events: [...events, ...st.events],
      trustTimeline: [...st.trustTimeline, { t, value: meters.trust }],
    })

    // Brief "David is thinking" beat, then the patient speaks.
    await wait(650)
    if (get().phase === 'debrief') {
      set({ processing: false })
      return
    }
    const patientTurn: LiveTurn = { id: `p-${now()}`, role: 'patient', text: turn.text, t: t + 1, emotion }
    set({ turns: [...get().turns, patientTurn], emotion, phase: 'patient-speaking' })

    await playMedia(turn.text)
    if (get().phase === 'patient-speaking') set({ phase: 'listening' })
    set({ processing: false })
  },

  playDemo: async () => {
    if (get().isAutoPlaying || get().phase === 'debrief') return
    set({ isAutoPlaying: true })

    if (!get().started) get().start()

    // Wait for David's opening line to finish (phase goes idle→patient-speaking→listening)
    let waited = 0
    while (get().phase !== 'listening' && waited < 10000) {
      await wait(200)
      waited += 200
    }

    const phrases = demoScenarios[0].steps
      .filter((s) => s.kind === 'say')
      .map((s) => s.text!)

    for (const phrase of phrases) {
      if (!get().isAutoPlaying || get().phase === 'debrief') break
      await get().submitClinician(phrase)
      await wait(1200)
    }

    if (get().isAutoPlaying) get().endCase()
    set({ isAutoPlaying: false })
  },

  stopDemo: () => {
    set({ isAutoPlaying: false })
  },

  endCase: () => {
    stopMedia()
    const st = get()
    const debrief = buildDebrief({
      c: CASE,
      meters: st.meters,
      signals: st.signals,
      hiddenState: st.hiddenState,
      coveredTopics: st.coveredTopics,
      flags: st.flags,
      events: st.events,
      trustTimeline: st.trustTimeline,
    })
    set({ debrief, phase: 'debrief' })
  },

  reset: () => {
    stopMedia()
    set({
      started: false,
      isAutoPlaying: false,
      phase: 'idle',
      processing: false,
      meters: initialMeters(),
      prevTrust: initialMeters().trust,
      signals: emptySignals(),
      turnCount: 0,
      hiddenState: 'locked',
      emotionalState: 'anxious',
      emotion: 'anxious',
      turns: [],
      events: [],
      coveredTopics: [],
      flags: emptyFlags(),
      trustTimeline: [],
      debrief: null,
      startedAt: 0,
    })
  },

  refreshRuntime: async () => {
    const runtime = await checkRuntime()
    set({ runtime })
  },
}))

export { CASE as liveCase }

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
