import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrophyIcon } from '../../shared/components/icons'
import type { HostViewProps } from '../../shared/lib/gameModule'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import TimerRing from '../../shared/components/TimerRing'
import Scoreboard from '../../shared/components/Scoreboard'
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
    const active = players.filter((p) => p.is_connected).length
    const everyoneAnswered = qz.phase === 'question' && active > 0 && (qz.answered ?? 0) >= active
    if ((remaining <= 0 || everyoneAnswered) && !acted.current[phaseKey]) {
      acted.current[phaseKey] = true
      qzAdvance(room.id, qz.phase).then(() => { chan.current?.sendSync(); syncCb.current() }).catch((e) => {
        console.error(e); acted.current[phaseKey] = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, qz?.phase, qz?.q, qz?.answered, players])

  useEffect(() => {
    if (qz?.phase === 'reveal') sound.correct()
    if (qz?.phase === 'question') sound.roundStart()
  }, [qz?.phase, qz?.q])

  async function exit() {
    if (!window.confirm('End this game and return to the menu?')) return
    try { await qzAbort(room.id) } catch (e) { console.error(e) }
    navigate('/')
  }

  if (!qz) return <div className="grid min-h-[70vh] place-items-center text-2xl text-white/60">Shuffling questions…</div>

  if (qz.phase === 'finished') {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="flex min-h-[86vh] flex-col items-center justify-center text-center">
        <div className="absolute left-10 top-8">
          <button onClick={() => navigate('/')} className="pf-glass rounded-full px-4 py-2 text-sm text-white/70 hover:text-white">← Back to games</button>
        </div>
        <h1 className="pf-wordmark text-7xl text-white">Final scores!</h1>
        {ranked[0] && <p className="mt-4 inline-flex items-center gap-3 text-4xl text-p-lime"><TrophyIcon size={40} /> {ranked[0].name} wins with {ranked[0].score}</p>}
        <div className="mt-10 w-full max-w-2xl"><Scoreboard players={players} size="lg" /></div>
      </div>
    )
  }

  const reveal = qz.phase === 'reveal'

  return (
    <div className="flex min-h-[86vh] flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <button onClick={exit} className="pf-glass rounded-full px-4 py-2 text-sm text-white/70 hover:text-white">← Exit</button>
        <span className="pf-wordmark text-2xl text-white/60">Question {qz.q} of {qz.total}</span>
        <SoundToggle />
      </div>

      {/* centered question + options */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex w-full max-w-5xl flex-col items-center">
          {!reveal && <div className="mb-6"><TimerRing seconds={remaining} /></div>}
          <p className="pf-wordmark text-center text-5xl leading-tight text-white">{qz.question}</p>

          <div className="mt-10 grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
            {qz.options.map((opt, i) => {
              const o = OPTS[i]
              const isAnswer = reveal && qz.answer === i
              const dim = reveal && qz.answer !== i
              return (
                <div
                  key={i}
                  className="flex items-center gap-5 rounded-card px-7 py-6 text-left transition"
                  style={{
                    background: o.color,
                    opacity: dim ? 0.3 : 1,
                    outline: isAnswer ? '5px solid #fff' : 'none',
                    boxShadow: isAnswer ? '0 0 40px rgba(255,255,255,0.7)' : 'none',
                    transform: isAnswer ? 'scale(1.03)' : 'none',
                  }}
                >
                  <span className="text-4xl text-white/90">{o.shape}</span>
                  <span className="pf-wordmark text-3xl text-white">{opt}</span>
                  {isAnswer && <span className="ml-auto text-4xl">✓</span>}
                </div>
              )
            })}
          </div>

          {reveal && (
            <div className="mt-9 w-full rounded-card border border-p-lime/40 bg-p-lime/10 px-8 py-7 text-center shadow-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-p-lime">Did you know?</p>
              <p className="mt-2 text-2xl leading-relaxed text-white">{qz.fact}</p>
              {typeof qz.n_correct === 'number' && (
                <p className="mt-3 text-lg text-white/50">{qz.n_correct} of {players.length} got it right</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
