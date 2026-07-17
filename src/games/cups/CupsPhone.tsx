import { useEffect, useRef, useState } from 'react'
import type { PhoneViewProps } from '../../shared/lib/gameModule'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import { cuBuzz, cupSrc, itemSrc, useCu } from './api'
import { useArmGate } from '../../shared/lib/useArmGate'

type Drag = { p: number; x: number; y: number } | null

export default function CupsPhone({ room, me }: PhoneViewProps) {
  const { cu } = useCu(room)
  const [order, setOrder] = useState<string[]>([])
  const [orient, setOrient] = useState<'h' | 'v'>('h')
  const [drag, setDrag] = useState<Drag>(null)
  const [flash, setFlash] = useState<{ ok: boolean; msg: string } | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const box = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (cu?.start) { setOrder(cu.start); setOrient('h'); setFlash(null); setCooldown(0); setDrag(null) }
  }, [cu?.round]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

  // this round's sprites, so the gate can wait for them before unlocking
  const roundImgs = cu?.theme && cu?.target
    ? [...new Set([...cu.target, ...(cu.start ?? [])])].map((c) => itemSrc(cu.theme, c))
    : []
  const arm = useArmGate(cu?.phase_started, roundImgs, cu?.phase === 'build')

  const remaining = useLocalCountdown(cu ? `${cu.phase}:${cu.round}` : 'none', cu?.phase_len ?? 0)

  if (!cu) return <Center><p className="text-white/60">Getting ready…</p></Center>

  if (cu.phase === 'reveal') {
    const iWon = cu.won && cu.winner_name === me.name
    return (
      <Center>
        <div className="text-center">
          <p className={`pf-wordmark text-4xl ${iWon ? 'text-p-lime' : 'text-white/80'}`}>
            {iWon ? 'You matched it! +100' : cu.won ? `${cu.winner_name} got it` : 'Round over'}
          </p>
          <p className="mt-6 text-sm uppercase tracking-widest text-white/40">Your score</p>
          <p className="pf-wordmark text-5xl text-white">{me.score}</p>
        </div>
      </Center>
    )
  }

  // home position (percent) for the cup at sequence index p
  const home = (p: number) =>
    orient === 'h' ? { x: ((p + 0.5) / 5) * 100, y: 50 } : { x: 50, y: ((p + 0.5) / 5) * 100 }

  function rectPct(clientX: number, clientY: number) {
    const r = box.current!.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100)),
    }
  }
  function down(p: number, e: React.PointerEvent) {
    if (cu!.phase !== 'build' || !arm.armed) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    const { x, y } = rectPct(e.clientX, e.clientY)
    setDrag({ p, x, y })
  }
  function move(e: React.PointerEvent) {
    if (!drag) return
    const { x, y } = rectPct(e.clientX, e.clientY)
    setDrag({ ...drag, x, y })
  }
  function up() {
    if (!drag) return
    const { p, x, y } = drag
    const perp = orient === 'h' ? Math.abs(y - 50) : Math.abs(x - 50)
    if (perp > 22) {
      setOrient((o) => (o === 'h' ? 'v' : 'h')) // dragged clearly off the line → flip
    } else {
      const primary = orient === 'h' ? x : y
      const idx = Math.max(0, Math.min(4, Math.round((primary / 100) * 5 - 0.5)))
      if (idx !== p) {
        setOrder((o) => {
          const n = [...o]
          const [c] = n.splice(p, 1)
          n.splice(idx, 0, c)
          return n
        })
      }
    }
    setDrag(null)
  }

  async function buzz() {
    if (cooldown > 0 || cu!.phase !== 'build' || !arm.armed) return
    try {
      const r = await cuBuzz(room.id, order, orient)
      if (r.correct) { setFlash({ ok: true, msg: 'Matched! +100' }); sound.correct() }
      else { setFlash({ ok: false, msg: 'Wrong — −50' }); setCooldown(2); sound.roundStart() }
    } catch (e) { console.error(e) }
  }

  if (arm.holding) {
    return (
      <Center>
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm uppercase tracking-widest text-white/40">Round {cu.round}/{cu.total}</p>
          <p className="pf-wordmark text-3xl text-white/85">
            {arm.loading ? 'Loading…' : 'Get ready'}
          </p>
          <p className="text-white/50">Wait for the start signal on the TV</p>
        </div>
      </Center>
    )
  }

  return (
    <div className="flex min-h-full flex-col px-4 py-4" style={{ touchAction: 'none' }}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-white/50">Round {cu.round}/{cu.total}</span>
        <span className="pf-wordmark text-lg text-white">{remaining}s</span>
      </div>
      <p className="mb-2 text-center text-sm text-white/60">
        Drag cups to match the TV — <b className="text-white/80">{orient === 'h' ? 'row ⬌' : 'stack ⬍'}</b>
      </p>

      <div className="flex flex-1 items-center justify-center">
        <div
          ref={box}
          className="relative rounded-3xl border border-white/10 bg-white/5"
          style={{ width: 'min(92vw, 56vh)', aspectRatio: '1 / 1' }}
        >
          {/* guide line for the current orientation */}
          <div
            className="absolute bg-white/10"
            style={
              orient === 'h'
                ? { left: '6%', right: '6%', top: '50%', height: 2, transform: 'translateY(-50%)' }
                : { top: '6%', bottom: '6%', left: '50%', width: 2, transform: 'translateX(-50%)' }
            }
          />
          {order.map((color, p) => {
            const dragging = drag?.p === p
            const pos = dragging ? { x: drag!.x, y: drag!.y } : home(p)
            return (
              <img
                key={p}
                src={cupSrc(color)}
                alt={color}
                draggable={false}
                onPointerDown={(e) => down(p, e)}
                onPointerMove={move}
                onPointerUp={up}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: '19%',
                  transform: `translate(-50%, -50%) scale(${dragging ? 1.12 : 1})`,
                  transition: dragging ? 'none' : 'left 180ms ease, top 180ms ease',
                  zIndex: dragging ? 30 : 10,
                  touchAction: 'none',
                  cursor: 'grab',
                  filter: dragging ? 'drop-shadow(0 8px 14px rgba(0,0,0,0.4))' : 'none',
                }}
              />
            )
          })}
        </div>
      </div>

      {flash && (
        <p className={`mt-2 text-center pf-wordmark text-xl ${flash.ok ? 'text-p-lime' : 'text-red-400'}`}>{flash.msg}</p>
      )}
      <button
        onClick={buzz}
        disabled={cooldown > 0}
        className="mt-3 w-full rounded-card py-5 pf-wordmark text-3xl text-grape-900 transition active:scale-95 disabled:opacity-40"
        style={{ background: cooldown > 0 ? '#9ca3af' : '#f4c20d' }}
      >
        {cooldown > 0 ? `Wait ${cooldown}s` : 'BUZZ!'}
      </button>
    </div>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 text-center">{children}</div>
}
