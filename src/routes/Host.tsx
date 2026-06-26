import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import Stage from '../components/Stage'
import Wordmark from '../components/Wordmark'
import PlayerChip from '../components/PlayerChip'
import { ensureAnonSession } from '../lib/supabase'
import { getRoomByCode, listPlayers, subscribePlayers } from '../lib/room'
import { gameById } from '../lib/games'
import type { Player, Room } from '../lib/types'

const LOBBY_COUNTDOWN = 15

export default function Host() {
  const { code = '' } = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [notFound, setNotFound] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const tick = useRef<number | null>(null)

  const joinUrl = useMemo(
    () => `${window.location.origin}/join/${code.toUpperCase()}`,
    [code],
  )
  const game = room ? gameById(room.current_game) : undefined
  const minPlayers = game?.minPlayers ?? 2

  // Load room + roster, then subscribe to live player changes.
  useEffect(() => {
    let unsub: (() => void) | undefined
    ;(async () => {
      await ensureAnonSession()
      const r = await getRoomByCode(code)
      if (!r) {
        setNotFound(true)
        return
      }
      setRoom(r)
      setPlayers(await listPlayers(r.id))
      unsub = subscribePlayers(r.id, setPlayers)
    })().catch(console.error)
    return () => unsub?.()
  }, [code])

  // The TV is the authority for the lobby countdown. Starts once enough players
  // have joined; cancels if someone drops below the minimum.
  // (M2: at zero, the host calls start_round() to begin the first round.)
  useEffect(() => {
    const enough = players.length >= Math.max(2, minPlayers === 3 ? 2 : minPlayers)
    if (enough && countdown === null) {
      setCountdown(LOBBY_COUNTDOWN)
    } else if (!enough && countdown !== null) {
      setCountdown(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length])

  useEffect(() => {
    if (countdown === null) {
      if (tick.current) window.clearInterval(tick.current)
      return
    }
    tick.current = window.setInterval(() => {
      setCountdown((c) => (c === null ? null : c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => {
      if (tick.current) window.clearInterval(tick.current)
    }
  }, [countdown !== null])

  if (notFound) {
    return (
      <Stage className="flex min-h-screen flex-col items-center justify-center text-center">
        <Wordmark size="md" />
        <p className="mt-6 text-2xl text-white/80">Room {code.toUpperCase()} isn’t open.</p>
        <a href="/" className="mt-4 text-cyan underline">
          Start a new game
        </a>
      </Stage>
    )
  }

  return (
    <Stage className="min-h-screen px-10 py-8">
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Wordmark size="sm" />
          <span className="pf-glass rounded-full px-4 py-2 text-sm text-white/70">
            {game?.name ?? 'Quick Doodle'}
          </span>
        </header>

        <div className="mt-10 grid flex-1 grid-cols-1 gap-10 md:grid-cols-[auto,1fr]">
          {/* QR + room code */}
          <div className="flex flex-col items-center">
            <p className="mb-3 text-lg uppercase tracking-widest text-white/60">Scan to join</p>
            <div className="rounded-card bg-white p-5 shadow-2xl">
              <QRCodeSVG value={joinUrl} size={240} bgColor="#ffffff" fgColor="#1a0b2e" />
            </div>
            <p className="mt-6 text-sm uppercase tracking-widest text-white/50">Room code</p>
            <p className="pf-wordmark text-6xl tracking-[.2em] text-white">{code.toUpperCase()}</p>
          </div>

          {/* Roster + status */}
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between">
              <h2 className="pf-wordmark text-2xl text-white/80">
                Joined <span className="text-cyan">{players.length}</span>
              </h2>
              {countdown !== null ? (
                <span className="pf-wordmark text-2xl text-p-lime animate-floaty">
                  {countdown > 0 ? `Starting in ${countdown}s` : 'Starting…'}
                </span>
              ) : (
                <span className="text-white/50">
                  Waiting for {Math.max(0, 2 - players.length)} more…
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap content-start gap-3">
              {players.length === 0 && (
                <p className="text-white/50">No one yet — scan the QR to jump in.</p>
              )}
              {players.map((p) => (
                <PlayerChip key={p.id} player={p} big />
              ))}
            </div>

            <p className="mt-auto pt-8 text-white/40">
              {gameById(room?.current_game ?? 'quick_doodle')?.name} begins automatically once the
              countdown ends.
            </p>
          </div>
        </div>
      </div>
    </Stage>
  )
}
