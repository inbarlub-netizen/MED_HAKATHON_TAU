import { useEffect, useMemo, useState } from 'react'
import type * as React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clapperboard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Lock,
  Unlock,
  Stethoscope,
  FlaskConical,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { useSession } from '@/store/session'
import { Card, CardHeader, Badge, SectionTitle, Button } from '@/components/ui/primitives'
import { RadialScore, ScoreMeter, HiddenConcernChip } from '@/components/common/Scores'
import { cn } from '@/lib/utils'
import type { ReplayCategory, ReplayEvent } from '@/types'

const CATEGORY_META: Record<ReplayCategory, { label: string; icon: any }> = {
  communication: { label: 'Communication', icon: MessageSquare },
  hidden_concern: { label: 'Hidden concerns', icon: Lock },
  tests: { label: 'Tests', icon: FlaskConical },
  red_flags: { label: 'Red flags', icon: ShieldAlert },
  scoring: { label: 'Scoring', icon: Sparkles },
  voice: { label: 'Voice / delivery', icon: Stethoscope },
  reasoning: { label: 'Reasoning', icon: Clapperboard },
}

export default function Debrief() {
  const s = useSession()
  const result = s.result

  // If a case was practiced but not scored, score it now.
  useEffect(() => {
    if (s.c && !s.result) s.finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!s.c || !result) return <EmptyDebrief />

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="OSCE Debrief & Replay"
        title={s.c.title}
        desc="Formative, evidence-based feedback. Faculty review is required for high-stakes assessment."
        right={
          <Link to="/instructor" className="btn-ghost">
            Send to Instructor Copilot <ArrowRight size={16} />
          </Link>
        }
      />

      {/* Score hero */}
      <Card className="overflow-hidden">
        <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center">
            <RadialScore value={result.total} max={result.max} size={180} label="OSCE" sublabel={`of ${result.max}`} tone={result.total >= 70 ? 'cyan' : 'warning'} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <HiddenConcernChip state={result.hiddenConcern} />
              <Badge tone="cyan">Patient Trust {Math.round(result.trust)}</Badge>
              <Badge tone="violet">Clinical Presence {Math.round(result.presence)}</Badge>
              <Badge tone="success">Communication {result.communication}</Badge>
            </div>
            <p className="mt-4 text-sm text-slate-300">{result.summary}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {result.presenceSub.map((p) => (
                <div key={p.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <ScoreMeter label={p.label} value={p.value} tone="violet" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Rubric */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="OSCE rubric" subtitle="100-point scale · evidence-linked" icon={<CheckCircle2 size={16} />} />
            <div className="space-y-3">
              {result.items.map((it) => {
                const ratio = it.earned / it.max
                return (
                  <div key={it.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-200">{it.label}</span>
                      <span className={cn('text-sm font-bold', ratio >= 0.7 ? 'text-emerald-300' : ratio >= 0.4 ? 'text-amber-300' : 'text-rose-300')}>
                        {it.earned}/{it.max}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className={cn('h-full rounded-full bg-gradient-to-r', ratio >= 0.7 ? 'from-emerald-400 to-teal-500' : ratio >= 0.4 ? 'from-amber-400 to-orange-500' : 'from-rose-400 to-red-500')} style={{ width: `${ratio * 100}%` }} />
                    </div>
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-400">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400/80" /> {it.evidence}
                    </p>
                    {it.missed && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-amber-300/80">
                        <XCircle size={13} className="mt-0.5 shrink-0" /> {it.missed}
                      </p>
                    )}
                    {it.suggestion && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-cyan-300/80">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> {it.suggestion}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="EPA / competency mapping" icon={<Stethoscope size={16} />} />
            <div className="space-y-2">
              {result.epas.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">{e.id}</span>
                    <span className="ml-2 text-xs text-slate-400">{e.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={cn('h-2 w-4 rounded-full', n <= e.level ? 'bg-gradient-to-r from-cyan-400 to-violet-500' : 'bg-white/10')} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Replay */}
        <ReplayTimeline events={s.replay} />
      </div>
    </div>
  )
}

function ReplayTimeline({ events }: { events: ReplayEvent[] }) {
  const [filter, setFilter] = useState<ReplayCategory | 'all'>('all')
  const cats = useMemo(() => Array.from(new Set(events.map((e) => e.category))), [events])
  const shown = filter === 'all' ? events : events.filter((e) => e.category === filter)

  return (
    <Card className="!p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Clapperboard size={16} className="text-cyan-300" /> Encounter replay
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          <Filter size={12} className="text-slate-500" />
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
          {cats.map((c) => (
            <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {CATEGORY_META[c].label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="relative max-h-[640px] overflow-y-auto px-4 py-4">
        <div className="absolute bottom-4 left-[27px] top-4 w-px bg-white/10" />
        <div className="space-y-3">
          {shown.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No events in this filter.</p>}
          {shown.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative pl-10"
            >
              <span className={cn('absolute left-0 top-1 grid h-7 w-7 place-items-center rounded-full ring-4 ring-ink-900', dotTone(e.sentiment))}>
                {sentimentIcon(e.sentiment)}
              </span>
              <div className={cn('rounded-xl border p-3', cardTone(e.sentiment))}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-100">{e.title}</span>
                  <span className="shrink-0 text-[10px] text-slate-500">{fmtTime(e.t)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{e.detail}</p>
                <p className="mt-1 text-[11px] italic text-slate-500">{e.why}</p>
                {e.rubricImpact && <Badge tone="cyan" className="mt-2 mr-1">{e.rubricImpact}</Badge>}
                {e.coaching && (
                  <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-2 py-1.5 text-[11px] text-cyan-200">
                    <Lightbulb size={12} className="mt-0.5 shrink-0" /> {e.coaching}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors', active ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-400 hover:bg-white/5')}
    >
      {children}
    </button>
  )
}

function dotTone(s: ReplayEvent['sentiment']) {
  return {
    good: 'bg-emerald-500/20 text-emerald-300',
    unlock: 'bg-fuchsia-500/25 text-fuchsia-200',
    missed: 'bg-rose-500/20 text-rose-300',
    warning: 'bg-amber-500/20 text-amber-300',
    neutral: 'bg-slate-500/20 text-slate-300',
  }[s]
}
function cardTone(s: ReplayEvent['sentiment']) {
  return {
    good: 'border-emerald-400/15 bg-emerald-400/[0.03]',
    unlock: 'border-fuchsia-400/25 bg-fuchsia-400/[0.05]',
    missed: 'border-rose-400/15 bg-rose-400/[0.03]',
    warning: 'border-amber-400/15 bg-amber-400/[0.03]',
    neutral: 'border-white/10 bg-white/[0.02]',
  }[s]
}
function sentimentIcon(s: ReplayEvent['sentiment']) {
  const p = { size: 14 }
  if (s === 'good') return <CheckCircle2 {...p} />
  if (s === 'unlock') return <Unlock {...p} />
  if (s === 'missed') return <XCircle {...p} />
  if (s === 'warning') return <AlertTriangle {...p} />
  return <Sparkles {...p} />
}
function fmtTime(t: number) {
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

function EmptyDebrief() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/5">
          <Clapperboard size={26} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">No encounter to debrief yet</h3>
        <p className="mt-2 text-sm text-slate-400">Run the live David case in the Clinical Cockpit, then return here for the OSCE replay and feedback.</p>
        <Link to="/cockpit" className="btn-primary mt-5">
          <Stethoscope size={16} /> Open Clinical Cockpit
        </Link>
      </Card>
    </div>
  )
}
