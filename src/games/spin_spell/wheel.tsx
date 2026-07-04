import { useEffect, useRef, useState } from 'react'

// Segment order MUST match ss_spin() in patch_05_spin_spell.sql:
//   0:100 1:150 2:BANKRUPT 3:200 4:300 5:LOSE TURN 6:250 7:400 8:150 9:FEVER 10:200 11:500
export interface Seg { label: string; value?: number; fill: string; text: string }
export const SEGMENTS: Seg[] = [
  { label: '100', value: 100, fill: '#3b82f6', text: '#fff' },
  { label: '150', value: 150, fill: '#a855f7', text: '#fff' },
  { label: 'BANKRUPT', fill: '#0b0714', text: '#f43f5e' },
  { label: '200', value: 200, fill: '#06b6d4', text: '#062a30' },
  { label: '300', value: 300, fill: '#ec4899', text: '#fff' },
  { label: 'LOSE TURN', fill: '#475569', text: '#e2e8f0' },
  { label: '250', value: 250, fill: '#84cc16', text: '#1a2e05' },
  { label: '400', value: 400, fill: '#f97316', text: '#431407' },
  { label: '150', value: 150, fill: '#14b8a6', text: '#042f2a' },
  { label: 'FEVER ×2', fill: '#fbbf24', text: '#451a03' },
  { label: '200', value: 200, fill: '#6366f1', text: '#fff' },
  { label: '500', value: 500, fill: '#ef4444', text: '#fff' },
]
const N = SEGMENTS.length
const SEG_ANGLE = 360 / N

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0)
  const p1 = polar(cx, cy, r, a1)
  return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y} Z`
}

// Spins to `seg` whenever `spinKey` changes; pointer is at 12 o'clock.
export default function Wheel({ seg, spinKey, size = 420 }: { seg: number | null; spinKey: string; size?: number }) {
  const [rot, setRot] = useState(0)
  const lastKey = useRef('')

  useEffect(() => {
    if (seg === null || spinKey === lastKey.current) return
    lastKey.current = spinKey
    // land the middle of segment `seg` under the top pointer, always spinning forward 4+ turns
    const target = -(seg * SEG_ANGLE + SEG_ANGLE / 2)
    setRot((r) => {
      const base = Math.ceil(r / 360) * 360
      return base + 4 * 360 + target
    })
  }, [seg, spinKey])

  const c = size / 2
  const r = c - 6
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* pointer */}
      <div
        className="absolute left-1/2 top-0 z-10 -translate-x-1/2"
        style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '26px solid #fbbf24', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.6))' }}
      />
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: `rotate(${rot}deg)`, transition: 'transform 3.4s cubic-bezier(.15,.9,.25,1)' }}
        className="h-full w-full"
      >
        <circle cx={c} cy={c} r={r + 4} fill="#0b0714" />
        {SEGMENTS.map((s, i) => {
          const a0 = i * SEG_ANGLE
          const a1 = a0 + SEG_ANGLE
          const mid = polar(c, c, r * 0.66, a0 + SEG_ANGLE / 2)
          const long = s.label.length > 4
          return (
            <g key={i}>
              <path d={wedgePath(c, c, r, a0, a1)} fill={s.fill} stroke="#0b0714" strokeWidth="2.5" />
              <text
                x={mid.x}
                y={mid.y}
                fill={s.text}
                fontSize={long ? size * 0.032 : size * 0.062}
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${a0 + SEG_ANGLE / 2} ${mid.x} ${mid.y})`}
                style={{ fontFamily: 'inherit', letterSpacing: long ? 0.5 : 1 }}
              >
                {s.label}
              </text>
            </g>
          )
        })}
        <circle cx={c} cy={c} r={size * 0.09} fill="#160a33" stroke="#fbbf24" strokeWidth="3" />
      </svg>
    </div>
  )
}
