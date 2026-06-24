/**
 * Singleton bridge so mediaController can drive TalkingHead
 * without a direct import cycle (mediaController → PatientVisual).
 *
 * PatientVisual registers its speak/stop callbacks here on mount.
 * mediaController calls thSpeak/thStop when TalkingHead is mounted.
 */

type SpeakFn = (text: string, audioUrl: string | null) => Promise<void>
type StopFn  = () => void

let _speak: SpeakFn | null = null
let _stop:  StopFn  | null = null

export function registerTalkingHead(speak: SpeakFn, stop: StopFn) {
  _speak = speak
  _stop  = stop
}

export function unregisterTalkingHead() {
  _speak = null
  _stop  = null
}

export function hasTalkingHead(): boolean {
  return _speak !== null
}

export function thSpeak(text: string, audioUrl: string | null): Promise<void> {
  return _speak ? _speak(text, audioUrl) : Promise.resolve()
}

export function thStop(): void {
  _stop?.()
}
