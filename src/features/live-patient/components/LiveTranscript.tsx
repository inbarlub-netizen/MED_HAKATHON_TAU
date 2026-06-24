import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardHeader } from '@/components/ui/primitives'
import { MessagesSquare } from 'lucide-react'
import type { LiveTurn, RoomPhase } from '../types'
import { cn } from '@/lib/utils'

export default function LiveTranscript({ turns, phase }: { turns: LiveTurn[]; phase: RoomPhase }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns.length, phase])

  return (
    <Card className="flex flex-col">
      <CardHeader icon={<MessagesSquare size={18} />} title="Live transcript" />
      <div className="max-h-72 flex-1 space-y-2.5 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {turns.map((t) => {
            const clinician = t.role === 'clinician'
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', clinician ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug',
                    clinician
                      ? 'rounded-br-sm bg-cyan-500/15 text-cyan-50 ring-1 ring-cyan-400/20'
                      : 'rounded-bl-sm bg-white/5 text-slate-200 ring-1 ring-white/10'
                  )}
                >
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {clinician ? 'You' : 'David'}
                  </div>
                  {t.text}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {phase === 'processing' && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white/5 px-3.5 py-2 text-sm text-slate-400 ring-1 ring-white/10">
              <span className="inline-flex gap-1">
                <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </Card>
  )
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 0.9, repeat: Infinity, delay }}
    />
  )
}
