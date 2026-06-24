import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardHeader } from '@/components/ui/primitives'
import { TrendingUp, TrendingDown, Unlock, AlertTriangle, Sparkles, Zap } from 'lucide-react'
import type { ScoringEvent } from '../types'
import { cn } from '@/lib/utils'

const META: Record<ScoringEvent['type'], { icon: any; tone: string }> = {
  trust_up: { icon: TrendingUp, tone: 'text-emerald-300 border-emerald-400/20 bg-emerald-400/[0.06]' },
  trust_down: { icon: TrendingDown, tone: 'text-rose-300 border-rose-400/20 bg-rose-400/[0.06]' },
  hidden_concern_progress: { icon: Sparkles, tone: 'text-violet-300 border-violet-400/20 bg-violet-400/[0.06]' },
  concern_revealed: { icon: Unlock, tone: 'text-fuchsia-200 border-fuchsia-400/30 bg-fuchsia-500/[0.10]' },
  missed_opportunity: { icon: AlertTriangle, tone: 'text-amber-300 border-amber-400/20 bg-amber-400/[0.06]' },
}

export default function ScoringEvents({ events }: { events: ScoringEvent[] }) {
  return (
    <Card>
      <CardHeader icon={<Zap size={18} />} title="Scoring events" subtitle="Live teaching moments" />
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {events.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-500">
            Events appear as you speak with David.
          </p>
        )}
        <AnimatePresence initial={false}>
          {events.map((e) => {
            const m = META[e.type]
            const Icon = m.icon
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={cn('flex items-start gap-2 rounded-lg border px-3 py-2 text-xs', m.tone)}
              >
                <Icon size={14} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="leading-snug">{e.message}</span>
                  <span className="ml-2 text-[10px] text-slate-500">{e.t}s</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Card>
  )
}
