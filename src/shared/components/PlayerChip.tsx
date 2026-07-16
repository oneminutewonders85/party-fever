import { PAL, type Player } from '../lib/types'

// A joined player shown in their colour. Used on the TV lobby + scoreboard.
export default function PlayerChip({ player, big = false }: { player: Player; big?: boolean }) {
  const hex = PAL[player.color]
  return (
    <div
      className={`pf-glass animate-popIn flex items-center gap-3 rounded-card ${big ? 'px-5 py-3 text-xl' : 'px-4 py-2'}`}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: big ? 22 : 16, height: big ? 22 : 16, background: hex, boxShadow: `0 0 16px ${hex}` }}
      />
      <span className="font-medium">{player.name}</span>
    </div>
  )
}
