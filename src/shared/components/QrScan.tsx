import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Opens the rear camera and scans for a Party Fever join QR. On success it
// routes the phone straight into that room's /join screen. Falls back to a
// prompt on browsers without BarcodeDetector (e.g. iOS Safari) — there the
// guest just uses their normal camera app, which opens the link.
export default function QrScan({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [err, setErr] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const Det = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector
    if (!Det) { setErr('unsupported'); return }
    let stream: MediaStream | null = null
    let raf = 0
    let stopped = false
    const detector = new Det({ formats: ['qr_code'] })
    const cleanup = () => { stopped = true; if (raf) cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()) }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s
        const v = videoRef.current
        if (v) { v.srcObject = s; void v.play() }
        const scan = async () => {
          if (stopped) return
          const v2 = videoRef.current
          if (v2 && v2.readyState === 4) {
            try {
              const codes = await detector.detect(v2)
              for (const c of codes) {
                const m = String(c.rawValue).match(/\/join\/([A-Za-z0-9]+)/)
                if (m) { cleanup(); navigate(`/join/${m[1].toUpperCase()}`); return }
              }
            } catch { /* keep scanning */ }
          }
          raf = requestAnimationFrame(scan)
        }
        scan()
      })
      .catch(() => setErr('nocam'))
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (err) {
    return (
      <div className="pf-glass rounded-card p-5 text-center">
        <p className="text-white/80">Open your phone’s camera app and point it at the QR on the TV.</p>
        <button onClick={onClose} className="pf-glass mt-4 rounded-card px-5 py-2">OK</button>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <video ref={videoRef} playsInline muted className="aspect-square w-full max-w-xs rounded-card object-cover" />
      <p className="text-sm text-white/60">Point at the QR on the TV…</p>
      <button onClick={onClose} className="pf-glass rounded-card px-5 py-2 text-sm">Cancel</button>
    </div>
  )
}
