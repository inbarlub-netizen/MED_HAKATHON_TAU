import { useEffect, useRef, useState } from 'react'
import { registerTalkingHead, unregisterTalkingHead } from '../engine/talkingHeadBridge'

const PHOTO_URL = `${import.meta.env.BASE_URL}images/live-patient/david.png`

// Mouth position calibrated for david.png (lying in ER bed, head on left side of frame)
// cx/cy are fractions of image width/height; angle in degrees
const MOUTH = { cx: 0.109, cy: 0.633, w: 44, h: 12, maxOpen: 15, angle: 5 }

export default function PhotoLipSyncAvatar() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const imgRef      = useRef<HTMLImageElement | null>(null)
  const openRef     = useRef(0)
  const targetRef   = useRef(0)
  const rafRef      = useRef<number>(0)
  const actxRef     = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const sourceRef   = useRef<AudioBufferSourceNode | null>(null)
  const resolveRef  = useRef<(() => void) | null>(null)
  const [ready, setReady] = useState(false)

  // Load photo and start draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.src = PHOTO_URL
    imgRef.current = img
    let cancelled = false

    img.onload = () => {
      if (cancelled) return
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      setReady(true)

      const ctx = canvas.getContext('2d')!

      function loop() {
        const analyser = analyserRef.current
        const freqData = freqDataRef.current
        if (analyser && freqData && sourceRef.current) {
          analyser.getByteFrequencyData(freqData)
          let sum = 0
          for (let i = 0; i < freqData.length; i++) sum += freqData[i]
          targetRef.current = Math.min(1, (sum / freqData.length / 255) * 2.6)
        } else {
          targetRef.current = 0
        }
        openRef.current += (targetRef.current - openRef.current) * 0.38

        drawFrame(ctx, canvas!, img, openRef.current)
        rafRef.current = requestAnimationFrame(loop)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Register speak/stop with the bridge
  useEffect(() => {
    const speakFn = async (_text: string, audioUrl: string | null): Promise<void> => {
      if (!audioUrl) return

      if (!actxRef.current) {
        const actx = new AudioContext()
        const analyser = actx.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.5
        analyserRef.current = analyser
        freqDataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
        analyser.connect(actx.destination)
        actxRef.current = actx
      }

      const actx = actxRef.current
      await actx.resume()

      const resp     = await fetch(audioUrl)
      const arrayBuf = await resp.arrayBuffer()
      const audioBuf = await actx.decodeAudioData(arrayBuf)

      return new Promise<void>((resolve) => {
        resolveRef.current = resolve
        const src = actx.createBufferSource()
        src.buffer = audioBuf
        src.connect(analyserRef.current!)
        sourceRef.current = src
        src.onended = () => {
          sourceRef.current = null
          resolveRef.current = null
          resolve()
        }
        src.start()
      })
    }

    const stopFn = () => {
      try { sourceRef.current?.stop() } catch { /* already stopped */ }
      sourceRef.current = null
      const r = resolveRef.current
      if (r) { resolveRef.current = null; r() }
    }

    registerTalkingHead(speakFn, stopFn)
    return () => {
      stopFn()
      unregisterTalkingHead()
      try { actxRef.current?.close() } catch { /* noop */ }
      actxRef.current = null
    }
  }, [])

  return (
    <div className="absolute inset-0 bg-black">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="animate-pulse rounded bg-black/40 px-2 py-1 text-xs text-slate-400">
            Loading...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ objectFit: 'cover', opacity: ready ? 1 : 0 }}
      />
    </div>
  )
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  open: number,
) {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  if (open <= 0.015) return

  const { cx: cxF, cy: cyF, w, h: _h, maxOpen, angle } = MOUTH
  const cx  = cxF * canvas.width
  const cy  = cyF * canvas.height
  const ang = angle * (Math.PI / 180)
  const rx  = w * 0.46
  const ry  = Math.max(0.5, open * maxOpen)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(ang)

  // Dark interior with feathered edge
  const reach = Math.max(rx, ry)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, reach)
  g.addColorStop(0.0, 'rgba(30,6,6,0.97)')
  g.addColorStop(0.55, 'rgba(55,18,18,0.82)')
  g.addColorStop(1.0, 'rgba(65,25,25,0.0)')
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()

  // Lower-lip highlight
  ctx.beginPath()
  ctx.ellipse(0, ry * 0.88, rx * 0.9, Math.max(1, ry * 0.48), 0, 0, Math.PI * 2)
  const lip = ctx.createLinearGradient(0, ry * 0.38, 0, ry * 1.38)
  lip.addColorStop(0, 'rgba(145,82,72,0.0)')
  lip.addColorStop(1, 'rgba(145,82,72,0.32)')
  ctx.fillStyle = lip
  ctx.fill()

  ctx.restore()
}
