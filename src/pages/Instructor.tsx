import type * as React from 'react'
import {
  Bot,
  Clock,
  Scale,
  GraduationCap,
  ListChecks,
  MessageSquareQuote,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useSession } from '@/store/session'
import { instructors, debriefQueue } from '@/data/mockInstructors'
import { buildDebriefGuide, groupWeaknessSummary } from '@/engine/instructorCopilotEngine'
import { Card, CardHeader, Badge, SectionTitle } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

export default function Instructor() {
  const result = useSession((s) => s.result)
  const guide = buildDebriefGuide('Maya Cohen', 'Elderly Dizziness - Medication Non-Adherence', result ?? undefined)

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Instructor Copilot · Debrief Support"
        title="Teaching command center"
        desc="Supportive analytics to focus your limited time. This augments instructors - it does not replace them."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: queue + load */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Today’s debrief queue" subtitle="Triaged by where time matters most" icon={<ListChecks size={16} />} />
            <div className="space-y-2">
              {debriefQueue.map((d) => (
                <div key={d.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <Badge tone={d.severity === 'high' ? 'danger' : d.severity === 'medium' ? 'warning' : 'success'}>{d.severity}</Badge>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-200">{d.student}</span>
                      <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-500"><Clock size={11} /> {d.minutes}m</span>
                    </div>
                    <div className="truncate text-[11px] text-slate-500">{d.caseTitle}</div>
                    <p className="mt-1 text-xs text-slate-400">{d.flag}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Teaching load balancing" subtitle="Faculty Support Analytics" icon={<Scale size={16} />} />
            <div className="space-y-3">
              {instructors.map((ins) => (
                <div key={ins.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{ins.name}</span>
                    <span className="text-slate-500">{ins.load}% load</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className={cn('h-full rounded-full bg-gradient-to-r', ins.load > 70 ? 'from-rose-400 to-red-500' : ins.load > 50 ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500')} style={{ width: `${ins.load}%` }} />
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{ins.title}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: debrief guide */}
        <div className="space-y-4">
          <Card className="border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.05] to-transparent">
            <CardHeader
              title="AI-generated debrief guide"
              subtitle={`${guide.student} · ${guide.caseTitle}`}
              icon={<Bot size={16} />}
              right={<Badge tone="cyan"><Sparkles size={11} /> Copilot</Badge>}
            />
            <div className="space-y-3">
              <GuideBlock label="Main teaching issue" tone="warning">{guide.mainIssue}</GuideBlock>
              <GuideBlock label="Suggested debrief opening" tone="cyan"><span className="italic">“{guide.opening}”</span></GuideBlock>
              <GuideBlock label="Practice prompt" tone="violet"><span className="italic">“{guide.practicePrompt}”</span></GuideBlock>
              <GuideBlock label="Goal for next attempt" tone="success">{guide.goal}</GuideBlock>
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Acknowledge strengths</div>
                <div className="flex flex-wrap gap-1.5">
                  {guide.strengths.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">
                      <CheckCircle2 size={11} /> {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Group weakness summary" subtitle="Recurring across the cohort" icon={<GraduationCap size={16} />} />
            <h4 className="text-sm font-semibold text-slate-200">{groupWeaknessSummary.title}</h4>
            <p className="mt-1 text-xs text-slate-400">{groupWeaknessSummary.detail}</p>
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[0.06] p-3">
              <MessageSquareQuote size={14} className="mt-0.5 shrink-0 text-violet-300" />
              <p className="text-xs text-violet-100"><span className="font-semibold">Recommended micro-teaching:</span> {groupWeaknessSummary.recommendation}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function GuideBlock({ label, tone, children }: { label: string; tone: 'cyan' | 'violet' | 'warning' | 'success'; children: React.ReactNode }) {
  const tones = {
    cyan: 'border-cyan-400/20 bg-cyan-400/[0.05]',
    violet: 'border-violet-400/20 bg-violet-400/[0.05]',
    warning: 'border-amber-400/20 bg-amber-400/[0.05]',
    success: 'border-emerald-400/20 bg-emerald-400/[0.05]',
  }
  return (
    <div className={cn('rounded-xl border p-3', tones[tone])}>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm text-slate-200">{children}</div>
    </div>
  )
}
