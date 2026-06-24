import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import type { PatientEmotion, RoomPhase } from '../types'
import { getMouthLevel } from '../engine/audioController'
import { getCurrentVideoUrl, registerVideoEl, subscribe } from '../engine/mediaController'
import { cn } from '@/lib/utils'

/**
 * Patient visual.
 *
 * Layers (bottom → top):
 *  1. David's photo — static, CSS background with FRAME zoom/pos
 *  2. Pre-rendered talking-head video (Wav2Lip) — exact same framing, overlays on speaking
 *  3. Audio waveform bars — respond to voice amplitude
 *  4. Emotion tint, vignette, rim glow, listening pulse
 *
 * Video framing: the <video> element is positioned with inline JS-calculated styles
 * so it exactly replicates the CSS background zoom/position, producing a seamless
 * photo → video transition with zero reframing.
 *
 * Generate videos with:  python scripts/generate_lipsync.py
 */

const FRAME = { zoom: 200, posX: 4, posY: 65 }

const EMOTION_TINT: Record<PatientEmotion, string> = {
  anxious:     'rgba(56,189,248,0.07)',
  guarded:     'rgba(100,116,139,0.12)',
  relieved:    'rgba(52,211,153,0.07)',
  confused:    'rgba(168,85,247,0.07)',
  cooperative: 'rgba(255,255,255,0)',
}

const BAR_COUNT = 28

export default function PatientVisual({
  emotion,
  phase,
}: {
  emotion: PatientEmotion
  phase: RoomPhase
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef     = useRef<HTMLVideoElement>(null)
  const barsRef      = useRef<HTMLDivElement[]>([])
  const rafRef       = useRef(0)
  const videoUrl     = useSyncExternalStore(subscribe, getCurrentVideoUrl)

  useEffect(() => {
    registerVideoEl(videoRef.current)
    return () => registerVideoEl(null)
  }, [])

  // After each video loads, position it so it exactly matches the photo framing.
  // Calculates: video at FRAME.zoom% width, offset by posX/posY of overflow.
  const applyVideoFrame = useCallback(() => {
    const v  = videoRef.current
    const ct = containerRef.current
    if (!v || !ct || !v.videoWidth) return

    const cW = ct.clientWidth
    const cH = ct.clientHeight
    const vW = cW * (FRAME.zoom / 100)
    const vH = vW * (v.videoHeight / v.videoWidth)

    v.style.width  = `${vW}px`
    v.style.height = `${vH}px`
    v.style.left   = `${-(FRAME.posX / 100) * (vW - cW)}px`
    v.style.top    = `${-(FRAME.posY / 100) * (vH - cH)}px`
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.addEventListener('loadedmetadata', applyVideoFrame)
    return () => v.removeEventListener('loadedmetadata', applyVideoFrame)
  }, [applyVideoFrame])

  // Animate waveform bars from live audio amplitude
  useEffect(() => {
    const bars = barsRef.current
    let phase2 = 0

    const tick = () => {
      const lvl = getMouthLevel()
      phase2 += 0.08

      for (let i = 0; i < bars.length; i++) {
        const b = bars[i]
        if (!b) continue
        const wave = Math.sin(phase2 + i * 0.55) * 0.4 + 0.6
        const h    = lvl > 0.01
          ? 4 + lvl * wave * 36
          : 3 + Math.sin(phase2 * 0.3 + i * 0.8) * 1.5
        b.style.height  = `${h}px`
        b.style.opacity = lvl > 0.01 ? `${0.55 + lvl * 0.45}` : '0.28'
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const speaking = phase === 'patient-speaking'

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-2xl bg-ink-900">

      {/* 1. David's photo — static background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:    'url(/images/live-patient/david.png)',
          backgroundSize:     `${FRAME.zoom}%`,
          backgroundPosition: `${FRAME.posX}% ${FRAME.posY}%`,
          backgroundRepeat:   'no-repeat',
        }}
      />

      {/* 2. Wav2Lip talking-head video — same framing as photo, positioned in JS */}
      <video
        ref={videoRef}
        src={videoUrl ?? undefined}
        playsInline
        className={cn(
          'absolute z-[2] transition-opacity duration-300',
          videoUrl ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        style={{ position: 'absolute' }}
      />

      {/* 3. Vignette + bottom fade */}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(120%_90%_at_50%_15%,transparent_40%,rgba(2,6,18,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-1/3 bg-gradient-to-t from-ink-900 via-ink-900/50 to-transparent" />

      {/* 4. Emotion colour wash */}
      <div
        className="pointer-events-none absolute inset-0 z-[4] transition-colors duration-700"
        style={{ background: EMOTION_TINT[emotion] }}
      />

      {/* 5. Audio waveform — clinical speech indicator */}
      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-[5] flex items-end justify-center gap-[3px] px-8">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <div
            key={i}
            ref={(el) => { if (el) barsRef.current[i] = el }}
            className="w-[3px] rounded-full bg-cyan-400 transition-none"
            style={{ height: '3px', opacity: 0.28 }}
          />
        ))}
      </div>

      {/* 6. Speaking rim glow */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-[6] transition-opacity duration-500',
          speaking ? 'opacity-100' : 'opacity-0',
        )}
        style={{ boxShadow: 'inset 0 0 100px rgba(34,211,238,0.20)' }}
      />

      {/* 7. Listening violet pulse */}
      {phase === 'listening' && (
        <div
          className="pointer-events-none absolute inset-0 z-[6] animate-pulse"
          style={{ boxShadow: 'inset 0 0 80px rgba(167,139,250,0.14)' }}
        />
      )}
    </div>
  )
}
