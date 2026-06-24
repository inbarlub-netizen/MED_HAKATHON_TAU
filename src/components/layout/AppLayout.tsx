import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Plane,
  Stethoscope,
  HeartPulse,
  Clapperboard,
  LineChart,
  Building2,
  Bot,
  Wrench,
  Route as RouteIcon,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/flight-deck', label: 'Student Flight Deck', icon: Plane },
  { to: '/cockpit', label: 'Clinical Cockpit', icon: Stethoscope },
  { to: '/debrief', label: 'OSCE Debrief / Replay', icon: Clapperboard },
  { to: '/progress', label: 'My Progress', icon: LineChart },
  { to: '/faculty', label: 'Faculty Command', icon: Building2 },
  { to: '/instructor', label: 'Instructor Copilot', icon: Bot },
  { to: '/builder', label: 'Case Builder', icon: Wrench, tag: 'Preview' },
  { to: '/rotation', label: 'Rotation Companion', icon: RouteIcon, tag: 'Preview' },
  { to: '/safety', label: 'Safety / Settings', icon: ShieldCheck },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const loc = useLocation()
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-ink-800/60 backdrop-blur-xl lg:flex">
        <Brand />
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-white/10 text-cyan-200'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-y-1 left-0 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500"
                    />
                  )}
                  <n.icon size={18} className="shrink-0" />
                  <span className="flex-1 truncate">{n.label}</span>
                  {n.tag && (
                    <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-300">
                      {n.tag}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3 text-[11px] leading-relaxed text-amber-200/90">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>Education & simulation only. Synthetic cases. Not for real diagnosis or treatment.</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-5 py-6 sm:px-8">
          <motion.div
            key={loc.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-3 px-5 py-5">
      <img
        src="/images/clinflight/logo/clinflight_app_icon.png"
        alt="ClinFlight OS"
        className="h-10 w-10 rounded-xl ring-1 ring-white/10"
      />
      <div className="leading-tight">
        <div className="text-sm font-bold tracking-tight text-slate-100">ClinFlight OS</div>
        <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
          Clinical Teaching OS
        </div>
      </div>
    </NavLink>
  )
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-ink-900/70 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <img src="/images/clinflight/logo/clinflight_app_icon.png" alt="ClinFlight OS" className="h-7 w-7 rounded-lg" />
        <span className="text-sm font-bold">ClinFlight OS</span>
      </div>
      <div className="hidden items-center gap-2 text-xs text-slate-400 lg:flex">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60" />
        Local deterministic demo · no API key required
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:flex">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-[10px] font-bold text-ink-900">
            MC
          </div>
          <span className="text-xs font-medium text-slate-300">Maya Cohen</span>
          <span className="chip !py-0.5 !text-[10px]">TAU Med 2026</span>
        </div>
      </div>
    </header>
  )
}
