import * as TabsP from '@radix-ui/react-tabs'
import * as ProgressP from '@radix-ui/react-progress'
import * as TooltipP from '@radix-ui/react-tooltip'
import * as DialogP from '@radix-ui/react-dialog'
import * as SwitchP from '@radix-ui/react-switch'
import * as SeparatorP from '@radix-ui/react-separator'
import * as ScrollAreaP from '@radix-ui/react-scroll-area'
import { X } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

/* Tabs */
export const Tabs = TabsP.Root
export function TabsList({ className, ...p }: React.ComponentProps<typeof TabsP.List>) {
  return (
    <TabsP.List
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1',
        className
      )}
      {...p}
    />
  )
}
export function TabsTrigger({ className, ...p }: React.ComponentProps<typeof TabsP.Trigger>) {
  return (
    <TabsP.Trigger
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 transition-all data-[state=active]:bg-white/10 data-[state=active]:text-cyan-200 data-[state=active]:shadow-sm hover:text-slate-200',
        className
      )}
      {...p}
    />
  )
}
export const TabsContent = TabsP.Content

/* Progress bar */
export function Progress({
  value,
  className,
  tone = 'cyan',
}: {
  value: number
  className?: string
  tone?: 'cyan' | 'violet' | 'success' | 'warning' | 'danger'
}) {
  const tones: Record<string, string> = {
    cyan: 'from-cyan-400 to-blue-500',
    violet: 'from-violet-400 to-fuchsia-500',
    success: 'from-emerald-400 to-teal-500',
    warning: 'from-amber-400 to-orange-500',
    danger: 'from-rose-400 to-red-500',
  }
  return (
    <ProgressP.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/10', className)}
    >
      <ProgressP.Indicator
        className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out', tones[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </ProgressP.Root>
  )
}

/* Tooltip */
export function Tip({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <TooltipP.Provider delayDuration={150}>
      <TooltipP.Root>
        <TooltipP.Trigger asChild>{children}</TooltipP.Trigger>
        <TooltipP.Portal>
          <TooltipP.Content
            sideOffset={6}
            className="z-50 max-w-xs rounded-lg border border-white/10 bg-slate-900/95 px-3 py-2 text-xs text-slate-200 shadow-xl backdrop-blur"
          >
            {label}
            <TooltipP.Arrow className="fill-slate-900" />
          </TooltipP.Content>
        </TooltipP.Portal>
      </TooltipP.Root>
    </TooltipP.Provider>
  )
}

/* Dialog */
export const Dialog = DialogP.Root
export const DialogTrigger = DialogP.Trigger
export function DialogContent({
  className,
  children,
  title,
}: {
  className?: string
  children: React.ReactNode
  title?: React.ReactNode
}) {
  return (
    <DialogP.Portal>
      <DialogP.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
      <DialogP.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl focus:outline-none',
          className
        )}
      >
        {title && (
          <DialogP.Title className="mb-3 text-base font-semibold text-slate-100">{title}</DialogP.Title>
        )}
        {children}
        <DialogP.Close className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-slate-200">
          <X size={16} />
        </DialogP.Close>
      </DialogP.Content>
    </DialogP.Portal>
  )
}

/* Switch */
export function Switch({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  id?: string
}) {
  return (
    <SwitchP.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="relative h-6 w-11 rounded-full border border-white/10 bg-white/10 transition-colors data-[state=checked]:bg-cyan-500/80"
    >
      <SwitchP.Thumb className="block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-6" />
    </SwitchP.Root>
  )
}

/* Separator */
export function Separator({ className }: { className?: string }) {
  return <SeparatorP.Root className={cn('h-px w-full bg-white/10', className)} />
}

/* ScrollArea */
export function ScrollArea({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <ScrollAreaP.Root className={cn('overflow-hidden', className)}>
      <ScrollAreaP.Viewport className="h-full w-full">{children}</ScrollAreaP.Viewport>
      <ScrollAreaP.Scrollbar
        orientation="vertical"
        className="flex w-2 touch-none select-none p-0.5"
      >
        <ScrollAreaP.Thumb className="flex-1 rounded-full bg-white/20" />
      </ScrollAreaP.Scrollbar>
    </ScrollAreaP.Root>
  )
}
