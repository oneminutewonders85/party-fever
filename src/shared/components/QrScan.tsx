import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'

// Camera QR scanner, v2. Fixes vs v1:
//  - requests a high-resolution rear camera stream (v1 got the 640×480
//    default, which is why codes only read when zoomed right in)
//  - asks the camera for continuous autofocus + a slight optical zoom when
//    the hardware supports it
//  - decodes with jsQR on a centre-cropped frame, so it works on iOS Safari
//    and every Android browser (v1 needed BarcodeDetector, Chrome-only)
//  - BarcodeDetector is still used first when available (it's faster)
type Detector = { detect: (v: CanvasImageSource) => Promise<{ rawValue: string }[]> }

export default function QrScan({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [err, setErr] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let stream: MediaStream | null = null
    let stopped = false
    let timer = 0
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const DetCtor = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector
    const detector: Detector | null = DetCtor ? new DetCtor({ formats: ['qr_code'] }) : null

    const cleanup = () => {
      stopped = true
      if (timer) window.clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
    }

    const onCode = (raw: string): boolean => {
      const m = raw.match(/\/join\/([A-Za-z0-9]+)/)
      if (!m) return false
      cleanup()
      navigate(`/join/${m[1].toUpperCase()}`)
      return true
    }

    const scan = async () => {
      if (stopped) return
      const v = videoRef.current
      if (v && v.readyState === 4 && v.videoWidth > 0) {
        // centre-crop: the code is aimed at the middle of the frame, and a
        // smaller decode area is both faster and more reliable
        const side = Math.floor(Math.min(v.videoWidth, v.videoHeight) * 0.8)
        const sx = (v.videoWidth - side) / 2
        const sy = (v.videoHeight - side) / 2
        const out = Math.min(side, 640)
        canvas.width = out
        canvas.height = out
        if (ctx) {
          ctx.drawImage(v, sx, sy, side, side, 0, 0, out, out)
          // fast path: native detector on the cropped frame
          if (detector) {
            try {
              const codes = await detector.detect(canvas)
              for (const c of codes) if (onCode(String(c.rawValue))) return
            } catch { /* fall through to jsQR */ }
          }
          const img = ctx.getImageData(0, 0, out, out)
          const hit = jsQR(img.data, out, out, { inversionAttempts: 'dontInvert' })
          if (hit?.data && onCode(hit.data)) return
        }
      }
      timer = window.setTimeout(scan, 140) // ~7 fps: plenty for a static QR, easy on the battery
    }

    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    })
      .then(async (s) => {
        stream = s
        // best-effort camera tuning; ignored on hardware that lacks it
        const track = s.getVideoTracks()[0]
        try {
          const caps = track.getCapabilities?.() as (MediaTrackCapabilities & { focusMode?: string[]; zoom?: { min: number; max: number } }) | undefined
          const adv: MediaTrackConstraintSet[] = []
          if (caps?.focusMode?.includes('continuous')) adv.push({ focusMode: 'continuous' } as MediaTrackConstraintSet)
          if (caps?.zoom && caps.zoom.max >= 2) adv.push({ zoom: Math.min(2, caps.zoom.max) } as MediaTrackConstraintSet)
          if (adv.length) await track.applyConstraints({ advanced: adv })
        } catch { /* optional tuning only */ }
        const v = videoRef.current
        if (v) { v.srcObject = s; void v.play() }
        scan()
      })
      .catch(() => setErr('nocam'))
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (err) {
    return (
      <div className="pf-glass rounded-card p-6 text-center">
        <p className="text-lg text-white/85">Camera not available.</p>
        <p className="mt-2 text-white/60">Open your phone's camera app and point it at the QR on the TV — the link opens the game.</p>
        <button onClick={onClose} className="pf-glass mt-5 rounded-card px-6 py-3 font-semibold">OK</button>
      </div>
    )
  }
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="relative w-full max-w-sm overflow-hidden rounded-card">
        <video ref={videoRef} playsInline muted className="aspect-square w-full object-cover" />
        {/* aiming frame */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-3/5 w-3/5 rounded-2xl border-4 border-p-lime/80" style={{ boxShadow: '0 0 0 2000px rgba(10,6,26,.35)' }} />
        </div>
      </div>
      <p className="text-base text-white/70">Hold the QR inside the green frame</p>
      <button onClick={onClose} className="pf-glass rounded-card px-6 py-3 font-semibold text-white/80">Cancel</button>
    </div>
  )
}
