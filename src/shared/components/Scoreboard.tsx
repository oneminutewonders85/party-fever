import { PAL, type Player } from '../lib/types'

// Live scoreboard, highest first. Driven by Postgres Changes on players.
export default function Scoreboard({ players, drawerId }: { players: Player[]; drawerId?: string | null }) {
  const ranked = [...players].sort((a, b) => b.score - a.score)
  return (
    <div className="flex flex-col gap-2">
      {ranked.map((p, i) => (
        <div key={p.id} className="pf-glass flex items-center gap-3 rounded-card px-4 py-2">
          <span className="w-6 text-center text-white/40">{i + 1}</span>
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: PAL[p.color], boxShadow: `0 0 10px ${PAL[p.color]}` }}
          />
          <span className="flex-1 font-medium">
            {p.name} {drawerId === p.id && <span className="text-xs text-white/40">✏️ drawing</span>}
          </span>
          <span className="pf-wordmark text-cyan">{p.score}</span>
        </div>
      ))}
    </div>
  )
}
