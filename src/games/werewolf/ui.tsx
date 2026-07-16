import { PAL, type Player } from '../../shared/lib/types'
import { RoleIcon } from '../../shared/components/icons'
import type { WwRole } from './types'
export { RoleIcon }

export const ROLE_ACCENT: Record<WwRole, string> = {
  werewolf: '#ef4444',
  doctor: '#14b8a6',
  villager: '#f59e0b',
}
export const ROLE_LABEL: Record<WwRole, string> = { werewolf: 'WEREWOLF', doctor: 'DOCTOR', villager: 'VILLAGER' }

// Moonlit night backdrop. The moon sits in the upper-RIGHT corner (out of the
// text column), dimmed, with a crescent shadow; a radial scrim behind the
// content keeps white type readable no matter what's underneath.
const STARS = [
  { x: '8%', y: '18%', s: 3 }, { x: '16%', y: '62%', s: 2 }, { x: '24%', y: '10%', s: 2 },
  { x: '38%', y: '22%', s: 2 }, { x: '55%', y: '8%', s: 3 }, { x: '68%', y: '30%', s: 2 },
  { x: '80%', y: '55%', s: 2 }, { x: '90%', y: '35%', s: 3 }, { x: '12%', y: '40%', s: 2 },
  { x: '47%', y: '48%', s: 2 }, { x: '73%', y: '12%', s: 2 }, { x: '86%', y: '72%', s: 2 },
]

export function NightScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[70vh] overflow-hidden rounded-card">
      {/* base night gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(120% 80% at 50% -10%, #2a1463 0%, #160a33 55%, #0c0720 100%)' }}
      />
      {/* stars */}
      {STARS.map((st, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: st.x, top: st.y, width: st.s, height: st.s,
            background: '#dfe9ff', opacity: 0.7,
            boxShadow: '0 0 6px 1px rgba(207,224,255,.5)',
            animation: `pf-twinkle ${2.4 + (i % 5) * 0.7}s ease-in-out ${i * 0.3}s infinite alternate`,
          }}
        />
      ))}
      {/* crescent moon — upper-right, away from headlines, softer glow */}
      <div className="pointer-events-none absolute right-8 top-8 h-24 w-24">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #f6f9ff 0%, #d5e1fb 55%, #9db2df 100%)',
            boxShadow: '0 0 50px 14px rgba(190,210,255,.28)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{ inset: '-8% -8% 8% 24%', background: 'radial-gradient(circle at 60% 40%, #160a33 62%, transparent 63%)', opacity: 0.9 }}
        />
      </div>
      {/* ground fog */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: 'linear-gradient(to top, rgba(174,191,232,.14), transparent)' }}
      />
      {/* readability scrim behind the content column */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(75% 60% at 50% 46%, rgba(10,6,26,.66) 0%, rgba(10,6,26,.30) 62%, transparent 100%)' }}
      />
      <div className="relative z-10 p-8" style={{ textShadow: '0 2px 18px rgba(6,3,18,.85)' }}>{children}</div>
      <style>{`@keyframes pf-twinkle { from { opacity:.25 } to { opacity:.85 } }`}</style>
    </div>
  )
}

export function PlayerDot({ player, size = 12 }: { player: Player; size?: number }) {
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: size, height: size, background: PAL[player.color], boxShadow: `0 0 10px ${PAL[player.color]}` }}
    />
  )
}

// Big single-select picker of players, accent-highlighted.
export function PlayerPicker({
  players,
  selectable,
  selectedId,
  onSelect,
  accent,
  allowSelfLabel,
  selfId,
}: {
  players: Player[]
  selectable: (p: Player) => boolean
  selectedId: string | null
  onSelect: (id: string) => void
  accent: string
  allowSelfLabel?: string
  selfId?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      {players.filter(selectable).map((p) => {
        const sel = selectedId === p.id
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="pf-glass flex items-center gap-3 rounded-card px-4 py-4 text-left transition"
            style={sel ? { outline: `2px solid ${accent}`, background: `${accent}22` } : undefined}
          >
            <PlayerDot player={p} size={18} />
            <span className="flex-1 text-lg font-medium">
              {p.id === selfId && allowSelfLabel ? allowSelfLabel : p.name}
            </span>
            {sel && <span style={{ color: accent }}>✓</span>}
          </button>
        )
      })}
    </div>
  )
}
