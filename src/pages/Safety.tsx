import type * as React from 'react'
import {
  ShieldCheck,
  Accessibility,
  Volume2,
  Lock,
  Heart,
  GraduationCap,
} from 'lucide-react'
import { useSession } from '@/store/session'
import { Card, CardHeader, Badge, SectionTitle } from '@/components/ui/primitives'
import { Switch } from '@/components/ui/radix'

export default function Safety() {
  const s = useSession()
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Safety / Settings" title="Responsible-by-design" desc="ClinFlight OS is built for education and simulation only, with fairness and privacy as first-class features." />

      <Card className="border-amber-400/20 bg-amber-400/[0.05]">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-300" />
          <div>
            <h3 className="text-base font-bold text-slate-100">For medical education and simulation only</h3>
            <p className="mt-1 text-sm text-amber-100/90">Synthetic cases. Not for real patient diagnosis or treatment. AI feedback is formative - high-stakes assessment requires faculty review and override.</p>
          </div>
        </div>
      </Card>

      {/* Settings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Voice fairness & accessibility" icon={<Accessibility size={16} />} />
          <Setting
            label="Accessibility Mode"
            desc="Disables fluency scoring. Clinical content and communication-structure feedback stay on. Voice analytics become formative-only and flagged for faculty review."
            checked={s.accessibilityMode}
            onChange={s.toggleAccessibility}
          />
          <Setting
            label="Fluency scoring"
            desc="Pace, pauses, and filler words. Turn off to avoid penalizing accents, stutters, or speech disabilities."
            checked={s.fluencyScoring && !s.accessibilityMode}
            onChange={s.toggleFluency}
            disabled={s.accessibilityMode}
          />
          <Setting
            label="Patient text-to-speech"
            desc="Reads the virtual patient's replies aloud. Never used to evaluate the student."
            checked={s.patientTts}
            onChange={s.togglePatientTts}
          />
        </Card>

        <Card>
          <CardHeader title="Coaching language policy" icon={<Heart size={16} />} />
          <div className="space-y-2 text-sm">
            <PolicyRow good="Delivery coaching opportunity" bad="Student lacks confidence" />
            <PolicyRow good="Consider a clearer transition before sensitive questions" bad="Poor speaker" />
            <PolicyRow good="Long pause before the adherence question" bad="Bad communication" />
            <PolicyRow good="Your explanation helped patient trust" bad="You sounded bad" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Principle icon={<Lock size={18} />} title="No PHI" text="PHI Guard blocks names, IDs, phone numbers, exact dates, and MRNs. Rotation learning is de-identified to age bands." />
        <Principle icon={<GraduationCap size={18} />} title="Formative, faculty-reviewed" text="Scores guide learning. Faculty can review and override any automated score before it counts." />
        <Principle icon={<Volume2 size={18} />} title="Fair voice analytics" text="Fluency scoring is optional and disabled in Accessibility Mode. We never punish accents or speech differences." />
      </div>

      <Card>
        <CardHeader title="Faculty override" subtitle="High-stakes assessment safeguard" icon={<ShieldCheck size={16} />} />
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <p className="text-sm text-slate-400">Any automated OSCE score can be reviewed and adjusted by a supervising clinician-educator before it is recorded.</p>
          <Badge tone="success">Enabled</Badge>
        </div>
      </Card>
    </div>
  )
}

function Setting({ label, desc, checked, onChange, disabled }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-white/5 py-3 first:border-0 first:pt-0">
      <div>
        <div className="text-sm font-semibold text-slate-200">{label}</div>
        <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
      </div>
      <div className={disabled ? 'pointer-events-none opacity-40' : ''}>
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
    </div>
  )
}

function PolicyRow({ good, bad }: { good: string; bad: string }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1.5 text-xs text-emerald-200">✓ {good}</div>
      <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.05] px-2.5 py-1.5 text-xs text-rose-300/70 line-through">✕ {bad}</div>
    </div>
  )
}

function Principle({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">{icon}</span>
      <h4 className="mt-3 text-sm font-bold text-slate-100">{title}</h4>
      <p className="mt-1 text-xs text-slate-400">{text}</p>
    </Card>
  )
}
