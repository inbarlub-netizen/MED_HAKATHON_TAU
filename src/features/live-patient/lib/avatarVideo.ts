import { voiceId } from '@/lib/voice'
import manifest from './avatarManifest.json'

/**
 * Pre-rendered talking-head videos. Each scripted patient line can have a
 * photorealistic MP4 (David's face talking, lips matched to the audio) generated
 * offline once and shipped to /public/video/<id>.mp4 - keyed by the SAME text hash
 * as the Kokoro audio so video and line stay in sync.
 *
 * If a line has no video the app falls back to the photo + amplitude mouth, so the
 * room always works. Drop MP4s in and they light up automatically.
 */
const ids = new Set<string>(manifest as string[])

export function hasAvatarVideo(text: string): boolean {
  return ids.has(voiceId(text))
}

export function avatarVideoUrl(text: string): string {
  return `${import.meta.env.BASE_URL}video/${voiceId(text)}.mp4`
}

export const avatarVideoCount = ids.size
