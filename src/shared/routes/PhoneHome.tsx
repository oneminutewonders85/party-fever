import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Stage from '../components/Stage'
import Wordmark from '../components/Wordmark'
import QrScan from '../components/QrScan'
import AdSlot from '../components/AdSlot'
import { loadProfile, saveProfile, type Profile } from '../lib/profile'
import { COLOR_KEYS, PAL, type ColorKey } from '../lib/types'

// The phone's home base. Set your name & colour once, then everything is:
// scan the TV's QR -> play -> land back here.
export default function PhoneHome() {
  // A room can end without this player doing anything: the host quits, or too
  // many people leave. JoinShell sends them here with the reason.
  const location = useLocation()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string | null>(
    (location.state as { notice?: string } | null)?.notice ?? null,
  )
  // clear it from history so a refresh does not resurrect a stale notice
  useEffect(() => {
    if (notice) navigate('.', { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())
  const [editing, setEditing] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [exited, setExited] = useState(false)

  if (exited) {
    return (
      <Stage className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
        <Wordmark size="md" />
        <p className="mt-6 text-xl text-white/80">Thanks for playing!</p>
        <p className="mt-2 text-white/50">You can close this tab now.</p>
        <button onClick={() => setExited(false)} className="mt-8 text-cyan underline">Back to Party Fever</button>
      </Stage>
    )
  }

  if (!profile || editing) {
    return (
      <ProfileSetup
        initial={profile}
        onDone={(p) => { saveProfile(p); setProfile(p); setEditing(false) }}
      />
    )
  }

  return (
    <Stage className="flex min-h-[100dvh] flex-col items-center px-6 pb-6 pt-10">
      <Wordmark size="md" />

      {notice && (
        <div className="pf-glass mt-5 w-full max-w-sm rounded-card border border-amber-300/30 px-4 py-3 text-center">
          <p className="text-sm text-amber-200/90">{notice}</p>
          <button onClick={() => setNotice(null)} className="mt-2 text-xs text-white/45 underline">Dismiss</button>
        </div>
      )}

      {/* player card — tap to edit */}
      <button
        onClick={() => setEditing(true)}
        className="pf-glass mt-8 flex w-full max-w-sm items-center gap-4 rounded-card px-5 py-4 text-left"
        aria-label="Edit your name and colour"
      >
        <span className="h-12 w-12 shrink-0 rounded-full" style={{ background: PAL[profile.color], boxShadow: `0 0 24px ${PAL[profile.color]}80` }} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-2xl font-bold">{profile.name}</span>
          <span className="block text-sm text-white/50 capitalize">{profile.color} · tap to change</span>
        </span>
      </button>

      {/* main action */}
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center py-6">
        {scanning ? (
          <QrScan onClose={() => setScanning(false)} />
        ) : (
          <button
            onClick={() => setScanning(true)}
            className="flex w-full flex-col items-center gap-3 rounded-tile px-8 py-10 text-grape-900 shadow-2xl transition active:scale-95"
            style={{ background: 'linear-gradient(135deg,#06b6d4,#84cc16)' }}
          >
            <ScanFrameIcon />
            <span className="text-2xl font-extrabold">Scan QR to play</span>
            <span className="text-sm font-medium text-grape-900/70">Point at the code on the TV</span>
          </button>
        )}
      </div>

      {/* banner ad space */}
      <div className="w-full max-w-sm">
        <AdSlot size="mobileBanner" />
      </div>

      <button
        onClick={() => { if (window.confirm('Quit Party Fever?')) { window.close(); setExited(true) } }}
        className="mt-4 rounded-full px-6 py-2 text-sm text-white/45 underline underline-offset-4"
      >Quit</button>
    </Stage>
  )
}

function ProfileSetup({ initial, onDone }: { initial: Profile | null; onDone: (p: Profile) => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState<ColorKey | null>(initial?.color ?? null)
  const ready = name.trim().length > 0 && !!color

  return (
    <Stage className="flex min-h-[100dvh] flex-col px-7 pb-8 pt-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="mb-8 flex flex-col items-center text-center">
          <Wordmark size="sm" />
          <h1 className="pf-wordmark mt-5 text-3xl">Who's playing?</h1>
          <p className="mt-2 text-base text-white/60">Set once — your phone remembers you.</p>
        </div>

        <label className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/55">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 16))}
          placeholder="e.g. Aisha"
          className="pf-glass mb-7 rounded-card px-4 py-4 text-lg text-white placeholder-white/35 outline-none"
        />

        <label className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/55">Your colour</label>
        <div className="grid grid-cols-4 gap-4">
          {COLOR_KEYS.map((key) => {
            const sel = color === key
            return (
              <button
                key={key}
                onClick={() => setColor(key)}
                aria-label={key}
                className="relative aspect-square rounded-full transition"
                style={{
                  background: PAL[key],
                  transform: sel ? 'scale(1.09)' : 'scale(1)',
                  boxShadow: sel ? `0 0 26px ${PAL[key]}` : '0 8px 18px rgba(0,0,0,.28)',
                }}
              >
                {sel && <CheckIcon />}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => ready && onDone({ name: name.trim(), color: color as ColorKey })}
          disabled={!ready}
          className="mt-auto rounded-card px-6 py-4 text-lg font-bold text-grape-900 transition disabled:opacity-40"
          style={{ background: 'linear-gradient(95deg,#06b6d4,#84cc16)' }}
        >Save & continue</button>
      </div>
    </Stage>
  )
}

function CheckIcon() {
  return (
    <span className="absolute inset-0 grid place-items-center">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  )
}

function ScanFrameIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7.5 12h9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
