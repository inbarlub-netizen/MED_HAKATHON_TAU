import { Play, Square, FileText, RotateCcw, Clapperboard } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import type { RoomPhase, RuntimeStatus } from '../types'
import { cn } from '@/lib/utils'

export default function SimulationControls({
  started,
  phase,
  turnCount,
  isAutoPlaying,
  runtime,
  onStart,
  onEnd,
  onDebrief,
  onReset,
  onWatchDemo,
  onStopDemo,
}: {
  started: boolean
  phase: RoomPhase
  turnCount: number
  isAutoPlaying: boolean
  runtime: RuntimeStatus
  onStart: () => void
  onEnd: () => void
  onDebrief: () => void
  onReset: () => void
  onWatchDemo: () => void
  onStopDemo: () => void
}) {
  const inDebrief = phase === 'debrief'
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {!started ? (
          <>
            <Button onClick={onStart} variant="primary" size="lg">
              <Play size={18} />
              Start Simulation
            </Button>
            <Button onClick={onWatchDemo} variant="violet">
              <Clapperboard size={16} />
              Watch Demo
            </Button>
          </>
        ) : isAutoPlaying ? (
          <>
            <span className="flex items-center gap-2 text-xs text-slate-300">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              Auto-playing exemplary encounter
            </span>
            <Button onClick={onStopDemo} variant="subtle">
              <Square size={14} />
              Stop
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onDebrief} variant="violet" disabled={inDebrief || turnCount === 0}>
              <FileText size={16} />
              {inDebrief ? 'Debrief ready' : 'Generate Debrief'}
            </Button>
            <Button onClick={onEnd} variant="subtle" disabled={inDebrief}>
              <Square size={15} />
              End Case
            </Button>
            <Button onClick={onReset} variant="ghost">
              <RotateCcw size={15} />
              Reset
            </Button>
          </>
        )}
      </div>

      <RuntimeChip runtime={runtime} />
    </div>
  )
}

function RuntimeChip({ runtime }: { runtime: RuntimeStatus }) {
  const items = [
    { label: 'Brain', value: runtime.llm },
    { label: 'Voice', value: runtime.tts },
    { label: 'Speech', value: runtime.stt },
    { label: 'Avatar', value: runtime.avatar },
  ]
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/60 px-3 py-1.5">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          runtime.online ? 'bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60' : 'bg-slate-500'
        )}
      />
      <span className="text-[11px] font-medium text-slate-400">
        {runtime.online ? 'Local runtime' : 'Browser mode'}
      </span>
      <span className="hidden gap-2 sm:flex">
        {items.map((i) => (
          <span key={i.label} className="text-[10px] text-slate-500">
            {i.label}: <span className="text-slate-300">{i.value}</span>
          </span>
        ))}
      </span>
    </div>
  )
}
