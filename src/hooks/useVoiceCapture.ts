import { useCallback, useEffect, useRef, useState } from 'react'

interface SpeechRecognitionLike {
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: any) => void) | null
  onend: (() => void) | null
  onerror: ((e: any) => void) | null
  continuous: boolean
  interimResults: boolean
  lang: string
}

/**
 * Voice capture hook. Tries the Web Speech API + real audio level metering.
 * Always degrades gracefully to a typed fallback so the demo never breaks.
 */
export function useVoiceCapture() {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [level, setLevel] = useState(0) // 0..1 live mic amplitude
  const [supported, setSupported] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const durationRef = useRef(0)
  const startTsRef = useRef(0)

  const recogRef = useRef<SpeechRecognitionLike | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  const stopMeter = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    setLevel(0)
  }, [])

  const startMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      src.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 3.2))
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      setPermissionDenied(true)
    }
  }, [])

  const start = useCallback(() => {
    setTranscript('')
    startTsRef.current = Date.now()
    setRecording(true)
    startMeter()

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      const r: SpeechRecognitionLike = new SR()
      r.continuous = true
      r.interimResults = true
      r.lang = 'en-US'
      r.onresult = (e: any) => {
        let text = ''
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript
        setTranscript(text)
      }
      r.onerror = () => {}
      r.onend = () => {}
      try {
        r.start()
        recogRef.current = r
      } catch {
        /* already started */
      }
    }
  }, [startMeter])

  const stop = useCallback((): { text: string; durationSec: number } => {
    durationRef.current = (Date.now() - startTsRef.current) / 1000
    setRecording(false)
    stopMeter()
    try {
      recogRef.current?.stop()
    } catch {
      /* noop */
    }
    recogRef.current = null
    return { text: transcript, durationSec: durationRef.current }
  }, [stopMeter, transcript])

  useEffect(() => () => stopMeter(), [stopMeter])

  return { recording, transcript, setTranscript, level, supported, permissionDenied, start, stop }
}

/** Optional patient TTS - never used for scoring. */
export function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text.replace(/\(.*?\)/g, ''))
  u.rate = 0.95
  u.pitch = 0.9
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
