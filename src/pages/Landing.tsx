import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Lock,
  Mic,
  Clapperboard,
  Building2,
  Bot,
  ShieldCheck,
  Check,
  X,
  Users,
  Repeat,
  AlertTriangle,
  GraduationCap,
  Activity,
  Stethoscope,
  PlayCircle,
} from 'lucide-react'
import { heroShot, shot } from '@/data/productScreenshots'
import { ProductScreenshotCard } from '@/components/common/ProductScreenshotCard'

const APP_ICON = '/images/clinflight/logo/clinflight_app_icon.png'

const NAV = [
  { label: 'Overview', href: '#overview' },
  { label: 'Live Demo', href: '#demo' },
  { label: 'Live Patient Room', to: '/live-patient' },
  { label: 'Clinical Cockpit', to: '/cockpit' },
  { label: 'Replay', href: '#replay' },
  { label: 'Faculty', href: '#faculty' },
  { label: 'Safety', href: '#safety' },
]

const STEPS = [
  { n: '1', t: 'Student gap detected', d: 'Maya struggles with medication adherence and sensitive question delivery.', i: Activity },
  { n: '2', t: 'Recommended case', d: 'The system assigns Elderly Dizziness - Medication Non-Adherence.', i: Stethoscope },
  { n: '3', t: 'Voice-first simulation', d: 'Maya speaks with David in the Clinical Cockpit.', i: Mic },
  { n: '4', t: 'Hidden concern unlocked', d: 'A better question reveals that David stopped his blood pressure medication.', i: Lock },
  { n: '5', t: 'Replay becomes teaching', d: 'The encounter becomes OSCE feedback, instructor debrief, and faculty insight.', i: Clapperboard },
]

const HOSPITAL = [
  { t: 'More practice without more instructors', i: Users },
  { t: 'Standardized OSCE feedback', i: GraduationCap },
  { t: 'Replay-based debriefs', i: Clapperboard },
  { t: 'Early detection of unsafe patterns', i: AlertTriangle },
  { t: 'Curriculum gap analytics', i: Building2 },
  { t: 'Practice before real patients are at risk', i: ShieldCheck },
]

const SAFETY = [
  'Synthetic educational cases only',
  'No real patient diagnosis',
  'No clinical decision support',
  'PHI guard for the Rotation Companion',
  'Faculty review for high-stakes assessment',
  'Accessibility mode for voice analytics',
  'Voice scoring is formative only',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <Hero />
      <TeachingLoop />
      <DemoSection />
      <ReplaySection />
      <InstructorSection />
      <FacultySection />
      <HospitalValue />
      <SafetySection />
      <FinalCta />
      <Footer />
    </div>
  )
}

/* ---------------- Navbar ---------------- */
function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <img src={APP_ICON} alt="ClinFlight OS" className="h-9 w-9 rounded-xl ring-1 ring-white/10" />
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-slate-100">ClinFlight OS</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Clinical Teaching OS</div>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
          {NAV.map((n) =>
            n.to ? (
              <Link key={n.label} to={n.to} className="hover:text-white">{n.label}</Link>
            ) : (
              <a key={n.label} href={n.href} className="hover:text-white">{n.label}</a>
            )
          )}
        </nav>
        <Link to="/flight-deck" className="btn-primary text-sm">
          <PlayCircle size={16} /> Run Demo
        </Link>
      </div>
    </header>
  )
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section id="overview" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-violet-500/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="chip mb-6 !border-cyan-400/30 !bg-cyan-400/10 !text-cyan-200">
              <Sparkles size={13} /> Helmsley Medical Simulation Center · TAU
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.07] tracking-tight sm:text-5xl">
              Scale clinical teaching <span className="gradient-text">without scaling instructor workload.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
              ClinFlight OS is a voice-first clinical simulation platform that helps students practice real
              patient encounters, uncover hidden concerns, receive OSCE-style replay feedback, and helps
              instructors focus their time where it matters most.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/live-patient" className="btn-primary text-base">
                <Activity size={18} /> Try Live Patient Room
              </Link>
              <Link to="/flight-deck" className="btn-ghost text-base">
                <PlayCircle size={18} /> 90-Second Demo
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Bot size={15} className="text-violet-300" />
              ClinFlight OS does not replace instructors. It helps them know exactly where their time matters most.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 blur-2xl" />
            <ProductScreenshotCard src={heroShot} badge="Live Platform Preview" priority alt="ClinFlight OS platform overview" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Teaching loop ---------------- */
function TeachingLoop() {
  return (
    <section className="border-t border-white/10 bg-ink-800/30 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 text-center">
          <div className="label-eyebrow mb-3">The complete loop</div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One student. One hidden concern. One complete teaching loop.
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card relative p-4"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-xs font-bold text-cyan-200 ring-1 ring-white/10">
                  {s.n}
                </span>
                <s.i size={16} className="text-cyan-300" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-100">{s.t}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{s.d}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight size={14} className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-slate-600 md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Demo / learning moment ---------------- */
function DemoSection() {
  return (
    <section id="demo" className="border-t border-white/10 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 text-center">
          <div className="label-eyebrow mb-3">The learning moment</div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Watch the learning moment happen</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Maya speaks with David, a 72-year-old with dizziness. The same clinical question, phrased two ways,
            produces two completely different encounters.
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <ProductScreenshotCard src={shot(1).src} badge="Clinical Cockpit" alt="Clinical Cockpit voice-first encounter" />

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card border-rose-400/20 bg-rose-400/[0.04] p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-rose-300">Weak phrasing</div>
              <p className="mt-2 text-base text-slate-100">"Are you taking your medications properly?"</p>
              <p className="mt-2 text-sm text-rose-200/80">David becomes guarded. Hidden concern stays locked. Patient trust decreases.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="card border-emerald-400/20 bg-emerald-400/[0.04] p-5 shadow-glow">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Better phrasing</div>
              <p className="mt-2 text-base text-slate-100">"Many people stop or change medications because of side effects, and that is completely understandable. Has anything like that happened recently?"</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-sm text-emerald-200/80">David opens up. Patient trust increases.</p>
                <span className="chip !border-violet-400/40 !bg-violet-500/20 !text-violet-200 animate-pulse-ring">
                  <Lock size={11} /> Hidden Concern Unlocked
                </span>
              </div>
            </motion.div>

            <Link to="/live-patient" className="btn-primary w-full text-base">
              <Activity size={18} /> Launch Live Patient Room
            </Link>
            <Link to="/cockpit" className="btn-ghost w-full text-sm text-slate-400">
              <Mic size={16} /> Classic Clinical Cockpit
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Replay ---------------- */
function ReplaySection() {
  return (
    <section id="replay" className="border-t border-white/10 bg-ink-800/30 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="label-eyebrow mb-3">OSCE replay</div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Replay turns the encounter into teachable evidence</h2>
            <ul className="mt-5 space-y-2.5">
              {['Shows missed opportunities', 'Shows communication moments', 'Shows the hidden concern unlock', 'Shows test-ordering decisions', 'Converts the encounter into instructor-ready feedback'].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <ProductScreenshotCard src={shot(2).src} badge="Replay View" alt="OSCE replay and debrief" />
        </div>
      </div>
    </section>
  )
}

/* ---------------- Instructor ---------------- */
function InstructorSection() {
  return (
    <section className="border-t border-white/10 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <ProductScreenshotCard src={shot(4).src} badge="Instructor View" alt="Instructor Copilot" className="lg:order-1" />
          <div className="lg:order-2">
            <div className="label-eyebrow mb-3">Instructor Copilot</div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Debrief support for busy instructors</h2>
            <p className="mt-4 text-slate-400">
              Instructors do not need to watch every minute of every encounter. ClinFlight OS highlights the
              moments that matter and suggests focused debrief prompts.
            </p>
            <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">Suggested opening</div>
              <p className="mt-1 text-sm italic text-slate-200">"Walk me through how you decided which medications were relevant."</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Faculty ---------------- */
function FacultySection() {
  return (
    <section id="faculty" className="border-t border-white/10 bg-ink-800/30 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="label-eyebrow mb-3">Faculty Command</div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Faculty-level visibility across the cohort</h2>
            <p className="mt-4 text-slate-400">
              Simulation centers can identify repeated gaps across many students: missed medication adherence,
              judgmental phrasing, red-flag misses, unnecessary test ordering, and weak safety netting.
            </p>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-rose-300">Key insight</div>
                <p className="mt-1 text-sm font-semibold text-slate-100">62% of students missed medication adherence in elderly dizziness.</p>
              </div>
              <div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.05] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-violet-300">Recommendation</div>
                <p className="mt-1 text-sm font-semibold text-slate-100">Suggested micro-teaching: Nonjudgmental medication reconciliation.</p>
              </div>
            </div>
            <Link to="/faculty" className="btn-ghost mt-5">
              Open Faculty Dashboard <ArrowRight size={16} />
            </Link>
          </div>
          <ProductScreenshotCard src={shot(3).src} badge="Faculty View" alt="Faculty Command Dashboard" />
        </div>
      </div>
    </section>
  )
}

/* ---------------- Hospital value ---------------- */
function HospitalValue() {
  return (
    <section className="border-t border-white/10 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 text-center">
          <div className="label-eyebrow mb-3">For institutions</div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why hospitals and simulation centers need this</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HOSPITAL.map((h, i) => (
            <motion.div
              key={h.t}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card flex items-center gap-3 p-4"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <h.i size={18} />
              </span>
              <span className="text-sm font-medium text-slate-200">{h.t}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Safety ---------------- */
function SafetySection() {
  return (
    <section id="safety" className="border-t border-white/10 bg-ink-800/30 py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="mb-8 text-center">
          <div className="label-eyebrow mb-3">Responsible by design</div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for simulation, not real diagnosis</h2>
        </div>
        <div className="card grid gap-x-6 gap-y-3 p-6 sm:grid-cols-2">
          {SAFETY.map((t) => (
            <div key={t} className="flex items-start gap-2.5 text-sm text-slate-300">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-400" /> {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Final CTA + footer ---------------- */
function FinalCta() {
  return (
    <section className="border-t border-white/10 py-20">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Clinical teaching does not scale. <span className="gradient-text">ClinFlight OS makes it measurable, repeatable, and instructor-guided.</span>
        </h2>
        <p className="mt-5 text-slate-400">
          ClinFlight OS does not replace instructors. It helps them know exactly where their time matters most.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/flight-deck" className="btn-primary text-base">
            <PlayCircle size={18} /> Run the 90-Second Demo
          </Link>
          <Link to="/faculty" className="btn-ghost text-base">
            <Building2 size={18} /> View Faculty Dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 text-center sm:px-8">
        <div className="flex items-center gap-3">
          <img src={APP_ICON} alt="ClinFlight OS" className="h-10 w-10 rounded-xl ring-1 ring-white/10" />
          <span className="text-lg font-bold tracking-tight text-slate-100">ClinFlight OS</span>
        </div>
        <p className="text-xs text-slate-500">Clinical Teaching Operating System</p>
        <p className="max-w-xl text-[11px] text-slate-600">
          For medical education and simulation only. Synthetic cases. Not for real patient diagnosis or treatment.
        </p>
      </div>
    </footer>
  )
}
