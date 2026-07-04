import { useState } from 'react'
import AdSlot from './AdSlot'
import QrScan from './QrScan'

// Shown to a phone after a game ends (or on Leave). There is intentionally NO
// route back to the home grid — games can only be started from the TV, and a
// phone rejoins by scanning the TV's QR.
export default function PhoneOutro({ title = 'Thanks for playing!' }: { title?: string }) {
  const [scanning, setScanning] = useState(false)
  return (
    <div className="flex min-h-full flex-1 flex-col items-center px-6 py-8 text-center">
      <h1 className="pf-wordmark text-3xl text-white">{title}</h1>
      <p className="mt-2 text-white/60">To play again, scan the QR on the TV.</p>

      <div className="my-6 w-full max-w-xs">
        <AdSlot size="rectangle" />
      </div>

      {scanning ? (
        <QrScan onClose={() => setScanning(false)} />
      ) : (
        <button
          onClick={() => setScanning(true)}
          className="rounded-card px-6 py-4 text-lg font-bold text-grape-900"
          style={{ background: 'linear-gradient(95deg,#06b6d4,#84cc16)' }}
        >
          📷 Scan QR to join
        </button>
      )}
      <p className="mt-5 text-xs text-white/35">Games are started from the TV only.</p>
    </div>
  )
}
