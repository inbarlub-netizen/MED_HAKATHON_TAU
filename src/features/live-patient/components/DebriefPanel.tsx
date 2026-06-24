import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Unlock, Lock, Quote, X, Award } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { RadialScore } from '@/components/common/Scores'
import type { DebriefResult } from '../types'
import { cn } from '@/lib/utils'

export default function DebriefPanel({
  debrief,
  onClose,
  onReset,
}: {
  debrief: DebriefResult
  onClose: () => void
  onReset: () => void
}) {
  const unlocked =
    debrief.hiddenConcernOutcome === 'fully_revealed' ||
    debrief.hiddenConcernOutcome === 'addressed_with_empathy'
  const pct = Math.round((debrief.overallScore / debrief.overallMax) * 100)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card relative max-h-[90vh] w-full max-w-4xl overflow-y-auto p-6"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex items-center gap-2">
          <Award size={20} className="text-cyan-300" />
          <h2 className="text-xl font-bold text-slate-100">OSCE Debrief</h2>
          <span className="text-sm text-slate-400">· Elderly Dizziness - Medication Non-Adherence</span>
        </div>

        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          {/* Score + hidden outcome */}
          <div className="flex flex-col items-center gap-4">
            <RadialScore value={pct} label="OSCE score" sublabel={`${debrief.overallScore}/${debrief.overallMax}`} tone={pct >= 70 ? 'success' : pct >= 50 ? 'cyan' : 'warning'} />
            <RadialScore value={debrief.communicationScore} size={120} label="Comms" tone="violet" />
            <div
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold',
                unlocked
                  ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200'
                  : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
              )}
            >
              {unlocked ? <Unlock size={14} /> : <Lock size={14} />}
              {unlocked ? 'Hidden concern revealed' : 'Hidden concern not revealed'}
            </div>
          </div>

          {/* Narrative */}
          <div className="space-y-5">
            <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
              {debrief.summary}
            </p>

            <Section title="What went well" icon={<CheckCircle2 size={15} className="text-emerald-400" />}>
              {debrief.strengths.map((s, i) => (
                <Item key={i}>{s}</Item>
              ))}
            </Section>

            <Section title="Missed opportunities" icon={<AlertTriangle size={15} className="text-amber-400" />}>
              {debrief.missedOpportunities.map((s, i) => (
                <Item key={i}>{s}</Item>
              ))}
            </Section>

            <Section title="Stronger phrasing to try" icon={<Quote size={15} className="text-cyan-400" />}>
              {debrief.suggestedPhrases.map((s, i) => (
                <div key={i} className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-2 text-xs italic text-cyan-100/90">
                  "{s}"
                </div>
              ))}
            </Section>
          </div>
        </div>

        {/* Rubric breakdown */}
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Rubric breakdown</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {debrief.rubric.map((r) => (
              <div key={r.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">{r.label}</span>
                  <span className="text-xs font-bold text-slate-100">
                    {r.earned}/{r.max}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                    style={{ width: `${(r.earned / r.max) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-slate-500">{r.evidence}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Back to room
          </Button>
          <Button variant="primary" onClick={onReset}>
            New encounter
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Item({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-snug text-slate-300">· {children}</p>
}
