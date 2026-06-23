import { useState } from 'react'
import type * as React from 'react'
import { Route, ShieldAlert, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { scanForPhi, type PhiHit } from '@/engine/phiGuard'
import { Card, CardHeader, Badge, SectionTitle } from '@/components/ui/primitives'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Rotation() {
  const [note, setNote] = useState('')
  const [hits, setHits] = useState<PhiHit[]>([])
  const [form, setForm] = useState({ rotation: 'Internal Medicine', dept: 'Ward B', caseType: 'Geriatric dizziness', band: '70-79y' })

  const onNote = (v: string) => {
    setNote(v)
    setHits(scanForPhi(v))
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Rotation Companion · Preview" title="Turn real rotations into simulation learning" desc="Connect bedside experience to ClinFlight practice - without ever storing patient identifiers." right={<Badge tone="violet">Preview</Badge>} />

      {/* PHI banner */}
      <Card className="border-amber-400/20 bg-amber-400/[0.05]">
        <div className="flex items-start gap-3">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-300" />
          <p className="text-sm text-amber-100">
            <span className="font-semibold">PHI Guard is on.</span> Do not enter patient names, IDs, phone numbers, exact dates of birth, addresses, or medical record numbers. Use age bands and de-identified case types only.
          </p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Log a learning opportunity" subtitle="De-identified rotation entry" icon={<Route size={16} />} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Rotation"><input value={form.rotation} onChange={(e) => setForm({ ...form, rotation: e.target.value })} className={inputCls} /></Field>
            <Field label="Department"><input value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} className={inputCls} /></Field>
            <Field label="De-identified case type"><input value={form.caseType} onChange={(e) => setForm({ ...form, caseType: e.target.value })} className={inputCls} /></Field>
            <Field label="Age band only"><input value={form.band} onChange={(e) => setForm({ ...form, band: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="What was difficult? (free text - PHI Guard monitors this)">
            <textarea rows={3} value={note} onChange={(e) => onNote(e.target.value)} placeholder="e.g. Struggled to ask about medication adherence without sounding judgmental." className={inputCls} />
          </Field>
          {hits.length > 0 ? (
            <div className="mt-2 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Possible PHI detected - please remove before saving:</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {hits.map((h, i) => <Badge key={i} tone="danger">{h.type}: {h.match}</Badge>)}
                </div>
              </div>
            </div>
          ) : note ? (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-xs text-emerald-200">
              <CheckCircle2 size={14} /> No PHI detected - safe to save.
            </div>
          ) : null}
        </Card>

        {/* Learning Opportunity Router */}
        <Card className="border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.05] to-transparent">
          <CardHeader title="Learning Opportunity Router" subtitle="Recommended next step" icon={<Sparkles size={16} />} right={<Badge tone="cyan">Preview</Badge>} />
          <p className="text-sm text-slate-300">
            Maya is weak in <span className="text-violet-300">hidden concerns</span>, <span className="text-violet-300">medication adherence</span>, and <span className="text-violet-300">delivery before sensitive questions</span>.
          </p>
          <div className="mt-3 space-y-2">
            <RouterRow label="Recommended next case" value="Elderly Dizziness - Medication Non-Adherence" />
            <RouterRow label="Assign debrief to" value="Dr. Dana Levi (load 72%)" />
            <RouterRow label="Teaching focus" value="Nonjudgmental medication reconciliation" />
            <RouterRow label="Goal" value="Adherence question within first 4 minutes" />
          </div>
          <Link to="/cockpit" className="btn-primary mt-4 w-full">
            Start recommended case <ArrowRight size={16} />
          </Link>
        </Card>
      </div>
    </div>
  )
}

function RouterRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-200">{value}</div>
    </div>
  )
}

const inputCls = 'w-full rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400/40'
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={cn('block', 'sm:col-span-1')}>
      <span className="mb-1 block text-[11px] font-medium text-slate-400">{label}</span>
      {children}
    </label>
  )
}
