import type { Pt } from '../../shared/lib/realtime'

export type BrushStyle = 'pen' | 'highlighter' | 'calligraphy'

export interface Stroke {
  id: string
  color: string
  size: number // fraction of canvas width
  points: Pt[]
  style?: BrushStyle // optional so old payloads still render (default 'pen')
}

// Brush sizes offered to the drawer, as fractions of canvas width so they scale
// identically on the phone and the TV.
export const BRUSHES = [0.006, 0.013, 0.022, 0.036]

// Render all strokes onto a 2D context sized w×h. Used unchanged by both the
// drawer's pad (local echo) and the TV (received strokes).
export function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const s of strokes) {
    if (!s.points.length) continue
    const style = s.style ?? 'pen'
    ctx.globalAlpha = style === 'highlighter' ? 0.35 : 1
    ctx.lineCap = style === 'calligraphy' ? 'butt' : 'round'
    ctx.strokeStyle = s.color
    ctx.fillStyle = s.color
    ctx.lineWidth = Math.max(1, s.size * w * (style === 'highlighter' ? 1.8 : 1))
    if (s.points.length === 1) {
      const p = s.points[0]
      ctx.beginPath()
      ctx.arc(p.x * w, p.y * h, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fill()
      continue
    }
    ctx.beginPath()
    ctx.moveTo(s.points[0].x * w, s.points[0].y * h)
    for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x * w, s.points[i].y * h)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

// Merge an incoming stroke segment into an accumulating list (by stroke id).
export function mergeStroke(strokes: Stroke[], seg: Stroke): Stroke[] {
  const idx = strokes.findIndex((s) => s.id === seg.id)
  if (idx === -1) return [...strokes, seg]
  const next = strokes.slice()
  next[idx] = { ...next[idx], points: [...next[idx].points, ...seg.points] }
  return next
}
