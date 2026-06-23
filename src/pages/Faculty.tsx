import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  AreaChart,
  Area,
  Cell,
} from 'recharts'
import {
  Building2,
  Users,
  TrendingUp,
  Lock,
  ShieldAlert,
  FlaskConical,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cohort, teachingRecommendations } from '@/data/mockCohorts'
import { facultyRecommendations } from '@/engine/facultyInsightsEngine'
import { Card, CardHeader, Badge, Stat, SectionTitle } from '@/components/ui/primitives'

const tt = {
  contentStyle: { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 },
}

export default function Faculty() {
  const recs = facultyRecommendations(cohort)
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Faculty Command · Faculty Support Analytics"
        title="TAU Med 2026 - cohort teaching insight"
        desc="Where instructor time is most needed. Supportive analytics - not surveillance."
        right={
          <Link to="/instructor" className="btn-ghost">
            Open Instructor Copilot <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Cohort size" value={cohort.size} tone="cyan" icon={<Users size={16} />} />
        <Stat label="Cases completed" value={cohort.casesCompleted.toLocaleString()} tone="slate" icon={<TrendingUp size={16} />} />
        <Stat label="Hidden concern rate" value={`${cohort.hiddenConcernRate}%`} tone="violet" icon={<Lock size={16} />} />
        <Stat label="Unnecessary tests" value={`${cohort.unnecessaryTestRate}%`} tone="warning" icon={<FlaskConical size={16} />} />
      </div>

      {/* Headline insight */}
      <Card className="border-rose-400/20 bg-gradient-to-br from-rose-500/[0.07] to-transparent">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-400/15 text-rose-300">
            <ShieldAlert size={18} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{cohort.gaps[0].title}</h3>
            <p className="mt-1 text-sm text-slate-400">{cohort.gaps[0].detail}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Skill heatmap */}
        <Card>
          <CardHeader title="Skill mastery heatmap" subtitle="Cohort average by competency" icon={<Sparkles size={16} />} />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cohort.skillHeatmap} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" width={120} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <RTooltip {...tt} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="mastery" radius={[0, 6, 6, 0]}>
                {cohort.skillHeatmap.map((d, i) => (
                  <Cell key={i} fill={d.mastery < 50 ? '#fb7185' : d.mastery < 70 ? '#fbbf24' : '#34d399'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Trust/presence cohort trend */}
        <Card>
          <CardHeader title="Cohort trust & presence" subtitle="6-week rolling" icon={<TrendingUp size={16} />} />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={cohort.trustTrend.map((t, i) => ({ label: t.label, trust: t.value, presence: cohort.presenceTrend[i].value }))}>
              <defs>
                <linearGradient id="ft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22d3ee" stopOpacity={0.5} /><stop offset="1" stopColor="#22d3ee" stopOpacity={0} /></linearGradient>
                <linearGradient id="fp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a855f7" stopOpacity={0.4} /><stop offset="1" stopColor="#a855f7" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <RTooltip {...tt} />
              <Area type="monotone" dataKey="trust" stroke="#22d3ee" fill="url(#ft)" strokeWidth={2} />
              <Area type="monotone" dataKey="presence" stroke="#a855f7" fill="url(#fp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Curriculum gaps */}
        <Card>
          <CardHeader title="Curriculum gaps" subtitle="Detected across the cohort" icon={<ShieldAlert size={16} />} />
          <div className="space-y-2">
            {cohort.gaps.map((g, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <Badge tone={g.severity === 'high' ? 'danger' : g.severity === 'medium' ? 'warning' : 'slate'}>{g.severity}</Badge>
                <div>
                  <div className="text-sm font-semibold text-slate-200">{g.title}</div>
                  <p className="mt-0.5 text-xs text-slate-400">{g.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Case coverage */}
        <Card>
          <CardHeader title="Case-type coverage" subtitle="% of curriculum target" icon={<Building2 size={16} />} />
          <div className="space-y-2.5">
            {cohort.caseCoverage.map((c) => (
              <div key={c.type}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-300">{c.type}</span>
                  <span className="text-slate-500">{c.covered}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${c.covered}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader title="Recommended next actions" subtitle="What the student, instructor & sim center should do next" icon={<Sparkles size={16} />} />
        <div className="grid gap-3 md:grid-cols-3">
          {recs.map((r, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <Badge tone={r.tone}>{r.forWho}</Badge>
              <p className="mt-2 text-sm text-slate-300">{r.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
          {teachingRecommendations.map((t, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
              <div>
                <div className="text-sm font-medium text-slate-200">{t.title}</div>
                <div className="text-[11px] text-slate-500">{t.impact}</div>
              </div>
              <Badge>{t.audience}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
