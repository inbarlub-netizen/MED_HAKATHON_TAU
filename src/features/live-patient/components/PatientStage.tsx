import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, Wind, Droplet } from 'lucide-react'
import PatientVisual from './PatientVisual'
import PhotoLipSyncAvatar from './PhotoLipSyncAvatar'
import { HiddenConcernChip } from '@/components/common/Scores'
import { liveCase } from '../state/livePatientStore'
import type { HiddenConcernState, PatientEmotion, RoomPhase } from '../types'
import { cn } from '@/lib/utils'

const PHASE_META: Record<RoomPhase, { label: string; dot: string }> = {
  idle: { label: 'Idle', dot: 'bg-slate-400' },
  listening: { label: 'Listening', dot: 'bg-violet-400 animate-pulse' },
  processing: { label: 'David is thinking…', dot: 'bg-amber-400 animate-pulse' },
  'patient-speaking': { label: 'Patient speaking', dot: 'bg-cyan-400 animate-pulse' },
  debrief: { label: 'Debrief ready', dot: 'bg-emerald-400' },
}

const EMOTION_LABEL: Record<PatientEmotion, string> = {
  anxious: 'Anxious',
  guarded: 'Guarded',
  relieved: 'Relieved',
  confused: 'Confused',
  cooperative: 'Cooperative',
}

export default function PatientStage({
  phase,
  emotion,
  hiddenState,
}: {
  phase: RoomPhase
  emotion: PatientEmotion
  hiddenState: HiddenConcernState
}) {
  const p = liveCase.patient
  const v = p.baselineVitals
  const meta = PHASE_META[phase]

  return (
    <div className="relative flex h-full min-h-[460px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800/40">
      {/* Top status bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/70 px-3 py-1.5 backdrop-blur-md">
          <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
          <span className="text-xs font-semibold text-slate-200">{meta.label}</span>
        </div>
        <HiddenConcernChip state={hiddenState} />
      </div>

      {/* Patient visual fills the stage */}
      <div className="relative flex-1">
        <PatientVisual emotion={emotion} phase={phase} />
        <PhotoLipSyncAvatar />
      </div>

      {/* Bottom identity + vitals strip */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 backdrop-blur-md"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-100">
                {p.name}, {p.age}
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                Emergency Dept
              </span>
              <span className="text-[11px] text-slate-400">· {EMOTION_LABEL[emotion]}</span>
            </div>
            <p className="mt-0.5 max-w-md text-xs text-slate-400">{p.chiefComplaint}</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Vital icon={<Activity size={13} />} label="BP" value={v.bp} />
            <Vital icon={<Heart size={13} />} label="HR" value={`${v.hr}`} />
            <Vital icon={<Wind size={13} />} label="RR" value={`${v.rr}`} />
            <Vital icon={<Droplet size={13} />} label="SpO2" value={`${v.o2}%`} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Vital({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-300">
      <span className="text-cyan-400">{icon}</span>
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  )
}
