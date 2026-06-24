import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export default function WebcamPip({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          setReady(true)
        }
      })
      .catch(() => {})
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  if (!ready) return null

  return (
    <div className={cn('overflow-hidden rounded-xl border border-white/20 shadow-lg', className)}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
    </div>
  )
}
