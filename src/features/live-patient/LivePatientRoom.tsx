import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Stethoscope } from 'lucide-react'
import { useLivePatient } from './state/livePatientStore'
import PatientStage from './components/PatientStage'
import MicControl from './components/MicControl'
import SimulationControls from './components/SimulationControls'
import DebriefPanel from './components/DebriefPanel'
import WebcamPip from './components/WebcamPip'
import { stopMedia } from './engine/mediaController'
import { cn } from '@/lib/utils'
import type { RoomPhase } from './types'

const PHASE_DOT: Record<RoomPhase, string> = {
  idle: 'bg-slate-400',
  listening: 'bg-violet-400 animate-pulse',
  processing: 'bg-amber-400 animate-pulse',
  'patient-speaking': 'bg-cyan-400 animate-pulse',
  debrief: 'bg-emerald-400',
}

const PHASE_LABEL: Record<RoomPhase, string> = {
  idle: 'Idle',
  listening: 'Listening',
  processing: 'Thinking...',
  'patient-speaking': 'Speaking',
  debrief: 'Debrief',
}

export default function LivePatientRoom() {
  const s = useLivePatient()
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void s.refreshRuntime()
    return () => stopMedia()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [s.turns.length, s.phase])

  const inputDisabled = !s.started || s.processing || s.phase === 'patient-speaking' || s.phase === 'debrief'

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-cyan-300">
              <Stethoscope size={16} />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Live Patient Room</h1>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
              Emergency Dept
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Speak with David in real time. Build trust to uncover what he is not telling you.
          </p>
        </div>
        <Link
          to="/cockpit"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
        >
          <ArrowLeft size={14} />
          Classic Cockpit
        </Link>
      </div>

      {/* Video call area */}
      <div className="grid gap-4 grid-cols-[1.8fr_1fr]">

        {/* Left: David video with PiP + controls */}
        <div className="relative h-[560px]">
          <PatientStage phase={s.phase} emotion={s.emotion} hiddenState={s.hiddenState} />

          {/* Webcam PiP — user's own camera above vitals strip, bottom-right */}
          <div className="absolute bottom-[84px] right-4 z-20 h-28 w-44">
            <WebcamPip className="h-full w-full" />
          </div>

        </div>

        {/* Right: Transcript panel */}
        <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800/40">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Transcript
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', PHASE_DOT[s.phase])} />
              <span className="text-xs font-semibold text-slate-300">{PHASE_LABEL[s.phase]}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {s.turns.map((t) => {
                const isClinician = t.role === 'clinician'
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-[11px] font-bold text-slate-400">
                      {isClinician ? 'You' : 'David'}:{' '}
                    </span>
                    <span className="text-sm leading-snug text-slate-200">{t.text}</span>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {s.phase === 'processing' && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-slate-400">David: </span>
                <ThinkingDots />
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      {/* Input + simulation controls */}
      <div className="card p-4">
        <MicControl disabled={inputDisabled} onSubmit={(t) => void s.submitClinician(t)} />
      </div>
      <SimulationControls
        started={s.started}
        phase={s.phase}
        turnCount={s.turnCount}
        isAutoPlaying={s.isAutoPlaying}
        runtime={s.runtime}
        onStart={s.start}
        onEnd={s.endCase}
        onDebrief={s.endCase}
        onReset={s.reset}
        onWatchDemo={() => void s.playDemo()}
        onStopDemo={s.stopDemo}
      />

      <AnimatePresence>
        {s.phase === 'debrief' && s.debrief && (
          <DebriefPanel
            debrief={s.debrief}
            onClose={() => useLivePatient.setState({ phase: 'listening' })}
            onReset={s.reset}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.9, repeat: Infinity, delay }}
        />
      ))}
    </span>
  )
}
