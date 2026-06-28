import { useEffect, useRef, useState } from 'react'
import type { Pt, RoomChannel } from '../../shared/lib/realtime'
import { BRUSHES, drawStrokes, type Stroke } from './canvas'

const uid = () => Math.random().toString(36).slice(2, 9)
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

// Fixed 4:3 aspect on both surfaces so normalized strokes map phone -> TV.
function useCanvasSize(ref: React.RefObject<HTMLCanvasElement>) {
  const [size, setSize] = useState({ w: 1, h: 1 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      el.width = r.width
      el.height = r.height
      setSize({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

// The drawer's interactive pad. Streams batched stroke segments over the room
// channel (~14/sec) and echoes locally for instant feedback.
export function DrawPad({
  color,
  channel,
  enabled,
}: {
  color: string
  channel: RoomChannel
  enabled: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { w, h } = useCanvasSize(ref)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [brush, setBrush] = useState(BRUSHES[1])
  const [erasing, setErasing] = useState(false)
  const ink = erasing ? '#ffffff' : color // white "erases" on the white canvas
  const drawing = useRef(false)
  const cur = useRef<Stroke | null>(null)
  const pending = useRef<Pt[]>([])

  // render loop
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (ctx) drawStrokes(ctx, strokes, w, h)
  }, [strokes, w, h])

  // flush batched points to the channel
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => {
      if (cur.current && pending.current.length) {
        channel.sendStroke({ id: cur.current.id, color: cur.current.color, size: cur.current.size, points: pending.current })
        pending.current = []
      }
    }, 70)
    return () => window.clearInterval(id)
  }, [enabled, channel])

  function ptFrom(e: React.PointerEvent) {
    const r = ref.current!.getBoundingClientRect()
    return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) }
  }
  function down(e: React.PointerEvent) {
    if (!enabled) return
    ;(e.target as Element).setPointerCapture(e.pointerId)
    drawing.current = true
    const p = ptFrom(e)
    cur.current = { id: uid(), color: ink, size: brush, points: [p] }
    pending.current = [p]
    setStrokes((s) => [...s, cur.current!])
  }
  function move(e: React.PointerEvent) {
    if (!enabled || !drawing.current || !cur.current) return
    const p = ptFrom(e)
    cur.current.points.push(p)
    pending.current.push(p)
    setStrokes((s) => s.slice())
  }
  function up() {
    drawing.current = false
    cur.current = null
  }
  function clear() {
    setStrokes([])
    channel.sendClear()
  }
  function undo() {
    setStrokes((s) => s.slice(0, -1))
    // (TV undo is best-effort; a clear is the reliable reset during a round)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div
        className="relative mx-auto w-full shrink overflow-hidden rounded-card bg-white"
        style={{ aspectRatio: '4 / 3', maxHeight: '46vh', maxWidth: 'calc(46vh * 4 / 3)' }}
      >
        <canvas
          ref={ref}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className="absolute inset-0 h-full w-full touch-none"
          style={{ cursor: enabled ? 'crosshair' : 'not-allowed' }}
        />
        {!enabled && (
          <div className="absolute inset-0 grid place-items-center text-grape-700/70">Get ready…</div>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex items-center justify-center gap-4">
          {BRUSHES.map((b) => (
            <button
              key={b}
              onClick={() => setBrush(b)}
              aria-label={`brush ${Math.round(b * 1000)}`}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full pf-glass ${brush === b ? 'ring-2 ring-cyan' : ''}`}
            >
              <span
                className="rounded-full"
                style={{ width: b * 360, height: b * 360, background: ink, outline: erasing ? '1px solid #cbd5e1' : 'none' }}
              />
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setErasing(false)}
            className={`pf-glass rounded-card py-2 text-sm ${!erasing ? 'ring-2 ring-cyan' : ''}`}
            aria-pressed={!erasing}
          >✏️ Pen</button>
          <button
            onClick={() => setErasing(true)}
            className={`pf-glass rounded-card py-2 text-sm ${erasing ? 'ring-2 ring-cyan' : ''}`}
            aria-pressed={erasing}
          >🧽 Erase</button>
          <button onClick={undo} className="pf-glass rounded-card py-2 text-sm">Undo</button>
          <button onClick={clear} className="pf-glass rounded-card py-2 text-sm">Clear</button>
        </div>
      </div>
    </div>
  )
}

// Read-only canvas for the TV: renders strokes pushed in via props.
export function StrokeCanvas({ strokes }: { strokes: Stroke[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { w, h } = useCanvasSize(ref)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (ctx) drawStrokes(ctx, strokes, w, h)
  }, [strokes, w, h])
  return (
    <div className="relative w-full overflow-hidden rounded-card bg-white" style={{ aspectRatio: '4 / 3' }}>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
