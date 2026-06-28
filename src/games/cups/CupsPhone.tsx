import { useEffect, useRef, useState } from 'react'
import type { PhoneViewProps } from '../../shared/lib/gameModule'
import { useLocalCountdown } from '../../shared/lib/useLocalCountdown'
import { sound } from '../../shared/lib/sound'
import { cuBuzz, cupSrc, useCu } from './api'

export default function CupsPhone({ room, me }: PhoneViewProps) {
  const { cu } = useCu(room)
  const [order, setOrder] = useState<string[]>([])
  const [orient, setOrient] = useState<'h' | 'v'>('h')
  const [drag, setDrag] = useState<number | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [flash, setFlash] = useState<{ ok: boolean; msg: string } | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])

  // reset arrangement each new round
  useEffect(() => {
    if (cu?.start) { setOrder(cu.start); setOrient('h'); setFlash(null); setCooldown(0) }
  }, [cu?.round]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

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

  const size = orient === 'h' ? 'min(17vw, 88px)' : 'min(12vh, 82px)'

  function startDrag(i: number, e: React.PointerEvent) {
    if (cu!.phase !== 'build') return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setDrag(i)
    setPos({ x: e.clientX, y: e.clientY })
  }
  function moveDrag(e: React.PointerEvent) {
    if (drag === null) return
    setPos({ x: e.clientX, y: e.clientY })
  }
  function endDrag(e: React.PointerEvent) {
    if (drag === null) return
    const x = e.clientX, y = e.clientY
    let target = -1
    slotRefs.current.forEach((el, k) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) target = k
    })
    if (target >= 0 && target !== drag) {
      setOrder((o) => {
        const n = [...o]
        ;[n[drag], n[target]] = [n[target], n[drag]]
        return n
      })
    }
    setDrag(null)
  }

  async function buzz() {
    if (cooldown > 0 || cu!.phase !== 'build') return
    try {
      const r = await cuBuzz(room.id, order, orient)
      if (r.correct) { setFlash({ ok: true, msg: 'Matched! +100' }); sound.correct() }
      else { setFlash({ ok: false, msg: 'Wrong — −50' }); setCooldown(2); sound.roundStart() }
    } catch (e) { console.error(e) }
  }

  return (
    <div className="flex min-h-full flex-col px-4 py-4" style={{ touchAction: 'none' }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-white/50">Round {cu.round}/{cu.total}</span>
        <span className="pf-wordmark text-lg text-white">{remaining}s</span>
      </div>
      <p className="mb-3 text-center text-sm text-white/60">Drag the cups to match the TV, then buzz.</p>

      <button
        onClick={() => setOrient((o) => (o === 'h' ? 'v' : 'h'))}
        className="mx-auto mb-4 rounded-full bg-white/10 px-4 py-2 text-sm text-white"
      >
        {orient === 'h' ? '⬌ Row  ·  tap for ⬍ Stack' : '⬍ Stack  ·  tap for ⬌ Row'}
      </button>

      <div className="flex flex-1 items-center justify-center">
        <div className={`flex ${orient === 'v' ? 'flex-col' : 'flex-row'} items-center justify-center gap-2`}>
          {order.map((color, i) => (
            <div
              key={i}
              ref={(el) => (slotRefs.current[i] = el)}
              className="grid place-items-center rounded-2xl"
              style={{ width: size, height: size, background: drag === i ? 'rgba(255,255,255,0.08)' : 'transparent' }}
            >
              <img
                src={cupSrc(color)}
                alt={color}
                onPointerDown={(e) => startDrag(i, e)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                draggable={false}
                style={{ width: '100%', height: '100%', opacity: drag === i ? 0 : 1, touchAction: 'none', cursor: 'grab' }}
              />
            </div>
          ))}
        </div>
      </div>

      {drag !== null && (
        <img
          src={cupSrc(order[drag])}
          alt=""
          style={{
            position: 'fixed', left: pos.x, top: pos.y, width: size, height: size,
            transform: 'translate(-50%, -50%) scale(1.1)', pointerEvents: 'none', zIndex: 50,
          }}
        />
      )}

      {flash && (
        <p className={`mb-2 text-center pf-wordmark text-xl ${flash.ok ? 'text-p-lime' : 'text-red-400'}`}>{flash.msg}</p>
      )}
      <button
        onClick={buzz}
        disabled={cooldown > 0}
        className="mt-2 w-full rounded-card py-5 pf-wordmark text-3xl text-grape-900 transition active:scale-95 disabled:opacity-40"
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
