import { useState } from 'react'
import { Mic, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { useVoiceCapture } from '@/hooks/useVoiceCapture'
import { STARTER_PROMPTS, DEMO_PHRASES } from '@/engine/coachEngine'
import { cn } from '@/lib/utils'

/**
 * Clinician input: hold-to-talk (Web Speech) + a typed fallback that always works,
 * plus one-click starter phrases so the room demos with no mic.
 */
export default function MicControl({
  disabled,
  onSubmit,
}: {
  disabled: boolean
  onSubmit: (text: string) => void
}) {
  const [text, setText] = useState('')
  const voice = useVoiceCapture()

  const send = (value: string) => {
    const v = value.trim()
    if (!v || disabled) return
    onSubmit(v)
    setText('')
  }

  const onHoldStart = () => {
    if (disabled) return
    voice.start()
  }
  const onHoldEnd = () => {
    if (!voice.recording) return
    const { text: spoken } = voice.stop()
    if (spoken.trim()) send(spoken)
  }

  return (
    <div className="space-y-3">
      {/* Starter / demo phrases */}
      <div className="flex flex-wrap gap-2">
        {STARTER_PROMPTS.slice(0, 3).map((p) => (
          <Chip key={p} label={shorten(p)} onClick={() => send(p)} disabled={disabled} />
        ))}
        <Chip label="Weak medication question" tone="warning" onClick={() => send(DEMO_PHRASES.bad)} disabled={disabled} />
        <Chip label="Normalizing question" tone="success" onClick={() => send(DEMO_PHRASES.good)} disabled={disabled} />
      </div>

      <div className="flex items-end gap-2">
        <button
          type="button"
          onPointerDown={onHoldStart}
          onPointerUp={onHoldEnd}
          onPointerLeave={onHoldEnd}
          disabled={disabled}
          className={cn(
            'grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition-all',
            voice.recording
              ? 'border-rose-400/40 bg-rose-500/20 text-rose-200'
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          title="Hold to talk"
        >
          <Mic size={18} className={voice.recording ? 'animate-pulse' : ''} />
        </button>

        <div className="flex-1">
          <input
            value={voice.recording ? voice.transcript : text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(text)}
            disabled={disabled}
            placeholder={voice.recording ? 'Listening…' : 'Speak (hold the mic) or type what you say to David…'}
            className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/40 disabled:opacity-50"
          />
        </div>

        <Button onClick={() => send(text)} disabled={disabled || !text.trim()} className="h-12">
          <Send size={16} />
          Send
        </Button>
      </div>
      {voice.permissionDenied && (
        <p className="flex items-center gap-1.5 text-[11px] text-amber-300/80">
          <Sparkles size={12} /> Microphone unavailable - typing works perfectly for the demo.
        </p>
      )}
    </div>
  )
}

function Chip({
  label,
  onClick,
  disabled,
  tone = 'slate',
}: {
  label: string
  onClick: () => void
  disabled: boolean
  tone?: 'slate' | 'warning' | 'success'
}) {
  const tones: Record<string, string> = {
    slate: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
    warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20',
    success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50',
        tones[tone]
      )}
    >
      {label}
    </button>
  )
}

function shorten(s: string): string {
  return s.length > 42 ? s.slice(0, 40).trimEnd() + '…' : s
}
