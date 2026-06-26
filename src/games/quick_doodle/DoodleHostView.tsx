import { useEffect, useMemo, useRef, useState } from 'react'
import type { HostViewProps } from '../../shared/lib/gameModule'
import { currentRound, refreshRoom } from '../../shared/lib/room'
import { openRoomChannel, type RoomChannel } from '../../shared/lib/realtime'
import { useServerCountdown } from '../../shared/lib/useServerCountdown'
import { PAL, type GuessRow, type RoundPublic, type RoundResult, type RoomSettingsM2 } from '../../shared/lib/types'
import Scoreboard from '../../shared/components/Scoreboard'
import TimerRing from '../../shared/components/TimerRing'
import AdSlot from '../../shared/components/AdSlot'
import ExitButton from '../../shared/components/ExitButton'
import { StrokeCanvas } from './DrawPad'
import { mergeStroke, type Stroke } from './canvas'
import { beginDrawing, endTimeout, getRoundResult, listGuesses, nextRound, subscribeGuesses } from './api'

const REVEAL_SECS = 5
const DRAW_SECS = 120
const RESULT_SECS = 6

export default function DoodleHostView({ room, players }: HostViewProps) {
  const settings = room.settings as RoomSettingsM2
  const totalRounds = settings.total_rounds ?? players.length * (settings.rounds_per_player ?? 3)

  const [round, setRound] = useState<RoundPublic | null>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [guesses, setGuesses] = useState<GuessRow[]>([])
  const [result, setResult] = useState<RoundResult | null>(null)
  const [finished, setFinished] = useState(room.status === 'finished')
  const chan = useRef<RoomChannel | null>(null)
  const acted = useRef<Record<string, boolean>>({})

  const drawer = useMemo(
    () => players.find((p) => p.id === round?.drawer_id) ?? null,
    [players, round?.drawer_id],
  )

  const reload = async () => setRound(await currentRound(room.id))

  // open the room channel (receive strokes; we are the sync sender)
  useEffect(() => {
    chan.current = openRoomChannel(room.join_code, {
      onStroke: (s) => setStrokes((prev) => mergeStroke(prev, s)),
      onClear: () => setStrokes([]),
    })
    reload().catch(console.error)
    return () => chan.current?.cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.join_code])

  // guesses feed + solve detection
  useEffect(() => {
    if (!round) return
    setGuesses([])
    listGuesses(round.id).then(setGuesses).catch(console.error)
    const unsub = subscribeGuesses(round.id, setGuesses)
    return unsub
  }, [round?.id])

  useEffect(() => {
    if (round?.status === 'drawing' && guesses.some((g) => g.is_correct)) {
      const k = `${round.id}:solved`
      if (!acted.current[k]) {
        acted.current[k] = true
        reload().catch(console.error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses, round?.status])

  // reveal countdown -> begin drawing
  const revealLeft = useServerCountdown(round?.status === 'revealing' ? round.started_at : null, REVEAL_SECS)
  useEffect(() => {
    if (round?.status === 'revealing' && revealLeft <= 0) {
      const k = `${round.id}:begin`
      if (!acted.current[k]) {
        acted.current[k] = true
        setStrokes([])
        beginDrawing(round.id)
          .then(reload)
          .then(() => chan.current?.sendSync())
          .catch(console.error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealLeft, round?.status])

  // draw clock -> timeout
  const drawLeft = useServerCountdown(round?.status === 'drawing' ? round.draw_started_at : null, DRAW_SECS)
  useEffect(() => {
    if (round?.status === 'drawing' && round.draw_started_at && drawLeft <= 0) {
      const k = `${round.id}:timeout`
      if (!acted.current[k]) {
        acted.current[k] = true
        endTimeout(round.id)
          .then(reload)
          .then(() => chan.current?.sendSync())
          .catch(console.error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawLeft, round?.status, round?.draw_started_at])

  // ended -> show result, then advance
  useEffect(() => {
    if (round?.status !== 'ended') return
    getRoundResult(round.id).then(setResult).catch(console.error)
    const t = window.setTimeout(async () => {
      const next = await nextRound(room.id)
      if (next) {
        setResult(null)
        chan.current?.sendClear()
        chan.current?.sendSync()
        setRound(next)
      } else {
        setFinished(true)
        await refreshRoom(room.id)
        chan.current?.sendSync()
      }
    }, RESULT_SECS * 1000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round?.id, round?.status])

  // ---- render ----
  if (finished) {
    const ranked = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center py-10">
        <div className="mb-4 self-start"><ExitButton label="Back to games" /></div>
        <h1 className="pf-wordmark text-5xl text-white">Game over!</h1>
        {ranked[0] && (
          <p className="mt-3 text-2xl text-p-lime">🏆 {ranked[0].name} wins with {ranked[0].score}</p>
        )}
        <div className="mt-8 w-full">
          <Scoreboard players={players} />
        </div>
        <AdSlot size="billboard" className="mt-10" />
      </div>
    )
  }

  const header = (
    <div className="mb-5 flex items-center justify-between gap-4">
      <ExitButton label="Exit" confirm="End this game and return to the menu?" />
      <span className="pf-wordmark text-xl text-white/70">
        Round {round?.round_no ?? '—'} <span className="text-white/35">of {totalRounds}</span>
      </span>
      {round?.status === 'drawing' && <TimerRing seconds={drawLeft} />}
      {drawer && (
        <span className="flex items-center gap-2 text-white/70">
          <span className="h-3 w-3 rounded-full" style={{ background: PAL[drawer.color] }} />
          {drawer.name} is drawing
        </span>
      )}
    </div>
  )

  if (!round || round.status === 'revealing') {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-white/60">Next up</p>
        <p className="pf-wordmark mt-2 text-4xl">{drawer?.name ?? '…'} is drawing</p>
        <p className="pf-wordmark mt-8 text-7xl text-p-lime animate-floaty">{Math.max(1, revealLeft)}</p>
        <p className="mt-4 text-white/50">Everyone else — get ready to guess.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {header}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.6fr,1fr]">
        <div>
          {round.status === 'ended' && result ? (
            <div className="pf-glass flex aspect-[4/3] flex-col items-center justify-center rounded-card text-center">
              <p className="text-white/60">The word was</p>
              <p className="pf-wordmark mt-1 text-5xl text-white">{result.word}</p>
              <p className="mt-5 text-2xl text-p-lime">
                {result.outcome === 'guessed'
                  ? `🎉 ${result.winner_name} got it!`
                  : 'Nobody guessed it'}
              </p>
            </div>
          ) : (
            <StrokeCanvas strokes={strokes} />
          )}
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Guesses</p>
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {guesses.length === 0 && <p className="text-white/40">No guesses yet…</p>}
              {[...guesses].reverse().map((g) => {
                const who = players.find((p) => p.id === g.player_id)
                return (
                  <div key={g.id} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="pf-wordmark text-xl" style={{ color: who ? PAL[who.color] : '#fff' }}>
                      {who?.name ?? 'Someone'}
                    </span>
                    <span
                      className={
                        g.is_correct
                          ? 'text-xl font-bold text-p-lime'
                          : 'text-xl text-white/80 line-through decoration-white/40'
                      }
                    >
                      {g.text}
                    </span>
                    {g.is_correct && <span className="text-xl">✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Scores</p>
            <Scoreboard players={players} drawerId={round.drawer_id} />
          </div>
        </div>
      </div>
      <AdSlot size="billboard" className="mt-8" />
    </div>
  )
}
