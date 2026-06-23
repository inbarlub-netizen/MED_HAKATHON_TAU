import { Link, useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from 'recharts'
import {
  Plane,
  Target,
  TrendingUp,
  Lock,
  HeartPulse,
  ShieldAlert,
  FlaskConical,
  ArrowRight,
  Clapperboard,
  MessageSquareQuote,
} from 'lucide-react'
import { maya } from '@/data/mockStudents'
import { caseById } from '@/data/cases'
import { Card, CardHeader, Badge, Stat, SectionTitle, FadeIn } from '@/components/ui/primitives'
import { useSession } from '@/store/session'

const chartTooltip = {
  contentStyle: {
    background: 'rgba(15,23,42,0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    fontSize: 12,
  },
}

export default function FlightDeck() {
  const navigate = useNavigate()
  const start = useSession((s) => s.start)
  const rec = caseById(maya.recommendedCaseId)!

  const startCase = () => {
    start(rec)
    navigate('/cockpit')
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Student Flight Deck"
        title="Maya Cohen"
        desc="4th year medical student · Internal Medicine rotation · TAU Med 2026"
        right={
          <button onClick={startCase} className="btn-primary">
            <Plane size={16} /> Start Recommended Case
          </button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Cases completed" value={maya.casesCompleted} tone="cyan" icon={<Plane size={16} />} />
        <Stat label="Average OSCE" value={maya.avgOsce} unit="/100" tone="success" icon={<TrendingUp size={16} />} />
        <Stat label="Hidden concern rate" value={`${maya.hiddenConcernRate}%`} tone="violet" icon={<Lock size={16} />} />
        <Stat label="Test efficiency" value={`${maya.testEfficiency}%`} tone="warning" icon={<FlaskConical size={16} />} />
      </div>

      {/* Detected weakness + recommended case */}
      <FadeIn>
        <Card className="overflow-hidden border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-transparent">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-400/15 text-violet-300">
                  <Target size={16} />
                </span>
                <h3 className="text-sm font-semibold text-slate-100">System-detected weakness</h3>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Across Maya’s last {maya.casesCompleted} encounters, the adaptive model flagged a
                consistent pattern: she knows <em>what</em> to ask but struggles with sensitive-topic
                delivery.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {maya.detectedWeakness.map((w) => (
                  <Badge key={w} tone="violet">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
              <div className="label-eyebrow mb-2">Recommended next case</div>
              <h4 className="text-lg font-bold text-slate-100">{rec.title}</h4>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge tone="cyan">{rec.specialty}</Badge>
                <Badge>{rec.difficulty}</Badge>
                <Badge>{rec.simulatedMinutes} min</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-400">{rec.summary}</p>
              <button onClick={startCase} className="btn-primary mt-4 w-full">
                Start Recommended Case <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="OSCE score trend" subtitle="Last 6 weeks" icon={<TrendingUp size={16} />} />
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={maya.osceTrend}>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <RTooltip {...chartTooltip} />
              <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 3, fill: '#22d3ee' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Competency radar" subtitle="EPA-aligned skills" icon={<Target size={16} />} />
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={maya.competencies} outerRadius={70}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Trust & presence" subtitle="Rolling average" icon={<HeartPulse size={16} />} />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={maya.trustTrend.map((t, i) => ({ label: t.label, trust: t.value, presence: maya.presenceTrend[i].value }))}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#22d3ee" stopOpacity={0.5} />
                  <stop offset="1" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="1" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <RTooltip {...chartTooltip} />
              <Area type="monotone" dataKey="trust" stroke="#22d3ee" fill="url(#tg)" strokeWidth={2} />
              <Area type="monotone" dataKey="presence" stroke="#a855f7" fill="url(#pg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Lower row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Strengths & focus areas" icon={<ShieldAlert size={16} />} />
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 text-xs font-semibold text-emerald-300">Strong</div>
              <div className="flex flex-wrap gap-1.5">
                {maya.strongSkills.map((s) => (
                  <Badge key={s} tone="success">{s}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold text-amber-300">Focus next</div>
              <div className="flex flex-wrap gap-1.5">
                {maya.weakSkills.map((s) => (
                  <Badge key={s} tone="warning">{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Replay library" icon={<Clapperboard size={16} />} right={<Link to="/debrief" className="text-xs text-cyan-300 hover:underline">Open</Link>} />
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
          <CardHeader title="Instructor feedback" icon={<MessageSquareQuote size={16} />} />
          <div className="space-y-3">
            {maya.feedbackHistory.map((f, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{f.instructor}</span>
                  <span className="text-[11px] text-slate-500">{f.date}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{f.note}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
