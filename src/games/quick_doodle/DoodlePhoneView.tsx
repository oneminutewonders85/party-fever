import { useEffect, useRef, useState } from 'react'
import type { PhoneViewProps } from '../../shared/lib/gameModule'
import { currentRound } from '../../shared/lib/room'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useServerCountdown } from '../../shared/lib/useServerCountdown'
import { PAL, type RoundPublic } from '../../shared/lib/types'
import TimerRing from '../../shared/components/TimerRing'
import { DrawPad } from './DrawPad'
import { getMyWord, submitGuess } from './api'
import { sound } from '../../shared/lib/sound'

const REVEAL_SECS = 5
const DRAW_SECS = 120

export default function DoodlePhoneView({ room, me }: PhoneViewProps) {
  const [round, setRound] = useState<RoundPublic | null>(null)
  const [word, setWord] = useState<string | null>(null)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'won' | 'late' | 'sent'>('idle')
  const [solvedByMe, setSolvedByMe] = useState(false)
  const chan = useRef<RoomChannel | null>(null)

  const amDrawer = round?.drawer_id === me.id
  const reload = async () => setRound(await currentRound(room.id))

  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, { onSync: () => reload().catch(console.error) })
    reload().catch(console.error)
    // safety net against a missed broadcast on flaky wifi
    const poll = window.setInterval(() => reload().catch(console.error), 3000)
    return () => {
      window.clearInterval(poll)
      chan.current?.cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  // new round housekeeping
  useEffect(() => {
    setGuess('')
    setFeedback('idle')
    setSolvedByMe(false)
    setWord(null)
    if (round && round.drawer_id === me.id && round.status !== 'ended') {
      getMyWord(round.id).then(setWord).catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.id])

  const revealLeft = useServerCountdown(round?.status === 'revealing' ? round.started_at : null, REVEAL_SECS)
  const drawLeft = useServerCountdown(round?.status === 'drawing' ? round.draw_started_at : null, DRAW_SECS)

  async function send() {
    if (!round || !guess.trim() || solvedByMe) return
    const text = guess.trim()
    setGuess('')
    try {
      sound.init()
      const r = await submitGuess(round.id, text)
      if (r.is_correct && r.solved) {
        setFeedback('won')
        setSolvedByMe(true)
        sound.correct()
      } else if (r.is_correct) {
        setFeedback('late')
      } else {
        setFeedback('wrong')
      }
    } catch (e) {
      console.error(e)
    }
  }

  // ---- finished ----
  if (room.status === 'finished') {
    return (
      <Center>
        <h1 className="pf-wordmark text-4xl">You finished!</h1>
        <p className="mt-2 text-white/70">Your score: <span className="text-cyan">{me.score}</span></p>
        <p className="mt-1 text-sm text-white/45">Check the TV for the final leaderboard.</p>
      </Center>
    )
  }

  // ---- drawer ----
  if (amDrawer) {
    if (round?.status === 'ended') {
      return <Center><h1 className="pf-wordmark text-3xl">Round over!</h1><p className="mt-2 text-white/60">Next round starting…</p></Center>
    }
    return (
      <div className="flex min-h-full flex-col px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">Your secret word</p>
            <p className="pf-wordmark text-3xl text-white">{word ?? '…'}</p>
          </div>
          {round?.status === 'drawing' && <TimerRing seconds={drawLeft} />}
        </div>
        {round?.status === 'revealing' ? (
          <Center>
            <p className="pf-wordmark text-2xl text-p-lime">Shield your screen 🙈</p>
            <p className="mt-1 text-white/60">Don’t let the guessers peek!</p>
            <p className="pf-wordmark mt-6 text-6xl text-white animate-floaty">{Math.max(1, revealLeft)}</p>
          </Center>
        ) : (
          <DrawPad color={PAL[me.color]} channel={chan.current!} enabled={round?.status === 'drawing'} />
        )}
      </div>
    )
  }

  // ---- guesser ----
  if (round?.status === 'ended') {
    return <Center><h1 className="pf-wordmark text-3xl">Round over!</h1><p className="mt-2 text-white/60">Next round starting…</p></Center>
  }
  return (
    <div className="flex min-h-full flex-col px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="pf-wordmark text-2xl">Guess!</p>
        {round?.status === 'drawing' && <TimerRing seconds={drawLeft} />}
      </div>
      <p className="text-white/60">Watch the drawing on the TV and type what you think it is.</p>

      {solvedByMe ? (
        <Center><p className="pf-wordmark text-4xl text-p-lime animate-popIn">You guessed it! 🎉</p></Center>
      ) : (
        <>
          <div className="mt-auto">
            {feedback === 'wrong' && <p className="mb-2 text-p-rose">Keep trying…</p>}
            {feedback === 'late' && <p className="mb-2 text-amber-300">So close — someone just beat you!</p>}
            <div className="flex gap-2">
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value.slice(0, 40))}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={round?.status === 'drawing' ? 'Your guess…' : 'Waiting for the drawer…'}
                disabled={round?.status !== 'drawing'}
                className="pf-glass flex-1 rounded-card px-4 py-4 text-lg text-white placeholder-white/35 outline-none disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={round?.status !== 'drawing' || !guess.trim()}
                className="rounded-card px-5 py-4 font-bold text-grape-900 disabled:opacity-40"
                style={{ background: 'linear-gradient(95deg,#06b6d4,#84cc16)' }}
              >
                Go
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 text-center">{children}</div>
}
