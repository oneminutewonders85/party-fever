import { useEffect, useRef, useState } from 'react'
import type { PhoneViewProps } from '../../shared/lib/gameModule'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { OPTS, qzAnswer, useQz } from './api'

export default function QuizzardsPhone({ room, me }: PhoneViewProps) {
  // No channel here either. The host only discovered that everyone had answered
  // on its next safety poll, which batch 8 stretched to 9s for 'calm' games.
  // That is the pause before the answer was revealed.
  const syncCb = useRef<() => void>(() => {})
  const chan = useRef<RoomChannel | null>(null)
  const { qz } = useQz(room, (cb) => (syncCb.current = cb))

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => syncCb.current() })
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])
  const [picked, setPicked] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  // reset my choice each new question
  useEffect(() => { setPicked(null) }, [qz?.q])

  const remaining = useLocalCountdown(qz ? `${qz.phase}:${qz.q}` : 'none', qz?.phase_len ?? 0)

  if (!qz) return <Center><p className="text-white/60">Getting ready…</p></Center>

  async function choose(i: number) {
    if (picked !== null || busy || !qz || qz.phase !== 'question') return
    setBusy(true)
    setPicked(i)
    try { await qzAnswer(room.id, i); chan.current?.sendSync(); sound.roundStart() } catch (e) { console.error(e); setPicked(null) }
    finally { setBusy(false) }
  }

  if (qz.phase === 'reveal') {
    const right = picked !== null && picked === qz.answer
    const missed = picked === null
    return (
      <Center>
        <div className="w-full text-center">
          {missed ? (
            <p className="pf-wordmark text-3xl text-white/70">Too slow!</p>
          ) : right ? (
            <p className="pf-wordmark text-4xl text-p-lime">Correct! +100</p>
          ) : (
            <p className="pf-wordmark text-3xl text-white/80">Not this time…</p>
          )}
          <p className="mt-2 text-white/50">{right ? 'Nice spotting.' : `Answer: ${qz.options[qz.answer ?? 0]}`}</p>
          <p className="mt-6 text-sm uppercase tracking-widest text-white/40">Your score</p>
          <p className="pf-wordmark text-5xl text-white">{me.score}</p>
        </div>
      </Center>
    )
  }

  // question phase — 2x2 colour/shape keypad
  return (
    <div className="flex min-h-full flex-1 flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-white/50">Q{qz.q} / {qz.total}</span>
        <span className="pf-wordmark text-lg text-white">{remaining}s</span>
      </div>
      {picked !== null ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="text-6xl" style={{ color: OPTS[picked].color }}>{OPTS[picked].shape}</span>
          <p className="mt-4 pf-wordmark text-2xl text-white">Locked in!</p>
          <p className="mt-1 text-white/50">{qz.options[picked]}</p>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-3">
          {qz.options.map((opt, i) => {
            const o = OPTS[i]
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={busy}
                className="flex flex-col items-center justify-center gap-2 rounded-card px-3 py-4 text-center transition active:scale-95"
                style={{ background: o.color }}
              >
                <span className="text-4xl text-white/90">{o.shape}</span>
                <span className="pf-wordmark text-lg leading-tight text-white">{opt}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 text-center">{children}</div>
}
