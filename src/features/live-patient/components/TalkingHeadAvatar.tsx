import { useEffect, useRef, useState } from 'react'
import { registerTalkingHead, unregisterTalkingHead } from '../engine/talkingHeadBridge'
import type { TalkingHead as TalkingHeadType } from '@met4citizen/talkinghead'

const AVATAR_URL = `${import.meta.env.BASE_URL}avatar/david-3d.glb?v=10`

function estimateWordTimings(text: string, durationMs: number) {
  const raw = text.replace(/\(.*?\)/g, '').replace(/[^\w\s''-]/g, ' ').trim()
  const words = raw.split(/\s+/).filter(Boolean)
  if (!words.length) return { words: [], wtimes: [], wdurations: [] }
  const totalChars = words.reduce((s, w) => s + Math.max(1, w.length), 0)
  const wtimes: number[] = []
  const wdurations: number[] = []
  let t = 0
  for (const w of words) {
    const dur = (w.length / totalChars) * durationMs
    wtimes.push(t)
    wdurations.push(Math.max(80, dur))
    t += Math.max(80, dur)
  }
  return { words, wtimes, wdurations }
}

export default function TalkingHeadAvatar() {
  const nodeRef    = useRef<HTMLDivElement>(null)
  const headRef    = useRef<TalkingHeadType | null>(null)
  const actxRef    = useRef<AudioContext | null>(null)
  const resolveRef = useRef<(() => void) | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!nodeRef.current) return
    const node = nodeRef.current
    let cancelled = false

    void (async () => {
      try {
        const { TalkingHead } = await import('@met4citizen/talkinghead')
        if (cancelled) return

        const actx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        actxRef.current = actx

        const head = new TalkingHead(node, {
          audioCtx: actx,
          ttsEndpoint: null,
          lipsyncModules: ['en'],
          cameraDistance: 0,
          cameraY: 0,
          modelFPS: 30,
          lightAmbientIntensity: 1.4,
          lightDirectIntensity: 3.5,
        })
        headRef.current = head

        await head.showAvatar(
          {
            url: AVATAR_URL,
            body: 'M',
            lipsyncLang: 'en',
            lipsyncHeadMovement: false,
            avatarMood: 'neutral',
            avatarIdleEyeContact: 1,
            avatarSpeakingEyeContact: 1,
            avatarListeningEyeContact: 1,
            baseline: { headRotateX: -0.06 },
          },
          null,
        )

        if (cancelled) { head.closeAvatar(); return }

        // cameraY:1 → look-at y = 2/3*height (chest), cameraDistance:4.5 → z=9 (pulled back)
        head.setView('upper', { cameraDistance: 4.5, cameraY: 1 })

        // Tint the canvas to age the avatar visually (warmer, slightly desaturated)
        const canvas = node.querySelector('canvas')
        if (canvas) {
          // sepia adds warm skin tone; brightness dims the white-out; contrast adds depth
          canvas.style.filter = 'sepia(0.25) brightness(0.85) contrast(1.12)'
        }

        setStatus('ready')

        const speakFn = async (text: string, audioUrl: string | null): Promise<void> => {
          const h  = headRef.current
          const ac = actxRef.current
          if (!h || !ac) return
          if (!audioUrl) return
          const resp     = await fetch(audioUrl)
          const arrayBuf = await resp.arrayBuffer()
          await ac.resume()
          const audioBuf = await ac.decodeAudioData(arrayBuf)
          const durationMs = audioBuf.duration * 1000
          const { words, wtimes, wdurations } = estimateWordTimings(text, durationMs)
          return new Promise<void>((resolve) => {
            resolveRef.current = resolve
            const done = () => { resolveRef.current = null; resolve() }
            h.speakAudio({ audio: audioBuf, words, wtimes, wdurations,
              markers: [done], mtimes: [Math.max(0, durationMs - 100)] })
          })
        }

        const stopFn = () => {
          headRef.current?.stopSpeaking()
          const r = resolveRef.current
          if (r) { resolveRef.current = null; r() }
        }

        if (!cancelled) registerTalkingHead(speakFn, stopFn)
      } catch (err) {
        console.error('[TalkingHead] load failed:', err)
        if (!cancelled) setStatus('error')
      }
    })()

    return () => {
      cancelled = true
      unregisterTalkingHead()
      resolveRef.current?.()
      resolveRef.current = null
      try { headRef.current?.closeAvatar() } catch { /* noop */ }
      headRef.current = null
      try { actxRef.current?.close() } catch { /* noop */ }
      actxRef.current = null
    }
  }, [])

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}images/er-room.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {status === 'loading' && (
        <span className="text-xs text-slate-400 animate-pulse bg-black/40 px-2 py-1 rounded">Loading 3D avatar...</span>
      )}
      {status === 'error' && (
        <span className="text-xs text-rose-400 bg-black/40 px-2 py-1 rounded">Avatar failed to load</span>
      )}

      <div
        ref={nodeRef}
        className="absolute inset-0"
        style={{ opacity: status === 'ready' ? 1 : 0 }}
      />
    </div>
  )
}
