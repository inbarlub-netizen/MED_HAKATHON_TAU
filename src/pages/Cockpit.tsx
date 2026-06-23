import { useEffect, useRef, useState } from 'react'
import type * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Mic,
  Send,
  User,
  Activity,
  Stethoscope,
  FlaskConical,
  ScanLine,
  ClipboardList,
  Lightbulb,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plane,
  Accessibility,
  Play,
  Square,
  Clapperboard,
  ArrowRight,
  Brain,
  Volume1,
  Waves,
  TrendingUp,
  TrendingDown,
  Unlock,
  Award,
  RotateCcw,
  X,
  PartyPopper,
  Presentation,
  Building2,
  MessageCircle,
  ShieldAlert as ShieldAlertIcon,
} from 'lucide-react'
import { useSession } from '@/store/session'
import { useVoiceCapture, speak } from '@/hooks/useVoiceCapture'
import { playPatientVoice, stopPatientVoice, unlockAudio, hasVoice, playVoiceAwait } from '@/lib/voice'
import { elderlyDizzinessAdherence } from '@/data/cases'
import { DEMO_PHRASES, STARTER_PROMPTS } from '@/engine/coachEngine'
import { demoScenarios, type DemoScenario, type ScenarioStep } from '@/data/demoScenarios'
import { Card, CardHeader, Badge, Button } from '@/components/ui/primitives'
import { Tabs, TabsList, TabsTrigger, TabsContent, Switch, Tip } from '@/components/ui/radix'
import { ScoreMeter, HiddenConcernChip, Waveform, RadialScore } from '@/components/common/Scores'
import { cn } from '@/lib/utils'
import type { IntentTopic } from '@/types'

const OSCE_TRACK: { id: IntentTopic | 'physical_exam' | 'test_selection'; label: string }[] = [
  { id: 'open_question', label: 'Chief complaint' },
  { id: 'symptom_history', label: 'HPI structure' },
  { id: 'red_flags', label: 'Red flags' },
  { id: 'medications', label: 'Medication history' },
  { id: 'allergies', label: 'Allergy history' },
  { id: 'social_history', label: 'Social history' },
  { id: 'empathy', label: 'Empathy' },
  { id: 'physical_exam', label: 'Physical exam' },
  { id: 'test_selection', label: 'Test selection' },
  { id: 'differential', label: 'Differential' },
  { id: 'medication_adherence', label: 'Hidden concern' },
  { id: 'management_plan', label: 'Management plan' },
  { id: 'closure', label: 'Closure / safety netting' },
]

export default function Cockpit() {
  const s = useSession()
  const navigate = useNavigate()

  // Auto-start the David case if arriving directly.
  useEffect(() => {
    if (!s.started) s.start(elderlyDizzinessAdherence)
    return () => stopPatientVoice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!s.c) return null
  const c = s.c

  return (
    <div className="space-y-4">
      <TopBar />
      <PresenterMode onOpenReplay={() => navigate('/debrief')} onOpenFaculty={() => navigate('/faculty')} />
      <ScenarioBar />
      <div className="grid gap-4 xl:grid-cols-[300px_1fr_320px]">
        <LeftColumn />
        <CenterColumn onFinish={() => navigate('/debrief')} />
        <RightColumn />
      </div>
      <EncounterSummary onOpenDebrief={() => navigate('/debrief')} />
    </div>
  )
}

/* ===================== END-OF-ENCOUNTER ANIMATED DEBRIEF ===================== */
function EncounterSummary({ onOpenDebrief }: { onOpenDebrief: () => void }) {
  const result = useSession((s) => s.result)
  const caseTitle = useSession((s) => s.c?.title)
  const [open, setOpen] = useState(false)
  const prev = useRef(false)

  useEffect(() => {
    if (result && !prev.current) setOpen(true)
    prev.current = !!result
  }, [result])

  if (!result) return null
  const pct = Math.round((result.total / result.max) * 100)
  const grade = pct >= 80 ? 'Excellent' : pct >= 65 ? 'Strong' : pct >= 45 ? 'Developing' : 'Keep practicing'
  const strengths = result.items.filter((i) => i.earned / i.max >= 0.7)
  const improvements = result.items.filter((i) => i.suggestion || i.missed)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-ink-900/80 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-ink-800/95 p-6 shadow-2xl sm:p-8"
          >
            {/* animated glow */}
            <motion.div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 blur-3xl"
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200">
              <X size={18} />
            </button>

            {/* Header + score */}
            <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
              <RadialScore value={result.total} max={result.max} size={150} label="OSCE" sublabel={`of ${result.max}`} tone={pct >= 65 ? 'cyan' : 'warning'} />
              <div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-2 sm:justify-start">
                  <PartyPopper size={18} className="text-cyan-300" />
                  <span className="label-eyebrow">Encounter complete</span>
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-1 text-2xl font-bold tracking-tight text-slate-100">
                  {grade} - {pct}%
                </motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36 }} className="mt-1 max-w-md text-sm text-slate-400">
                  {result.summary}
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }} className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <HiddenConcernChip state={result.hiddenConcern} />
                  <Badge tone="cyan">Trust {Math.round(result.trust)}</Badge>
                  <Badge tone="violet">Presence {Math.round(result.presence)}</Badge>
                </motion.div>
              </div>
            </div>

            {/* Strengths + improvements */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SummaryColumn
                title="What went well"
                icon={<CheckCircle2 size={15} className="text-emerald-400" />}
                tone="emerald"
                items={strengths.map((i) => ({ label: i.label, text: i.evidence }))}
                empty="Build more of the checklist next time."
                baseDelay={0.5}
              />
              <SummaryColumn
                title="How to improve"
                icon={<Lightbulb size={15} className="text-amber-300" />}
                tone="amber"
                items={improvements.map((i) => ({ label: i.label, text: i.suggestion || i.missed || '' }))}
                empty="Outstanding - nothing major to fix."
                baseDelay={0.5}
              />
            </div>

            {/* EPA chips */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Award size={14} className="text-cyan-300" /> Entrustable Professional Activities
              </div>
              <div className="flex flex-wrap gap-2">
                {result.epas.map((e) => (
                  <span key={e.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                    {e.id}
                    <span className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className={cn('h-1.5 w-1.5 rounded-full', n <= e.level ? 'bg-cyan-400' : 'bg-white/15')} />
                      ))}
                    </span>
                  </span>
                ))}
              </div>
            </motion.div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" onClick={() => { setOpen(false); onOpenDebrief() }}>
                <Clapperboard size={16} /> Full replay & debrief
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                <RotateCcw size={15} /> Stay in cockpit
              </Button>
            </div>
            <p className="mt-4 text-center text-[11px] text-slate-500">
              Formative feedback - faculty review is required for high-stakes assessment.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SummaryColumn({
  title,
  icon,
  tone,
  items,
  empty,
  baseDelay,
}: {
  title: string
  icon: React.ReactNode
  tone: 'emerald' | 'amber'
  items: { label: string; text: string }[]
  empty: string
  baseDelay: number
}) {
  return (
    <div className={cn('rounded-2xl border p-4', tone === 'emerald' ? 'border-emerald-400/15 bg-emerald-400/[0.03]' : 'border-amber-400/15 bg-amber-400/[0.03]')}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
        {icon} {title}
      </div>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-xs text-slate-500">{empty}</p>}
        {items.map((it, i) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, x: tone === 'emerald' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: baseDelay + i * 0.08 }}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5"
          >
            <div className="text-xs font-semibold text-slate-200">{it.label}</div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{it.text}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ===================== SCENARIO PLAYER ===================== */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
function defaultPause(step: ScenarioStep) {
  if (step.kind === 'say') return 1900
  if (step.kind === 'order') return 850
  if (step.kind === 'reason') return 800
  return 200
}

/** Speak the most recent patient line: bundled neural voice, else browser TTS. */
function speakLastPatient() {
  const st = useSession.getState()
  if (!st.patientTts) return
  const tr = st.transcript
  const last = tr[tr.length - 1]
  if (!last || last.role !== 'patient') return
  if (!playPatientVoice(last.text)) speak(last.text)
}

/**
 * Scenario pacing: speak a line and resolve when it finishes so the transcript
 * stays in lock-step with the audio. If the audio is muted OR the browser blocks
 * playback (autoplay policy), fall back to a reading-time delay so the
 * conversation never "skips" - it always paces naturally.
 */
async function speakLine(text: string) {
  if (!text) return
  const words = text.trim().split(/\s+/).filter(Boolean).length
  // snappy reading-time pacing when there is no audio (muted / autoplay blocked)
  const reading = Math.max(1200, Math.min(4200, words * 230))
  const muted = !useSession.getState().patientTts

  if (!muted && hasVoice(text)) {
    const start = Date.now()
    const ok = await playVoiceAwait(text)
    const elapsed = Date.now() - start
    // audio played fine (we waited for 'ended') → done.
    // audio failed/blocked or returned suspiciously fast → pad to reading time.
    if (!ok || elapsed < 600) {
      await sleep(Math.max(0, reading - elapsed))
    }
    return
  }
  await sleep(reading)
}

/**
 * Single module-level lock shared by BOTH the scenario player and Presenter Mode,
 * so only one thing ever drives the conversation at a time (no interleaving).
 */
const demoLock = { running: false, cancel: false }

function useScenarioPlayer() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)

  const stop = () => {
    demoLock.cancel = true
    demoLock.running = false
    stopPatientVoice()
    setActiveId(null)
    setStepIndex(0)
  }

  const run = async (sc: DemoScenario) => {
    if (demoLock.running) return
    demoLock.cancel = false
    demoLock.running = true
    setDone(false)
    setActiveId(sc.id)
    setStepIndex(0)

    try {
      useSession.getState().start(elderlyDizzinessAdherence)
      await sleep(450)
      if (demoLock.cancel) return
      // David's opening line (voiced)
      {
        const tr = useSession.getState().transcript
        await speakLine(tr[tr.length - 1]?.text ?? '')
      }
      await sleep(400)

      for (let i = 0; i < sc.steps.length; i++) {
        if (demoLock.cancel) return
        const step = sc.steps[i]
        setStepIndex(i + 1)
        const st = useSession.getState()
        try {
          if (step.kind === 'say') {
            st.askStudent(step.text!, step.dur)
            await speakLine(step.text!)
            if (demoLock.cancel) return
            await sleep(420)
            const ptText = st.flushPatient()
            if (demoLock.cancel) return
            await speakLine(ptText)
            await sleep(step.pause ?? 420)
          } else {
            if (step.kind === 'order') st.order(step.id!)
            else if (step.kind === 'reason') st.submitReasoning(step.reason!)
            else if (step.kind === 'finish') st.finish()
            await sleep(step.pause ?? defaultPause(step))
          }
        } catch {
          await sleep(250)
        }
      }
      if (!demoLock.cancel) {
        setActiveId(null)
        setDone(true)
      }
    } finally {
      demoLock.running = false
      if (demoLock.cancel) stopPatientVoice()
    }
  }

  return { activeId, stepIndex, done, run, stop, playing: activeId !== null }
}

/* ===================== PRESENTER MODE ===================== */
const PRESENTER_OPENING =
  "Hello David, my name is Maya, I'm a fourth-year medical student. I'm sorry to hear you've not been feeling well - what brings you in today?"

const PRESENTER_REASON = {
  summary: '72-year-old man with one week of postural dizziness and near falls.',
  differentials: ['Orthostatic hypotension (medication-related)', 'Volume depletion / dehydration', 'Cardiac arrhythmia'],
  cannotMiss: 'Posterior circulation stroke',
  evidence: 'Symptoms on standing, positive orthostatic vitals, recently stopped his antihypertensive.',
  testsRationale: 'Orthostatic vitals and medication review first, ECG to exclude arrhythmia.',
  plan: 'Reconcile medications and address adherence and side effects, rehydrate, assess falls risk, involve the supervising physician before changing the antihypertensive, and safety-net.',
  patientExplanation: 'Your dizziness is most likely a blood-pressure drop on standing, linked to the medication you stopped. We will adjust it safely together.',
}

function PresenterMode({ onOpenReplay, onOpenFaculty }: { onOpenReplay: () => void; onOpenFaculty: () => void }) {
  const [busy, setBusy] = useState<string | null>(null)

  const ask = async (id: string, text: string) => {
    if (busy || demoLock.running) return
    setBusy(id)
    demoLock.running = true
    demoLock.cancel = false
    try {
      unlockAudio()
      const st = useSession.getState()
      if (!st.started) st.start(elderlyDizzinessAdherence)
      useSession.getState().askStudent(text)
      await speakLine(text)
      await sleep(380)
      const pt = useSession.getState().flushPatient()
      await speakLine(pt)
    } finally {
      demoLock.running = false
      setBusy(null)
    }
  }

  const orderVitals = () => {
    if (demoLock.running) return
    const st = useSession.getState()
    if (!st.started) st.start(elderlyDizzinessAdherence)
    st.order('orthostatic')
    st.order('med-review')
  }

  const submitPlan = () => {
    if (demoLock.running) return
    const st = useSession.getState()
    if (!st.started) st.start(elderlyDizzinessAdherence)
    st.submitReasoning(PRESENTER_REASON)
    st.finish()
  }

  const steps = [
    { id: 'open', label: 'Ask opening question', icon: MessageCircle, tone: 'cyan', onClick: () => ask('open', PRESENTER_OPENING) },
    { id: 'weak', label: 'Ask weak medication question', icon: AlertTriangle, tone: 'danger', onClick: () => ask('weak', DEMO_PHRASES.bad) },
    { id: 'good', label: 'Ask improved nonjudgmental question', icon: Lightbulb, tone: 'success', onClick: () => ask('good', DEMO_PHRASES.good) },
    { id: 'vitals', label: 'Order orthostatic vitals', icon: FlaskConical, tone: 'cyan', onClick: orderVitals },
    { id: 'plan', label: 'Submit differential & plan', icon: CheckCircle2, tone: 'violet', onClick: submitPlan },
    { id: 'replay', label: 'Open OSCE Replay', icon: Clapperboard, tone: 'cyan', onClick: onOpenReplay },
    { id: 'faculty', label: 'Open Faculty Insight', icon: Building2, tone: 'cyan', onClick: onOpenFaculty },
  ]

  const toneCls: Record<string, string> = {
    cyan: 'hover:border-cyan-400/40 hover:bg-cyan-400/[0.06]',
    danger: 'hover:border-rose-400/40 hover:bg-rose-400/[0.06]',
    success: 'hover:border-emerald-400/40 hover:bg-emerald-400/[0.06]',
    violet: 'hover:border-violet-400/40 hover:bg-violet-400/[0.06]',
  }

  return (
    <Card className="border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.05] to-transparent !p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/15 text-cyan-300">
          <Presentation size={16} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Presenter Mode</h3>
          <p className="text-[11px] text-slate-400">
            One-click scripted demo - no microphone or typing needed. Click in order, top to bottom.
          </p>
        </div>
        <span className="ml-auto chip !border-emerald-400/30 !bg-emerald-400/10 !text-emerald-300">Always works</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={s.onClick}
            disabled={!!busy && busy !== s.id}
            className={cn(
              'flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left text-xs font-medium text-slate-200 transition-all disabled:opacity-40',
              toneCls[s.tone]
            )}
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/5 text-[10px] font-bold text-slate-400">
              {busy === s.id ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" /> : i + 1}
            </span>
            <s.icon size={14} className="shrink-0 text-slate-400" />
            <span className="leading-tight">{s.label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

function ScenarioBar() {
  const { activeId, stepIndex, done, run, stop, playing } = useScenarioPlayer()
  const active = demoScenarios.find((s) => s.id === activeId)

  return (
    <Card className="!p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-400/15 text-violet-300">
            <Clapperboard size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Auto-play a demo encounter</h3>
            <p className="text-[11px] text-slate-400">
              Watch a full doctor-patient conversation run through the live scoring engine.
            </p>
          </div>
        </div>
        {playing ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs text-slate-300">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              {active?.title} · step {stepIndex}/{active?.steps.length}
            </span>
            <Button variant="danger" size="sm" onClick={stop}>
              <Square size={13} /> Stop
            </Button>
          </div>
        ) : done ? (
          <Link to="/debrief" className="btn-violet !px-3 !py-1.5 !text-xs">
            View OSCE Debrief <ArrowRight size={14} />
          </Link>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {demoScenarios.map((sc) => {
          const isActive = sc.id === activeId
          const ring =
            sc.tone === 'success'
              ? 'hover:border-emerald-400/40'
              : sc.tone === 'danger'
                ? 'hover:border-rose-400/40'
                : 'hover:border-amber-400/40'
          return (
            <button
              key={sc.id}
              onClick={() => {
                unlockAudio()
                run(sc)
              }}
              disabled={playing}
              className={cn(
                'group rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition-all disabled:opacity-50',
                ring,
                isActive && 'border-violet-400/40 bg-violet-400/[0.06]'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-100">{sc.title}</span>
                <span
                  className={cn(
                    'grid h-6 w-6 place-items-center rounded-full',
                    sc.tone === 'success' && 'bg-emerald-400/15 text-emerald-300',
                    sc.tone === 'danger' && 'bg-rose-400/15 text-rose-300',
                    sc.tone === 'warning' && 'bg-amber-400/15 text-amber-300'
                  )}
                >
                  <Play size={12} />
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{sc.subtitle}</p>
              <Badge
                tone={sc.tone === 'success' ? 'success' : sc.tone === 'danger' ? 'danger' : 'warning'}
                className="mt-2"
              >
                {sc.expected}
              </Badge>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

/* ===================== TOP BAR ===================== */
function TopBar() {
  const { c, mode, setMode, elapsed } = useSession()
  if (!c) return null
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')
  return (
    <Card className="!p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-white/10">
          <Stethoscope size={18} className="text-cyan-300" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-100">{c.title}</h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="cyan">{c.specialty}</Badge>
            <Badge>{c.difficulty}</Badge>
            <Badge tone="slate">Sim time {mm}:{ss}</Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="exam">Exam</TabsTrigger>
            <TabsTrigger value="coaching">Coaching</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="chip !border-amber-400/25 !bg-amber-400/[0.07] !text-amber-200">
          <Sparkles size={12} /> Education only
        </span>
      </div>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-2 text-xs text-slate-300">
        <Stethoscope size={13} className="mt-0.5 shrink-0 text-cyan-300" />
        <span><span className="font-semibold text-cyan-200">Goal:</span> uncover why David is dizzy and whether medication changes are contributing.</span>
      </div>
    </Card>
  )
}

/* ===================== LEFT: PATIENT ===================== */
function LeftColumn() {
  const { c, hiddenState, emotion, flags } = useSession()
  if (!c) return null
  const unlocked = hiddenState === 'fully_revealed' || hiddenState === 'addressed_with_empathy'
  const p = c.patient
  const v = p.baselineVitals
  const emotionTone: Record<string, string> = {
    calm: 'success',
    open: 'success',
    reassured: 'cyan',
    guarded: 'warning',
    defensive: 'danger',
    anxious: 'warning',
  }
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-lg font-bold text-slate-200 ring-1 ring-white/10">
            <User size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">{p.name}, {p.age}</h3>
            <p className="text-xs text-slate-400">{p.sex === 'male' ? 'Male' : 'Female'}</p>
          </div>
        </div>
        <p className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm text-slate-300">
          “{p.chiefComplaint}”
        </p>
        <dl className="mt-3 space-y-2 text-xs">
          <Row k="Persona" v={p.personaLabel} />
          <Row k="Health literacy" v={p.healthLiteracy} />
          <Row k="Recall reliability" v={p.recallReliability} />
          <Row k="Emotional state" v={<Badge tone={(emotionTone[emotion] as any) ?? 'slate'}>{emotion}</Badge>} />
        </dl>
        <div className="mt-3">
          <HiddenConcernChip state={hiddenState} />
        </div>
        <AnimatePresence mode="wait">
          {unlocked ? (
            <motion.div
              key="unlocked-msg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-2.5 text-[11px] leading-relaxed text-emerald-100"
            >
              <MessageCircle size={13} className="mt-0.5 shrink-0" />
              Nonjudgmental phrasing creates psychological safety and improves disclosure.
            </motion.div>
          ) : flags.judgmentalAttempt ? (
            <motion.div
              key="guarded-msg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-2.5 text-[11px] leading-relaxed text-amber-100"
            >
              <ShieldAlertIcon size={13} className="mt-0.5 shrink-0" />
              The patient may withhold information when phrasing feels judgmental.
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>

      <Card>
        <CardHeader title="Vitals" subtitle="Baseline" icon={<Activity size={16} />} />
        <div className="grid grid-cols-3 gap-2">
          <Vital k="BP" v={v.bp} />
          <Vital k="HR" v={`${v.hr}`} />
          <Vital k="RR" v={`${v.rr}`} />
          <Vital k="Temp" v={`${v.temp}°`} />
          <Vital k="SpO₂" v={`${v.o2}%`} />
          <Vital k="Pain" v={`${v.pain}/10`} />
        </div>
      </Card>
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-right font-medium capitalize text-slate-300">{v}</dd>
    </div>
  )
}
function Vital({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{k}</div>
      <div className="text-sm font-semibold text-slate-200">{v}</div>
    </div>
  )
}

/* Per-turn delivery + trust annotation under a student message. */
function TurnDelivery({ turn }: { turn: import('@/types').TranscriptTurn }) {
  const accessibility = useSession((s) => s.accessibilityMode)
  const fillers = turn.audio?.fillerWordCount ?? 0
  const wpm = turn.audio?.speechRateWpm
  const tone = turn.toneLabel
  const toneTone =
    tone === 'judgmental' || tone === 'rushed'
      ? 'text-rose-300 border-rose-400/30 bg-rose-400/10'
      : tone === 'empathetic' || tone === 'patient_centered'
        ? 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10'
        : 'text-slate-300 border-white/10 bg-white/5'
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-1.5">
      {typeof turn.trustDelta === 'number' && turn.trustDelta !== 0 && (
        <span className={cn('text-[10px] font-bold', turn.trustDelta > 0 ? 'text-emerald-300' : 'text-rose-300')}>
          Trust {turn.trustDelta > 0 ? '+' : ''}{turn.trustDelta}
        </span>
      )}
      {tone && tone !== 'neutral' && (
        <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide', toneTone)}>
          {tone.replace('_', ' ')}
        </span>
      )}
      {!accessibility && fillers > 0 && (
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
          {fillers} filler{fillers > 1 ? 's' : ''}
        </span>
      )}
      {!accessibility && typeof wpm === 'number' && (
        <span className="text-[9px] text-slate-500">{wpm} wpm</span>
      )}
    </div>
  )
}

/* ===================== CENTER: ENCOUNTER ===================== */
function CenterColumn({ onFinish }: { onFinish: () => void }) {
  const s = useSession()
  const voice = useVoiceCapture()
  const [typed, setTyped] = useState('')
  const [micHint, setMicHint] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [s.transcript.length, s.patientTyping])

  if (!s.c) return null

  const submit = (text: string, dur?: number) => {
    const t = text.trim()
    if (!t) return
    s.ask(t, dur)
    setTyped('')
    setTimeout(speakLastPatient, 220)
  }

  const onMicToggle = () => {
    if (voice.recording) {
      const { text, durationSec } = voice.stop()
      const finalText = (text || typed).trim()
      if (finalText) {
        submit(finalText, durationSec)
        setMicHint('')
      } else {
        setMicHint(
          voice.supported
            ? 'No speech detected - try again, type your question, or auto-play a demo above.'
            : 'Voice input is not supported in this browser. Type your question or auto-play a demo above.'
        )
      }
    } else {
      setMicHint('')
      voice.start()
    }
  }

  return (
    <div className="space-y-4">
      {/* Transcript */}
      <Card className="flex h-[420px] flex-col !p-0">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span className="flex h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px] shadow-rose-400/60" />
            Live patient encounter
          </div>
          <div className="flex items-center gap-2">
            <Tip label="Realistic patient voice (Microsoft neural, pre-rendered). Never used to evaluate the student.">
              <button
                onClick={() => {
                  const next = !s.patientTts
                  s.togglePatientTts(next)
                  if (!next) stopPatientVoice()
                }}
                className={cn('chip', s.patientTts && '!border-cyan-400/40 !text-cyan-200')}
              >
                {s.patientTts ? <Volume2 size={12} /> : <VolumeX size={12} />} Patient voice
              </button>
            </Tip>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <AnimatePresence initial={false}>
            {s.transcript.map((turn) => (
              <motion.div
                key={turn.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', turn.role === 'student' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm',
                    turn.role === 'student'
                      ? 'rounded-br-sm bg-gradient-to-br from-cyan-500/20 to-blue-500/15 text-cyan-50 ring-1 ring-cyan-400/20'
                      : 'rounded-bl-sm bg-white/[0.05] text-slate-200 ring-1 ring-white/10'
                  )}
                >
                  <div className="mb-0.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide opacity-60">
                    {turn.role === 'student' ? 'Maya (you)' : s.c!.patient.name}
                    {hasVoice(turn.text) && (
                      <button
                        onClick={() => playPatientVoice(turn.text)}
                        title="Play voice"
                        className="grid h-5 w-5 place-items-center rounded-full bg-cyan-400/15 text-cyan-300 transition-colors hover:bg-cyan-400/30"
                      >
                        <Volume1 size={11} />
                      </button>
                    )}
                  </div>
                  {turn.text}
                  {turn.role === 'student' && <TurnDelivery turn={turn} />}
                </div>
              </motion.div>
            ))}
            {s.patientTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl rounded-bl-sm bg-white/[0.05] px-4 py-3 ring-1 ring-white/10">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {s.c!.patient.name}
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-slate-400"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Coaching tip */}
        <AnimatePresence>
          {s.coachTip && (
            <motion.div
              key={s.coachTip.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                'mx-4 mb-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs',
                s.coachTip.tone === 'warning' && 'border-amber-400/30 bg-amber-400/10 text-amber-100',
                s.coachTip.tone === 'cyan' && 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
                s.coachTip.tone === 'violet' && 'border-violet-400/30 bg-violet-400/10 text-violet-100',
                s.coachTip.tone === 'success' && 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
              )}
            >
              <Lightbulb size={14} className="mt-0.5 shrink-0" />
              <span>{s.coachTip.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Voice-first input */}
      <Card className="!p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMicToggle}
            className={cn(
              'relative grid h-16 w-16 shrink-0 place-items-center rounded-full transition-all',
              voice.recording
                ? 'bg-gradient-to-br from-rose-500 to-red-500 shadow-glow-violet animate-pulse-ring'
                : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-glow hover:brightness-110'
            )}
          >
            <Mic size={24} className="text-ink-900" />
          </button>
          <div className="min-w-0 flex-1">
            {voice.recording ? (
              <Waveform level={voice.level} active />
            ) : (
              <Waveform level={0} active={false} />
            )}
            <div className={cn('mt-1 text-[11px]', micHint ? 'text-amber-300' : 'text-slate-500')}>
              {micHint
                ? micHint
                : voice.recording
                  ? 'Listening… click the mic again to send'
                  : voice.supported
                    ? 'Click the mic and speak, or type below'
                    : 'Speech recognition unavailable - type below (always works)'}
            </div>
          </div>
        </div>

        {/* live interim transcript */}
        {voice.recording && voice.transcript && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
            {voice.transcript}
          </div>
        )}

        {/* typed fallback */}
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit(typed)
          }}
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type your question to the patient…"
            className="flex-1 rounded-xl border border-white/10 bg-ink-800/60 px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
          />
          <Button type="submit" size="sm" className="!px-4 !py-2.5">
            <Send size={15} />
          </Button>
        </form>

        {/* guided demo phrases */}
        <div className="mt-3 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Guided demo - medication adherence</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => submit(DEMO_PHRASES.bad)}
              className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-left text-xs text-rose-200 hover:bg-rose-400/10"
            >
              <span className="font-semibold">Bad phrasing →</span> “{DEMO_PHRASES.bad}”
            </button>
            <button
              onClick={() => submit(DEMO_PHRASES.good)}
              className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-left text-xs text-emerald-200 hover:bg-emerald-400/10"
            >
              <span className="font-semibold">Better phrasing →</span> normalizing bridge
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => submit(p)}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400 hover:bg-white/10 hover:text-slate-200"
              >
                {p.length > 42 ? p.slice(0, 42) + '…' : p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Clinical actions */}
      <ClinicalActions onFinish={onFinish} />
    </div>
  )
}

/* ===================== CLINICAL ACTIONS ===================== */
function ClinicalActions({ onFinish }: { onFinish: () => void }) {
  const s = useSession()
  if (!s.c) return null
  const byCat = (cat: string) => s.c!.measurements.filter((m) => m.category === cat)

  return (
    <Card className="!p-0">
      <Tabs defaultValue="exam">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <TabsList>
            <TabsTrigger value="exam"><Stethoscope size={13} className="mr-1" /> Exam / Vitals</TabsTrigger>
            <TabsTrigger value="labs"><FlaskConical size={13} className="mr-1" /> Labs</TabsTrigger>
            <TabsTrigger value="imaging"><ScanLine size={13} className="mr-1" /> Imaging</TabsTrigger>
            <TabsTrigger value="reasoning"><ClipboardList size={13} className="mr-1" /> Reasoning</TabsTrigger>
          </TabsList>
        </div>
        <div className="p-4">
          <TabsContent value="exam">
            <MeasureGrid items={[...byCat('vitals'), ...byCat('exam'), ...byCat('review')]} />
          </TabsContent>
          <TabsContent value="labs">
            <MeasureGrid items={byCat('lab')} />
          </TabsContent>
          <TabsContent value="imaging">
            <MeasureGrid items={byCat('imaging')} />
          </TabsContent>
          <TabsContent value="reasoning">
            <ReasoningForm onFinish={onFinish} />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}

function MeasureGrid({ items }: { items: any[] }) {
  const s = useSession()
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((m) => {
        const ordered = s.orderedMeasurements.includes(m.id)
        return (
          <div
            key={m.id}
            className={cn(
              'rounded-xl border p-3 transition-all',
              ordered ? 'border-cyan-400/30 bg-cyan-400/[0.05]' : 'border-white/10 bg-white/[0.02]'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">{m.label}</span>
              {!ordered ? (
                <button onClick={() => s.order(m.id)} className="btn-ghost !px-2.5 !py-1 !text-xs">
                  Order
                </button>
              ) : (
                <Badge tone={m.interpretation === 'key' ? 'violet' : m.interpretation === 'abnormal' ? 'warning' : 'success'}>
                  {m.interpretation}
                </Badge>
              )}
            </div>
            {ordered && <p className="mt-2 text-xs text-slate-400">{m.result}</p>}
            {!ordered && !m.indicated && (
              <p className="mt-1 text-[10px] text-amber-300/70">Consider whether this is indicated</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ReasoningForm({ onFinish }: { onFinish: () => void }) {
  const s = useSession()
  const [f, setF] = useState({
    summary: '',
    d1: '',
    d2: '',
    d3: '',
    cannotMiss: '',
    evidence: '',
    testsRationale: '',
    plan: '',
    patientExplanation: '',
  })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value })

  const submit = () => {
    s.submitReasoning({
      summary: f.summary,
      differentials: [f.d1, f.d2, f.d3].filter(Boolean),
      cannotMiss: f.cannotMiss,
      evidence: f.evidence,
      testsRationale: f.testsRationale,
      plan: f.plan,
      patientExplanation: f.patientExplanation,
    })
    s.finish()
    onFinish()
  }

  const prefill = () => {
    const c = s.c!
    setF({
      summary: '72-year-old man with one week of postural dizziness and near falls.',
      d1: c.expectedDifferential[0],
      d2: c.expectedDifferential[1],
      d3: c.expectedDifferential[2],
      cannotMiss: c.cannotMiss,
      evidence: 'Symptoms on standing, positive orthostatic vitals, recently stopped antihypertensive.',
      testsRationale: 'Orthostatic vitals + medication review + ECG to exclude arrhythmia.',
      plan: c.expectedPlan.join('; '),
      patientExplanation: 'Your dizziness is likely from a blood-pressure drop on standing, linked to your medication. We will adjust this safely together.',
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Submit your clinical reasoning to generate the OSCE debrief.</p>
        <button onClick={prefill} className="text-[11px] text-cyan-300 hover:underline">Prefill (demo)</button>
      </div>
      <Field label="One-sentence summary"><textarea rows={2} value={f.summary} onChange={set('summary')} className={inputCls} /></Field>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field label="Differential 1"><input value={f.d1} onChange={set('d1')} className={inputCls} /></Field>
        <Field label="Differential 2"><input value={f.d2} onChange={set('d2')} className={inputCls} /></Field>
        <Field label="Differential 3"><input value={f.d3} onChange={set('d3')} className={inputCls} /></Field>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Cannot-miss diagnosis"><input value={f.cannotMiss} onChange={set('cannotMiss')} className={inputCls} /></Field>
        <Field label="Supporting evidence"><input value={f.evidence} onChange={set('evidence')} className={inputCls} /></Field>
      </div>
      <Field label="Management plan"><textarea rows={2} value={f.plan} onChange={set('plan')} className={inputCls} /></Field>
      <Field label="Patient explanation"><textarea rows={2} value={f.patientExplanation} onChange={set('patientExplanation')} className={inputCls} /></Field>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Link to="/debrief" className="btn-ghost">Skip to debrief</Link>
        <Button variant="violet" onClick={submit}>
          <CheckCircle2 size={16} /> Submit & Score
        </Button>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400/40'
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-slate-400">{label}</span>
      {children}
    </label>
  )
}

/* ===================== RIGHT: TRACKERS ===================== */
/* ===================== LIVE AI ANALYSIS ===================== */
const TOPIC_LABEL: Partial<Record<IntentTopic, string>> = {
  introduction: 'Introduction',
  open_question: 'Open question',
  symptom_history: 'Symptom history',
  onset_duration: 'Onset / timing',
  associated_symptoms: 'Associated symptoms',
  red_flags: 'Red-flag screen',
  medications: 'Medication history',
  medication_adherence: 'Medication adherence',
  allergies: 'Allergies',
  social_history: 'Social history',
  substance_use: 'Substance use',
  sexual_history: 'Sexual history',
  pregnancy: 'Pregnancy',
  empathy: 'Empathy',
  reassurance: 'Reassurance',
  confidentiality: 'Confidentiality',
  explanation: 'Explanation',
  closure: 'Safety-netting',
  differential: 'Differential',
  management_plan: 'Management plan',
}

function AiAnalysisFeed() {
  const transcript = useSession((s) => s.transcript)
  const studentTurns = transcript.filter((t) => t.role === 'student').slice(-4).reverse()
  const latestId = studentTurns[0]?.id

  return (
    <Card className="border-violet-400/20 bg-gradient-to-br from-violet-500/[0.06] to-transparent !p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-violet-400/15 text-violet-300">
          <Brain size={16} />
          <span className="absolute inset-0 rounded-lg ring-1 ring-violet-400/40 animate-pulse-ring" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">AI conversation analysis</h3>
          <p className="text-[11px] text-slate-400">Real-time intent, tone & impact detection</p>
        </div>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
          <Waves size={11} className="animate-pulse" /> Live
        </span>
      </div>

      {studentTurns.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-6 text-center text-xs text-slate-500">
          Awaiting the first question… the AI will analyze each line as the conversation unfolds.
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {studentTurns.map((t) => (
              <AnalysisCard key={t.id} turn={t} newest={t.id === latestId} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  )
}

function AnalysisCard({ turn, newest }: { turn: import('@/types').TranscriptTurn; newest: boolean }) {
  const topics = (turn.intent?.topics ?? []).filter((t) => t !== 'unknown')
  const tone = turn.toneLabel
  const trust = turn.trustDelta ?? 0
  const sentiment = turn.hiddenSentiment
  const accent =
    sentiment === 'unlock'
      ? 'border-l-fuchsia-400'
      : tone === 'judgmental' || tone === 'rushed'
        ? 'border-l-rose-400'
        : tone === 'empathetic' || tone === 'patient_centered' || turn.intent?.hasNormalizingBridge
          ? 'border-l-emerald-400'
          : 'border-l-cyan-400'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className={cn('relative overflow-hidden rounded-xl border border-white/10 border-l-2 bg-white/[0.03] p-3', accent)}
    >
      {/* scanning shimmer on the newest card */}
      {newest && (
        <motion.div
          initial={{ x: '-120%' }}
          animate={{ x: '120%' }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-violet-400/10 to-transparent"
        />
      )}
      <p className="line-clamp-2 text-xs text-slate-300">“{turn.text}”</p>

      <div className="mt-2 flex flex-wrap gap-1">
        {topics.slice(0, 4).map((tp) => (
          <span key={tp} className="rounded-md bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-200">
            {TOPIC_LABEL[tp] ?? tp}
          </span>
        ))}
        {tone && tone !== 'neutral' && (
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
              tone === 'judgmental' || tone === 'rushed'
                ? 'bg-rose-400/10 text-rose-300'
                : 'bg-emerald-400/10 text-emerald-300'
            )}
          >
            {tone.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
        {trust !== 0 && (
          <span className={cn('inline-flex items-center gap-0.5 font-bold', trust > 0 ? 'text-emerald-300' : 'text-rose-300')}>
            {trust > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />} Trust {trust > 0 ? '+' : ''}{trust}
          </span>
        )}
        {sentiment === 'unlock' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/20 px-2 py-0.5 font-bold text-fuchsia-200">
            <Unlock size={10} /> Hidden concern unlocked
          </span>
        )}
        {sentiment === 'warning' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 font-semibold text-amber-200">
            <AlertTriangle size={10} /> Patient guarded
          </span>
        )}
        {sentiment === 'good' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-400/15 px-2 py-0.5 font-semibold text-violet-200">
            Patient hinted
          </span>
        )}
      </div>

      {newest && turn.coach && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2 flex items-start gap-1.5 rounded-lg border border-violet-400/20 bg-violet-400/[0.06] px-2 py-1.5 text-[10px] text-violet-100"
        >
          <Lightbulb size={11} className="mt-0.5 shrink-0" /> {turn.coach}
        </motion.p>
      )}
    </motion.div>
  )
}

function RightColumn() {
  const s = useSession()
  if (!s.c) return null

  return (
    <div className="space-y-4">
      <AiAnalysisFeed />
      {/* Scores */}
      <Card>
        <CardHeader title="Live encounter scores" icon={<Activity size={16} />} />
        <div className="space-y-3">
          <ScoreMeter label="Patient Trust" value={s.trust} tone="cyan" />
          <ScoreMeter label="Clinical Presence" value={s.presence} tone="violet" />
          <ScoreMeter
            label="Communication Quality"
            value={Math.round((s.presenceSub.empathy + s.presenceSub.nonjudgmental + s.presenceSub.clarity) / 3)}
            tone="success"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          {Object.entries({
            'Calm Leadership': s.presenceSub.calmLeadership,
            'Verbal Structure': s.presenceSub.verbalStructure,
            Clarity: s.presenceSub.clarity,
            Empathy: s.presenceSub.empathy,
            'Nonjudgmental': s.presenceSub.nonjudgmental,
            Reassurance: s.presenceSub.reassurance,
          }).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5">
              <span className="text-slate-500">{k}</span>
              <span className="font-semibold text-slate-300">{Math.round(v as number)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Accessibility */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Accessibility size={16} className="mt-0.5 text-cyan-300" />
            <div>
              <div className="text-sm font-semibold text-slate-200">Accessibility Mode</div>
              <p className="text-[11px] text-slate-500">Disables fluency scoring. Content & structure feedback stay on. Voice analytics are formative only.</p>
            </div>
          </div>
          <Switch checked={s.accessibilityMode} onCheckedChange={s.toggleAccessibility} />
        </div>
      </Card>

      {/* OSCE tracker */}
      <Card>
        <CardHeader title="OSCE progress tracker" subtitle="Checklist coverage" icon={<ClipboardList size={16} />} />
        <div className="space-y-1.5">
          {OSCE_TRACK.map((item) => {
            const done = isTrackDone(item.id, s)
            const guarded = item.id === 'medication_adherence' && s.hiddenState !== 'locked' && s.hiddenState !== 'fully_revealed'
            return (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                {done ? (
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                ) : guarded ? (
                  <AlertTriangle size={15} className="shrink-0 text-amber-400" />
                ) : (
                  <Circle size={15} className="shrink-0 text-slate-600" />
                )}
                <span className={cn(done ? 'text-slate-200' : 'text-slate-500')}>{item.label}</span>
                {item.id === 'medication_adherence' && (
                  <span className="ml-auto"><HiddenConcernPill /></span>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function HiddenConcernPill() {
  const state = useSession((s) => s.hiddenState)
  const unlocked = state === 'fully_revealed'
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold uppercase', unlocked ? 'bg-fuchsia-500/20 text-fuchsia-200' : 'bg-violet-500/15 text-violet-300')}>
      {unlocked ? 'unlocked' : state.replace('_', ' ')}
    </span>
  )
}

function isTrackDone(id: string, s: ReturnType<typeof useSession.getState>): boolean {
  if (id === 'physical_exam') return s.orderedMeasurements.includes('neuro')
  if (id === 'test_selection') return s.orderedMeasurements.length > 0
  if (id === 'differential') return !!s.reasoning
  if (id === 'management_plan') return !!s.reasoning?.plan
  if (id === 'medication_adherence') return s.hiddenState === 'fully_revealed'
  return s.coveredTopics.includes(id as IntentTopic)
}
