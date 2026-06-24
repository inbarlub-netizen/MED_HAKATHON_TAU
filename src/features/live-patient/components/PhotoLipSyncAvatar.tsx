import { useEffect, useRef, useState } from 'react'
import { registerTalkingHead, unregisterTalkingHead } from '../engine/talkingHeadBridge'

const PHOTO_URL = `${import.meta.env.BASE_URL}images/live-patient/david.png`

// Mouth position in the photo, as fractions of the raw image size.
// cx/cy = center of mouth, w/maxOpen = size in raw image pixels, angle in degrees.
// The person is lying on their left (from our view) in the lower-left of the photo.
const MOUTH = { cx: 0.109, cy: 0.628, w: 48, maxOpen: 16, angle: 3 }

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false

    const img = new Image()
    img.src = PHOTO_URL
    imgRef.current = img

    img.onload = () => {
      if (cancelled) return
      // Fixed internal resolution (16:9). Image drawn with cover-scale math below.
      canvas.width  = 1600
      canvas.height = 900
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
        className="absolute inset-0 h-full w-full"
        style={{ opacity: ready ? 1 : 0 }}
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
  const cW = canvas.width   // 1600
  const cH = canvas.height  // 900
  const iW = img.naturalWidth
  const iH = img.naturalHeight

  // Draw image with "cover + left-aligned" so the person stays visible
  const scale = Math.max(cW / iW, cH / iH)
  const dW = iW * scale
  const dH = iH * scale
  const dX = 0                 // left-align (person is on left side of photo)
  const dY = (cH - dH) / 2    // vertically center

  ctx.drawImage(img, dX, dY, dW, dH)
  if (open <= 0.015) return

  // Mouth position recalculated in canvas-draw space
  const mCX     = MOUTH.cx * iW * scale + dX
  const mCY     = MOUTH.cy * iH * scale + dY
  const rx      = MOUTH.w * scale * 0.46
  const ry      = Math.max(0.5, open * MOUTH.maxOpen * scale)
  const ang     = MOUTH.angle * (Math.PI / 180)

  ctx.save()
  ctx.translate(mCX, mCY)
  ctx.rotate(ang)

  const reach = Math.max(rx, ry)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, reach)
  g.addColorStop(0.0, 'rgba(30,6,6,0.97)')
  g.addColorStop(0.55, 'rgba(55,18,18,0.82)')
  g.addColorStop(1.0, 'rgba(65,25,25,0.0)')
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(0, ry * 0.88, rx * 0.9, Math.max(1, ry * 0.48), 0, 0, Math.PI * 2)
  const lip = ctx.createLinearGradient(0, ry * 0.38, 0, ry * 1.38)
  lip.addColorStop(0, 'rgba(145,82,72,0.0)')
  lip.addColorStop(1, 'rgba(145,82,72,0.32)')
  ctx.fillStyle = lip
  ctx.fill()

  ctx.restore()
}
