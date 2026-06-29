import { PAL, type Player } from '../lib/types'

const MEDAL = ['🥇', '🥈', '🥉']

// Live scoreboard, highest first. Driven by Postgres Changes on players.
export default function Scoreboard({
  players,
  drawerId,
  size = 'md',
}: {
  players: Player[]
  drawerId?: string | null
  size?: 'md' | 'lg'
}) {
  const ranked = [...players].sort((a, b) => b.score - a.score)
  const lg = size === 'lg'
  return (
    <div className={`flex flex-col ${lg ? 'gap-3' : 'gap-2'}`}>
      {ranked.map((p, i) => (
        <div
          key={p.id}
          className={`pf-glass flex items-center rounded-card ${lg ? 'gap-4 px-6 py-4' : 'gap-3 px-4 py-3'}`}
          style={i === 0 ? { outline: '2px solid rgba(132,204,22,0.5)' } : undefined}
        >
          <span className={`text-center ${lg ? 'w-9 text-2xl' : 'w-7 text-lg'}`}>
            {i < 3 ? MEDAL[i] : <span className="text-white/40">{i + 1}</span>}
          </span>
          <span
            className={`inline-block rounded-full ${lg ? 'h-5 w-5' : 'h-4 w-4'}`}
            style={{ background: PAL[p.color], boxShadow: `0 0 12px ${PAL[p.color]}` }}
          />
          <span className={`flex-1 font-medium text-white ${lg ? 'text-2xl' : 'text-lg'}`}>
            {p.name} {drawerId === p.id && <span className="text-xs text-white/40">✏️ drawing</span>}
          </span>
          <span className={`pf-wordmark text-cyan ${lg ? 'text-4xl' : 'text-2xl'}`}>{p.score}</span>
        </div>
      ))}
    </div>
  )
}
