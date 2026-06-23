import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Reusable framed product screenshot with badge + caption. */
export function ProductScreenshotCard({
  src,
  title,
  subtitle,
  badge,
  alt,
  className,
  priority,
}: {
  src: string
  title?: string
  subtitle?: string
  badge?: string
  alt?: string
  className?: string
  priority?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/60 shadow-2xl shadow-cyan-500/10',
        className
      )}
    >
      {/* glow */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(400px_circle_at_50%_0%,rgba(34,211,238,0.12),transparent_60%)]" />
      {badge && (
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-200 backdrop-blur">
          {badge}
        </span>
      )}
      <img
        src={src}
        alt={alt ?? title ?? 'ClinFlight OS screen'}
        loading={priority ? 'eager' : 'lazy'}
        className="block w-full"
      />
      {(title || subtitle) && (
        <div className="border-t border-white/10 bg-slate-900/70 px-4 py-3">
          {title && <div className="text-sm font-semibold text-slate-100">{title}</div>}
          {subtitle && <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>}
        </div>
      )}
    </motion.div>
  )
}
