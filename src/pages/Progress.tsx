import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from 'recharts'
import { LineChart as LineIcon, Award, Target, Clapperboard, Route, ShieldCheck } from 'lucide-react'
import { maya } from '@/data/mockStudents'
import { epaMap } from '@/data/osceRubric'
import { Card, CardHeader, Badge, Stat, SectionTitle } from '@/components/ui/primitives'

const tt = { contentStyle: { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 } }

const rotationLog = [
  { rotation: 'Internal Medicine', band: '70-79y', skill: 'Medication reconciliation', debrief: true },
  { rotation: 'Internal Medicine', band: '50-59y', skill: 'Dyspnea workup', debrief: true },
  { rotation: 'Emergency', band: '20-29y', skill: 'Chest pain triage', debrief: false },
]

export default function Progress() {
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="My Progress" title="Longitudinal competency profile" desc="Maya Cohen · TAU Med 2026. De-identified - no patient identifiers stored." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Average OSCE" value={maya.avgOsce} unit="/100" tone="cyan" icon={<Award size={16} />} />
        <Stat label="Empathy score" value={maya.empathyScore} tone="success" icon={<Target size={16} />} />
        <Stat label="Red-flag detection" value={`${maya.redFlagScore}%`} tone="violet" icon={<ShieldCheck size={16} />} />
        <Stat label="Hidden concern rate" value={`${maya.hiddenConcernRate}%`} tone="warning" icon={<Target size={16} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="OSCE trend" subtitle="Six-week trajectory" icon={<LineIcon size={16} />} />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={maya.osceTrend}>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <RTooltip {...tt} />
              <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 3, fill: '#22d3ee' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader title="Competency radar" subtitle="Skill mastery" icon={<Target size={16} />} />
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={maya.competencies} outerRadius={85}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="EPA / competency progress" icon={<Award size={16} />} />
          <div className="grid gap-2 sm:grid-cols-2">
            {epaMap.map((e, i) => {
              const level = 2 + (i % 4)
              return (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">{e.id}</span>
                    <span className="ml-2 text-[11px] text-slate-400">{e.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={`h-2 w-3 rounded-full ${n <= level ? 'bg-gradient-to-r from-cyan-400 to-violet-500' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Strengths & focus" icon={<Target size={16} />} />
          <div className="mb-3">
            <div className="mb-1.5 text-xs font-semibold text-emerald-300">Strongest</div>
            <div className="flex flex-wrap gap-1.5">{maya.strongSkills.map((s) => <Badge key={s} tone="success">{s}</Badge>)}</div>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-semibold text-amber-300">Weakest</div>
            <div className="flex flex-wrap gap-1.5">{maya.weakSkills.map((s) => <Badge key={s} tone="warning">{s}</Badge>)}</div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Replay library" icon={<Clapperboard size={16} />} />
          <div className="space-y-2">
            {maya.replayLibrary.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium text-slate-200">{r.caseTitle}</div>
                  <div className="text-[11px] text-slate-500">{r.date}</div>
                </div>
                <Badge tone={r.score >= 75 ? 'success' : 'warning'}>{r.score}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Rotation exposure log" subtitle="De-identified - age bands only, no PHI" icon={<Route size={16} />} />
          <div className="space-y-2">
            {rotationLog.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium text-slate-200">{r.skill}</div>
                  <div className="text-[11px] text-slate-500">{r.rotation} · {r.band}</div>
                </div>
                <Badge tone={r.debrief ? 'success' : 'slate'}>{r.debrief ? 'Debriefed' : 'Pending'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
