import { useEffect, useRef, useState } from 'react'
import type { PhoneViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import TimerRing from '../../shared/components/TimerRing'
import { MagnifierIcon } from '../../shared/components/icons'
import { useArmGate } from '../../shared/lib/useArmGate'
import { SCENE_LABEL, seSubmit, useSe } from './api'

export default function ScrutineyePhone({ room, me }: PhoneViewProps) {
  const syncCb = useRef<() => void>(() => {})
  const chan = useRef<RoomChannel | null>(null)
  const { se } = useSe(room, (cb) => (syncCb.current = cb))
  const [text, setText] = useState('')
  const [found, setFound] = useState<string[]>([])
  const [pts, setPts] = useState(0)
  const [flash, setFlash] = useState<{ kind: 'ok' | 'bad'; msg: string } | null>(null)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => syncCb.current() })
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  // reset found list each new round
  useEffect(() => { setFound([]); setPts(0); setText(''); setFlash(null) }, [se?.round])

  const phaseKey = se ? `${se.phase}:${se.round}` : 'none'
  const sceneUrl = se?.scene ? `/scenes/${se.scene}.jpg` : ''
  const arm = useArmGate(se?.phase_started, sceneUrl ? [sceneUrl] : [], se?.phase === 'play')

  const remaining = useLocalCountdown(phaseKey, se?.phase_len ?? 0)

  async function submit() {
    const w = text.trim()
    if (!w || !se || se.phase !== 'play' || !arm.armed) return
    setText('')
    try {
      const r = await seSubmit(room.id, w)
      chan.current?.sendSync() // tell the TV now, not on its next poll
      if (r.ok && r.word) {
        setFound((f) => (f.includes(r.word!) ? f : [...f, r.word!]))
        setPts((x) => x + (r.score ?? 0))
        setFlash({ kind: 'ok', msg: `+${r.score} · ${r.word}` })
        sound.init(); sound.correct()
      } else {
        setFlash({ kind: 'bad', msg: r.reason === 'already' ? 'Already found!' : 'Not in the scene (or wrong letter)' })
      }
      window.setTimeout(() => setFlash(null), 1400)
    } catch (e) { console.error(e) }
  }

  if (!se) return <Center><p className="text-white/60">Loading…</p></Center>

  if (se.phase === 'reveal') {
    return <Center><h1 className="pf-wordmark text-3xl">Round {se.round} over!</h1>
      <p className="mt-2 text-white/70">You found {found.length} — that's {pts} points.</p>
      <p className="mt-1 text-sm text-white/45">Look up at the TV.</p></Center>
  }
  if (se.phase === 'finished') {
    return <Center><h1 className="pf-wordmark text-3xl">Eyes down!</h1>
      <p className="mt-2 text-white/70">Your score: <span className="text-cyan">{me.score}</span></p>
      <p className="mt-1 text-sm text-white/45">Final standings on the TV.</p></Center>
  }

  if (arm.holding) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-white/40">Round {se.round}</p>
        <p className="pf-wordmark text-3xl text-white/85">{arm.loading ? 'Loading the scene…' : 'Get ready'}</p>
        <p className="text-white/50">Wait for the start signal on the TV</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 flex-col px-5 py-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="pf-wordmark inline-flex items-center gap-2 text-xl"><MagnifierIcon size={20} /> Scrutineye</p>
        <TimerRing seconds={remaining} />
      </div>

      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {se.letters.map((L) => (
          <span key={L} className="pf-wordmark grid h-11 w-11 place-items-center rounded-card bg-cyan text-xl text-grape-900">{L}</span>
        ))}
      </div>

      <button onClick={() => setZoom(true)} className="mb-3 overflow-hidden rounded-card border border-white/10">
        <img src={`/scenes/${se.scene}.jpg`} alt="scene" className="w-full" />
        <span className="block bg-black/30 py-1 text-xs text-white/70">{SCENE_LABEL[se.scene] ?? se.scene} · tap to zoom</span>
      </button>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 24))}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Name something you see…"
          className="pf-glass flex-1 rounded-card px-4 py-4 text-lg text-white placeholder-white/35 outline-none"
        />
        <button onClick={submit} disabled={!text.trim()}
          className="rounded-card px-5 py-4 font-bold text-grape-900 disabled:opacity-40"
          style={{ background: 'linear-gradient(95deg,#06b6d4,#84cc16)' }}>Spot</button>
      </div>
      {flash && (
        <p className={`mt-2 text-sm ${flash.kind === 'ok' ? 'text-p-lime' : 'text-p-rose'}`}>{flash.msg}</p>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Found {found.length} · {pts} pts</p>
        <div className="flex flex-wrap gap-2">
          {found.map((w) => (
            <span key={w} className="rounded-full bg-p-lime/20 px-3 py-1 text-sm text-p-lime">{w}</span>
          ))}
        </div>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90" onClick={() => setZoom(false)}>
          <div className="flex-1 overflow-auto">
            <img src={`/scenes/${se.scene}.jpg`} alt="scene" className="min-w-[200%] max-w-none" />
          </div>
          <button className="bg-white/10 py-3 text-white" onClick={() => setZoom(false)}>Close</button>
        </div>
      )}
    </div>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 text-center">{children}</div>
}
