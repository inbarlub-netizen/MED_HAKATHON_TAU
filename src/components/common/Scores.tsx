import { motion } from 'framer-motion'
import { Lock, Unlock, ShieldQuestion } from 'lucide-react'
import type { HiddenConcernState } from '@/types'
import { cn } from '@/lib/utils'

/* ---------- Radial score ---------- */
export function RadialScore({
  value,
  max = 100,
  size = 160,
  label,
  sublabel,
  tone = 'cyan',
}: {
  value: number
  max?: number
  size?: number
  label?: string
  sublabel?: string
  tone?: 'cyan' | 'violet' | 'success' | 'warning'
}) {
  const pct = Math.max(0, Math.min(1, value / max))
  const r = (size - 18) / 2
  const c = 2 * Math.PI * r
  const grad: Record<string, [string, string]> = {
    cyan: ['#22d3ee', '#3b82f6'],
    violet: ['#a855f7', '#ec4899'],
    success: ['#34d399', '#14b8a6'],
    warning: ['#fbbf24', '#f97316'],
  }
  const [from, to] = grad[tone]
  const gid = `rg-${tone}`
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gid})`}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold tracking-tight text-slate-100">{Math.round(value)}</div>
        {label && <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</div>}
        {sublabel && <div className="text-[10px] text-slate-500">{sublabel}</div>}
      </div>
    </div>
  )
}

/* ---------- Score meter (animated number + bar) ---------- */
export function ScoreMeter({
  label,
  value,
  tone = 'cyan',
  delta,
}: {
  label: string
  value: number
  tone?: 'cyan' | 'violet' | 'success' | 'warning' | 'danger'
  delta?: number
}) {
  const grads: Record<string, string> = {
    cyan: 'from-cyan-400 to-blue-500',
    violet: 'from-violet-400 to-fuchsia-500',
    success: 'from-emerald-400 to-teal-500',
    warning: 'from-amber-400 to-orange-500',
    danger: 'from-rose-400 to-red-500',
  }
  const texts: Record<string, string> = {
    cyan: 'text-cyan-300',
    violet: 'text-violet-300',
    success: 'text-emerald-300',
    warning: 'text-amber-300',
    danger: 'text-rose-300',
  }
  const grad = grads[tone]
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className={cn('text-sm font-bold', texts[tone])}>
          {Math.round(value)}
          {typeof delta === 'number' && delta !== 0 && (
            <span className={cn('ml-1.5 text-[10px]', delta > 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {delta > 0 ? '▲' : '▼'} {Math.abs(Math.round(delta))}
            </span>
          )}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', grad)}
          initial={false}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/* ---------- Hidden concern chip ---------- */
const HC_META: Record<HiddenConcernState, { label: string; tone: string; icon: any }> = {
  locked: { label: 'Locked', tone: 'border-slate-500/30 bg-slate-500/10 text-slate-300', icon: Lock },
  clue_given: { label: 'Clue given', tone: 'border-violet-400/30 bg-violet-400/10 text-violet-300', icon: ShieldQuestion },
  partially_revealed: { label: 'Partially revealed', tone: 'border-violet-400/40 bg-violet-400/15 text-violet-200', icon: ShieldQuestion },
  fully_revealed: { label: 'Unlocked', tone: 'border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-200', icon: Unlock },
  addressed_with_empathy: { label: 'Addressed', tone: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200', icon: Unlock },
  missed: { label: 'Missed', tone: 'border-rose-400/30 bg-rose-400/10 text-rose-300', icon: Lock },
}

export function HiddenConcernChip({ state }: { state: HiddenConcernState }) {
  const m = HC_META[state]
  const unlocked = state === 'fully_revealed' || state === 'addressed_with_empathy'
  const Icon = m.icon
  return (
    <motion.span
      key={state}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        m.tone,
        unlocked && 'animate-pulse-ring'
      )}
    >
      <Icon size={13} />
      Hidden concern · {m.label}
    </motion.span>
  )
}

/* ---------- Live waveform ---------- */
export function Waveform({ level, active, bars = 28 }: { level: number; active: boolean; bars?: number }) {
  return (
    <div className="flex h-12 items-center justify-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => {
        const center = 1 - Math.abs(i - bars / 2) / (bars / 2)
        const h = active ? 8 + level * 90 * (0.4 + center) * (0.6 + Math.random() * 0.8) : 6 + center * 8
        return (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-cyan-500 to-violet-400"
            animate={{ height: Math.min(46, h) }}
            transition={{ duration: 0.12 }}
          />
        )
      })}
    </div>
  )
}
