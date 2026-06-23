import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type HTMLMotionProps } from 'framer-motion'
import * as React from 'react'
import { cn } from '@/lib/utils'

/* ---------- Card ---------- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card p-5', className)} {...props} />
}

export function CardHeader({
  title,
  subtitle,
  icon,
  right,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

/* ---------- Badge ---------- */
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5',
  {
    variants: {
      tone: {
        slate: 'border-white/10 bg-white/5 text-slate-300',
        cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
        violet: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
        success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
        warning: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
        danger: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
      },
    },
    defaultVariants: { tone: 'slate' },
  }
)
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}
export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}

/* ---------- Button ---------- */
const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      violet: 'btn-violet',
      ghost: 'btn-ghost',
      danger:
        'btn bg-gradient-to-r from-rose-500 to-red-500 text-white hover:brightness-110',
      subtle: 'btn bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10',
    },
    size: {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: '',
      lg: 'px-5 py-3 text-base',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})
export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref'>,
    VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'

/* ---------- Stat ---------- */
export function Stat({
  label,
  value,
  unit,
  delta,
  tone = 'slate',
  icon,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  delta?: string
  tone?: 'slate' | 'cyan' | 'violet' | 'success' | 'warning' | 'danger'
  icon?: React.ReactNode
}) {
  const toneText: Record<string, string> = {
    slate: 'text-slate-100',
    cyan: 'text-cyan-300',
    violet: 'text-violet-300',
    success: 'text-emerald-300',
    warning: 'text-amber-300',
    danger: 'text-rose-300',
  }
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn('text-2xl font-bold tracking-tight', toneText[tone])}>{value}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
      {delta && <div className="mt-1 text-[11px] text-slate-400">{delta}</div>}
    </div>
  )
}

/* ---------- Section heading ---------- */
export function SectionTitle({
  eyebrow,
  title,
  desc,
  right,
}: {
  eyebrow?: string
  title: React.ReactNode
  desc?: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="label-eyebrow mb-2">{eyebrow}</div>}
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h2>
        {desc && <p className="mt-1 max-w-2xl text-sm text-slate-400">{desc}</p>}
      </div>
      {right}
    </div>
  )
}

/* ---------- Animated wrapper ---------- */
export function FadeIn({
  delay = 0,
  className,
  children,
}: {
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
