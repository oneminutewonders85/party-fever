import { PAL, type Player } from '../../shared/lib/types'
import type { WwRole } from './types'

export const ROLE_ACCENT: Record<WwRole, string> = {
  werewolf: '#ef4444',
  doctor: '#14b8a6',
  villager: '#f59e0b',
}
export const ROLE_ICON: Record<WwRole, string> = { werewolf: '🐺', doctor: '⚕️', villager: '🧑\u200d🌾' }
export const ROLE_LABEL: Record<WwRole, string> = { werewolf: 'WEREWOLF', doctor: 'DOCTOR', villager: 'VILLAGER' }

// Moonlit night backdrop: glowing moon + soft fog over the base gradient.
export function NightScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[70vh] overflow-hidden rounded-card">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(120% 80% at 50% -10%, #2a1463 0%, #160a33 55%, #0c0720 100%)' }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, #dfe9ff 55%, #aebfe8 100%)', boxShadow: '0 0 90px 30px rgba(207,224,255,.45)' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: 'linear-gradient(to top, rgba(174,191,232,.14), transparent)' }}
      />
      <div className="relative z-10 p-8">{children}</div>
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
