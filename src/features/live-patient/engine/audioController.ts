import { hasVoice, voiceId } from '@/lib/voice'

/**
 * Drives the patient avatar's mouth from live audio amplitude.
 *  - If a pre-rendered Kokoro line exists, plays the MP3 through a WebAudio
 *    AnalyserNode and exposes a real RMS level (true amplitude lip-sync).
 *  - Otherwise falls back to browser SpeechSynthesis with a synthetic envelope
 *    so the mouth still animates.
 * The current level is read imperatively by PatientVisual (no React re-render).
 */

let level = 0
let speaking = false
let ctx: AudioContext | null = null
let el: HTMLAudioElement | null = null
let raf = 0
let synthInterval: number | null = null

export function getMouthLevel(): number {
  return level
}
export function isSpeaking(): boolean {
  return speaking
}

export function stopPatient() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  if (synthInterval) {
    clearInterval(synthInterval)
    synthInterval = null
  }
  if (el) {
    try {
      el.pause()
      el.onended = null
      el.onerror = null
    } catch {
      /* noop */
    }
    el = null
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* noop */
    }
  }
  level = 0
  speaking = false
}

/** Must be called from a user gesture once (the Start button) to satisfy autoplay. */
export function primeAudio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      ctx = null
    }
  }
  ctx?.resume().catch(() => {})
}

export function playPatient(text: string): Promise<void> {
  stopPatient()
  if (hasVoice(text)) return playMp3(`${import.meta.env.BASE_URL}audio/${voiceId(text)}.mp3`)
  return playSpeech(text)
}

function playMp3(url: string): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const audio = new Audio(url)
      audio.crossOrigin = 'anonymous'
      el = audio
      const source = ctx.createMediaElementSource(audio)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyser.connect(ctx.destination)
      const data = new Uint8Array(analyser.frequencyBinCount)
      speaking = true

      const tick = () => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        level = Math.min(1, Math.sqrt(sum / data.length) * 4.5)
        raf = requestAnimationFrame(tick)
      }
      const done = () => {
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        level = 0
        speaking = false
        resolve()
      }
      audio.onended = done
      audio.onerror = done
      ctx
        .resume()
        .catch(() => {})
        .finally(() => {
          audio
            .play()
            .then(() => tick())
            .catch(() => done())
        })
      // Safety cap if 'ended' never fires.
      window.setTimeout(() => {
        if (speaking) done()
      }, 16000)
    } catch {
      level = 0
      speaking = false
      resolve()
    }
  })
}

function playSpeech(text: string): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve()
      return
    }
    const clean = text.replace(/\(.*?\)/g, '').trim()
    if (!clean) {
      resolve()
      return
    }
    const u = new SpeechSynthesisUtterance(clean)
    u.rate = 0.95
    u.pitch = 0.8
    speaking = true
    synthInterval = window.setInterval(() => {
      level = 0.3 + Math.random() * 0.6
    }, 110)
    const done = () => {
      if (synthInterval) clearInterval(synthInterval)
      synthInterval = null
      level = 0
      speaking = false
      resolve()
    }
    u.onend = done
    u.onerror = done
    try {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch {
      done()
    }
    window.setTimeout(() => {
      if (speaking) done()
    }, 15000)
  })
}
