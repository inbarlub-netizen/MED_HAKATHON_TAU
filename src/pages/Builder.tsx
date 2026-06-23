import { useState } from 'react'
import type * as React from 'react'
import {
  Wrench,
  User,
  Stethoscope,
  Eye,
  Lock,
  Zap,
  FlaskConical,
  Brain,
  ClipboardCheck,
  Mic,
  PlayCircle,
  Send,
} from 'lucide-react'
import { classifyIntent } from '@/engine/intentClassifier'
import { evaluateHiddenConcern } from '@/engine/hiddenConcernEngine'
import { elderlyDizzinessAdherence } from '@/data/cases'
import { Card, CardHeader, Badge, SectionTitle } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import type { HiddenConcernState } from '@/types'

const steps = [
  { n: 1, label: 'Case basics', icon: Wrench },
  { n: 2, label: 'Case type / specialty', icon: Stethoscope },
  { n: 3, label: 'Patient persona', icon: User },
  { n: 4, label: 'Visible facts', icon: Eye },
  { n: 5, label: 'Hidden concerns', icon: Lock },
  { n: 6, label: 'Disclosure triggers', icon: Zap },
  { n: 7, label: 'Labs & tests', icon: FlaskConical },
  { n: 8, label: 'Expected differential', icon: Brain },
  { n: 9, label: 'OSCE rubric', icon: ClipboardCheck },
  { n: 10, label: 'Voice / delivery', icon: Mic },
  { n: 11, label: 'Preview', icon: PlayCircle },
]

export default function Builder() {
  const [active, setActive] = useState(6)
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Case Builder · Preview" title="Author a teaching case" desc="Educators define visible facts, hidden concerns, and the exact triggers that unlock them. Preview build - illustrative." right={<Badge tone="violet">Preview</Badge>} />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Stepper */}
        <Card className="!p-3">
          <div className="space-y-1">
            {steps.map((s) => (
              <button
                key={s.n}
                onClick={() => setActive(s.n)}
                className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors', active === s.n ? 'bg-white/10 text-cyan-200' : 'text-slate-400 hover:bg-white/5')}
              >
                <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-bold', active === s.n ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/5 text-slate-500')}>{s.n}</span>
                <s.icon size={15} className="shrink-0" />
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Step content */}
        <div className="space-y-4">
          {active === 6 ? (
            <DisclosureTester />
          ) : (
            <Card>
              <CardHeader title={steps[active - 1].label} subtitle={`Step ${active} of ${steps.length}`} icon={(() => { const I = steps[active - 1].icon; return <I size={16} /> })()} />
              <StepBody step={active} />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function StepBody({ step }: { step: number }) {
  const c = elderlyDizzinessAdherence
  const content: Record<number, React.ReactNode> = {
    1: <DemoFields fields={[['Title', c.title], ['Difficulty', c.difficulty], ['Simulated time', `${c.simulatedMinutes} min`]]} />,
    2: <DemoFields fields={[['Primary specialty', c.specialty], ['Secondary', c.secondarySpecialty ?? '-']]} />,
    3: <DemoFields fields={[['Name / age', `${c.patient.name}, ${c.patient.age}`], ['Persona', c.patient.personaLabel], ['Health literacy', c.patient.healthLiteracy], ['Recall reliability', c.patient.recallReliability]]} />,
    4: <ul className="space-y-1.5 text-sm text-slate-400">{c.disclosures.slice(0, 5).map((d, i) => <li key={i} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">{d.response}</li>)}</ul>,
    5: <DemoFields fields={[['Hidden concern', c.hiddenConcern.label], ['Description', c.hiddenConcern.description], ['Required topic', c.hiddenConcern.requiredTopic], ['Requires nonjudgmental', c.hiddenConcern.requiresNonjudgmental ? 'Yes' : 'No']]} />,
    7: <ul className="grid gap-1.5 sm:grid-cols-2 text-sm">{c.measurements.map((m) => <li key={m.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"><span className="font-medium text-slate-200">{m.label}</span> <Badge tone={m.indicated ? 'success' : 'warning'}>{m.indicated ? 'indicated' : 'low-yield'}</Badge></li>)}</ul>,
    8: <DemoFields fields={[...c.expectedDifferential.map((d, i) => [`DDx ${i + 1}`, d] as [string, string]), ['Cannot-miss', c.cannotMiss]]} />,
    9: <p className="text-sm text-slate-400">7-domain, 100-point OSCE rubric auto-attached: history, red flags, communication, hidden concern, tests, differential, management.</p>,
    10: <p className="text-sm text-slate-400">Delivery expectations: normalizing bridge before sensitive questions, calm leadership, safety-netting. Fluency scoring is optional and can be disabled via Accessibility Mode.</p>,
    11: <p className="text-sm text-slate-400">Run the full case in the Clinical Cockpit to preview the authored encounter end-to-end.</p>,
  }
  return <div>{content[step] ?? <p className="text-sm text-slate-400">Configure this step…</p>}</div>
}

function DemoFields({ fields }: { fields: [string, string][] }) {
  return (
    <div className="space-y-2">
      {fields.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm">
          <span className="text-slate-500">{k}</span>
          <span className="text-right font-medium text-slate-200">{v}</span>
        </div>
      ))}
    </div>
  )
}

/** Live "test disclosure trigger" - reuses the real engines. */
function DisclosureTester() {
  const c = elderlyDizzinessAdherence
  const [text, setText] = useState('')
  const [state, setState] = useState<HiddenConcernState>('locked')
  const [log, setLog] = useState<{ q: string; a: string; sentiment: string }[]>([])

  const test = () => {
    if (!text.trim()) return
    const intent = classifyIntent(text)
    const out = evaluateHiddenConcern(c.hiddenConcern, state, intent)
    setState(out.nextState)
    setLog([{ q: text, a: out.patientResponse || '(no change - off topic or already disclosed)', sentiment: out.sentiment }, ...log])
    setText('')
  }

  return (
    <Card>
      <CardHeader
        title="Test the disclosure trigger"
        subtitle={`Hidden concern: ${c.hiddenConcern.label}`}
        icon={<Zap size={16} />}
        right={<Badge tone={state === 'fully_revealed' ? 'success' : 'violet'}>{state.replace('_', ' ')}</Badge>}
      />
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && test()}
          placeholder="Type a question the way a student might ask it…"
          className="flex-1 rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-400/40"
        />
        <button onClick={test} className="btn-primary !px-4 !py-2.5"><Send size={15} /></button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {['Are you taking your medications properly?', 'Many people stop medications due to side effects, has that happened to you?'].map((p) => (
          <button key={p} onClick={() => setText(p)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400 hover:bg-white/10">{p.length > 40 ? p.slice(0, 40) + '…' : p}</button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {log.map((l, i) => (
          <div key={i} className={cn('rounded-xl border p-3 text-sm', l.sentiment === 'unlock' ? 'border-fuchsia-400/30 bg-fuchsia-400/[0.05]' : l.sentiment === 'warning' ? 'border-amber-400/20 bg-amber-400/[0.04]' : 'border-white/10 bg-white/[0.02]')}>
            <div className="text-xs text-cyan-300">Q: {l.q}</div>
            <div className="mt-1 text-slate-200">A: {l.a}</div>
          </div>
        ))}
        {log.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Try a judgmental vs. a normalizing phrasing and watch the hidden concern respond.</p>}
      </div>
    </Card>
  )
}
