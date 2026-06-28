import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { HostViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import TimerRing from '../../shared/components/TimerRing'
import Scoreboard from '../../shared/components/Scoreboard'
import AdSlot from '../../shared/components/AdSlot'
import SoundToggle from '../../shared/components/SoundToggle'
import { OPTS, qzAbort, qzAdvance, useQz, type QzPhase } from './api'

const AUTO: QzPhase[] = ['question', 'reveal']

export default function QuizzardsHost({ room, players }: HostViewProps) {
  const navigate = useNavigate()
  const chan = useRef<RoomChannel | null>(null)
  const syncCb = useRef<() => void>(() => {})
  const { qz } = useQz(room, (cb) => (syncCb.current = cb))
  const acted = useRef<Record<string, boolean>>({})

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => syncCb.current() })
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  const phaseKey = qz ? `${qz.phase}:${qz.q}` : 'none'
  const remaining = useLocalCountdown(phaseKey, qz?.phase_len ?? 0)

  useEffect(() => {
    if (!qz || !AUTO.includes(qz.phase)) return
    if (remaining <= 0 && !acted.current[phaseKey]) {
      acted.current[phaseKey] = true
      qzAdvance(room.id, qz.phase).then(() => { chan.current?.sendSync(); syncCb.current() }).catch((e) => {
        console.error(e); acted.current[phaseKey] = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, qz?.phase, qz?.q])

  useEffect(() => {
    if (qz?.phase === 'reveal') sound.correct()
    if (qz?.phase === 'question') sound.roundStart()
  }, [qz?.phase, qz?.q])

  async function exit() {
    if (!window.confirm('End this game and return to the menu?')) return
    try { await qzAbort(room.id) } catch (e) { console.error(e) }
    navigate('/')
  }

  if (!qz) return <div className="grid min-h-[60vh] place-items-center text-white/60">Shuffling questions…</div>

  if (qz.phase === 'finished') {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 flex justify-center">
          <button onClick={() => navigate('/')} className="pf-glass rounded-full px-4 py-2 text-sm text-white/70 hover:text-white">← Back to games</button>
        </div>
        <h1 className="pf-wordmark text-5xl text-white">Final scores!</h1>
        {ranked[0] && <p className="mt-3 text-2xl text-p-lime">🏆 {ranked[0].name} wins with {ranked[0].score}</p>}
        <div className="mt-8"><Scoreboard players={players} /></div>
        <AdSlot size="billboard" className="mt-10" />
      </div>
    )
  }

  const reveal = qz.phase === 'reveal'

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={exit} className="pf-glass rounded-full px-4 py-2 text-sm text-white/70 hover:text-white">← Exit</button>
        <span className="pf-wordmark text-lg text-white/60">Question {qz.q} of {qz.total}</span>
        <SoundToggle />
      </div>

      <div className="pf-glass rounded-card px-6 py-8 text-center">
        <p className="pf-wordmark text-3xl leading-tight text-white md:text-4xl">{qz.question}</p>
        <div className="mt-5 flex justify-center"><TimerRing seconds={remaining} /></div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {qz.options.map((opt, i) => {
          const o = OPTS[i]
          const isAnswer = reveal && qz.answer === i
          const dim = reveal && qz.answer !== i
          return (
            <div
              key={i}
              className="flex items-center gap-4 rounded-card px-5 py-5 text-left transition"
              style={{
                background: o.color,
                opacity: dim ? 0.35 : 1,
                outline: isAnswer ? '4px solid #ffffff' : 'none',
                boxShadow: isAnswer ? '0 0 30px rgba(255,255,255,0.6)' : 'none',
              }}
            >
              <span className="text-3xl text-white/90">{o.shape}</span>
              <span className="pf-wordmark text-2xl text-white">{opt}</span>
              {isAnswer && <span className="ml-auto text-2xl">✓</span>}
            </div>
          )
        })}
      </div>

      {reveal && (
        <div className="mt-6 rounded-card border border-p-lime/40 bg-p-lime/10 px-6 py-5 text-center">
          <p className="text-sm uppercase tracking-widest text-p-lime">Did you know?</p>
          <p className="mt-1 text-xl text-white">{qz.fact}</p>
          {typeof qz.n_correct === 'number' && (
            <p className="mt-2 text-sm text-white/50">{qz.n_correct} of {players.length} got it right</p>
          )}
        </div>
      )}

      <AdSlot size="billboard" className="mt-8" />
    </div>
  )
}
