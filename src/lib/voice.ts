import manifest from '@/data/voiceManifest.json'

/**
 * Bundled patient-voice playback. Audio is pre-rendered (edge-tts, Microsoft
 * neural voices) into /public/audio at build time, so playback needs no API key
 * and no network. Lines are matched by a normalized hash of the patient text.
 */

const ids = new Set<string>(manifest as string[])

/** Punctuation/quote-insensitive normalization so hashes are robust. */
export function normalizeLine(t: string): string {
  return t
    .replace(/\(.*?\)/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Stable djb2 hash → hex. Must match scripts/render-voices.mjs exactly. */
export function voiceId(text: string): string {
  const s = normalizeLine(text)
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) & 0xffffffff
  return (h >>> 0).toString(16)
}

// One shared element so playback is easy to control and survives autoplay rules
// once the page has had a user gesture.
let player: HTMLAudioElement | null = null
function el(): HTMLAudioElement {
  if (!player) {
    player = new Audio()
    player.preload = 'auto'
  }
  return player
}

let unlocked = false
/** Call inside a user gesture (e.g. clicking a scenario) to satisfy iOS/Safari. */
export function unlockAudio() {
  if (unlocked) return
  const a = el()
  const prev = a.src
  try {
    a.muted = true
    const p = a.play()
    if (p && typeof p.then === 'function') {
      p.then(() => {
        a.pause()
        a.muted = false
        a.src = prev
        unlocked = true
      }).catch(() => {
        a.muted = false
      })
    }
  } catch {
    a.muted = false
  }
}

export function hasVoice(text: string): boolean {
  return ids.has(voiceId(text))
}

/** Plays the bundled voice line if available. Returns true if it started. */
export function playPatientVoice(text: string): boolean {
  const id = voiceId(text)
  if (!ids.has(id)) return false
  const a = el()
  a.muted = false
  a.src = `${import.meta.env.BASE_URL}audio/${id}.mp3`
  a.currentTime = 0
  a.play().catch(() => {})
  unlocked = true
  return true
}

/** Plays a line and resolves when it finishes (or a safety cap). */
export function playVoiceAwait(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    const id = voiceId(text)
    if (!ids.has(id)) {
      resolve(false)
      return
    }
    const a = el()
    a.muted = false
    a.src = `${import.meta.env.BASE_URL}audio/${id}.mp3`
    a.currentTime = 0
    let done = false
    const finish = (ok: boolean) => {
      if (done) return
      done = true
      a.onended = null
      resolve(ok)
    }
    a.onended = () => finish(true)
    a.play()
      .then(() => {
        unlocked = true
      })
      .catch(() => finish(false))
    // safety cap in case 'ended' never fires
    window.setTimeout(() => finish(true), 11000)
  })
}

export function stopPatientVoice() {
  if (player) {
    try {
      player.pause()
      player.currentTime = 0
    } catch {
      /* noop */
    }
  }
}
