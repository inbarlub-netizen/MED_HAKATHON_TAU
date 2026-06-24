import { hasAvatarVideo, avatarVideoUrl } from '../lib/avatarVideo'
import { playPatient, stopPatient } from './audioController'
import { hasTalkingHead, thSpeak, thStop } from './talkingHeadBridge'
import { hasVoice, voiceId } from '@/lib/voice'

/**
 * Chooses the best available patient playback for a line:
 *  1. TalkingHead 3D avatar (when mounted) — handles both audio + lip sync
 *  2. Pre-rendered talking-head MP4
 *  3. Photo + amplitude-mouth audio fallback (audioController)
 *
 * PatientVisual registers its <video> element here and subscribes to the current
 * video URL so it can swap between the talking video and the still photo.
 */

let videoEl: HTMLVideoElement | null = null
let currentVideoUrl: string | null = null
const subscribers = new Set<() => void>()
let resolver: (() => void) | null = null

export function registerVideoEl(el: HTMLVideoElement | null) {
  videoEl = el
}

export function getCurrentVideoUrl(): string | null {
  return currentVideoUrl
}

export function subscribe(cb: () => void): () => void {
  subscribers.add(cb)
  return () => subscribers.delete(cb)
}

function emit() {
  subscribers.forEach((cb) => cb())
}

export function playMedia(text: string): Promise<void> {
  stopMedia()

  // TalkingHead 3D avatar takes priority — it owns both audio and animation
  if (hasTalkingHead()) {
    const audioUrl = hasVoice(text)
      ? `${import.meta.env.BASE_URL}audio/${voiceId(text)}.mp3`
      : null
    return thSpeak(text, audioUrl)
  }

  if (!hasAvatarVideo(text)) return playPatient(text)

  currentVideoUrl = avatarVideoUrl(text)
  emit()

  return new Promise<void>((resolve) => {
    resolver = resolve
    const fallbackToAudio = () => {
      currentVideoUrl = null
      emit()
      playPatient(text).then(finish)
    }
    let tries = 0
    const tryPlay = () => {
      if (videoEl) {
        videoEl.onended = finish
        videoEl.onerror = fallbackToAudio
        videoEl.currentTime = 0
        videoEl.play().catch(fallbackToAudio)
      } else if (tries++ < 40) {
        setTimeout(tryPlay, 40)
      } else {
        fallbackToAudio()
      }
    }
    setTimeout(tryPlay, 30)
  })
}

function finish() {
  currentVideoUrl = null
  emit()
  const r = resolver
  resolver = null
  r?.()
}

export function stopMedia() {
  stopPatient()
  if (videoEl) {
    try {
      videoEl.pause()
      videoEl.onended = null
      videoEl.onerror = null
    } catch {
      /* noop */
    }
  }
  currentVideoUrl = null
  emit()
  const r = resolver
  resolver = null
  r?.()
}
