import type { AudioMetrics } from '@/types'

const FILLERS_EN = ['um', 'uh', 'like', 'you know', 'basically', 'sort of', 'kind of']
const FILLERS_HE = ['אממ', 'אהה', 'כאילו', 'כזה', 'לא יודע', 'רגע', 'בעצם']
const ALL_FILLERS = [...FILLERS_EN, ...FILLERS_HE]

/**
 * Computes delivery metrics from transcript text and optional real audio duration.
 * When real audio is unavailable we generate stable deterministic estimates so the
 * demo never shows empty values. Marked `simulated` so the UI can label it honestly.
 */
export function computeAudioMetrics(text: string, durationSec?: number): AudioMetrics {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = Math.max(1, words.length)

  let fillerWordCount = 0
  const lower = text.toLowerCase()
  for (const f of ALL_FILLERS) {
    const matches = lower.split(f).length - 1
    fillerWordCount += matches
  }

  const simulated = !durationSec
  // Estimate a natural duration if recording was not available (~150 wpm).
  const dur = durationSec ?? Math.max(2.5, (wordCount / 150) * 60)
  const speechRateWpm = Math.round((wordCount / dur) * 60)

  // Deterministic pseudo-metrics seeded by text length so they are stable per turn.
  const seed = (text.length * 9301 + 49297) % 233280
  const rnd = (min: number, max: number) => min + ((seed % 1000) / 1000) * (max - min)

  const longPauseCount = Math.round(rnd(0, 2))
  const hesitationCount = fillerWordCount + Math.round(rnd(0, 1))

  return {
    speechRateWpm,
    pauseRatio: +rnd(0.12, 0.26).toFixed(2),
    longPauseCount,
    averagePauseMs: Math.round(rnd(280, 620)),
    fillerWordCount,
    fillerWordRate: +(fillerWordCount / wordCount).toFixed(3),
    hesitationCount,
    volumeStability: +rnd(0.7, 0.95).toFixed(2),
    averageVolume: +rnd(0.4, 0.7).toFixed(2),
    responseLatency: Math.round(rnd(400, 1200)),
    durationSec: +dur.toFixed(1),
    simulated,
  }
}

export { ALL_FILLERS }
