import type { SettingsPanelProps } from '../../shared/lib/gameModule'
import { RoleIcon } from './ui'

// Werewolf has no host-tunable settings — roles are dealt automatically. This
// panel just explains the role mix: always exactly ONE werewolf.
export default function WerewolfSettings(_: SettingsPanelProps) {
  void _
  return (
    <div className="pf-glass rounded-card p-5 text-base text-white/75">
      <p className="mb-3 font-semibold text-white">Roles are dealt in secret</p>
      <div className="flex flex-col gap-2">
        <p className="inline-flex items-center gap-2"><RoleIcon role="werewolf" size={20} color="#f43f5e" /> 1 Werewolf — hunts at night</p>
        <p className="inline-flex items-center gap-2"><RoleIcon role="doctor" size={20} color="#06b6d4" /> 1 Doctor — saves one player each night</p>
        <p className="inline-flex items-center gap-2"><RoleIcon role="villager" size={20} color="#84cc16" /> Everyone else — Villagers</p>
      </div>
      <p className="mt-3 text-white/45">Needs at least 5 players to start.</p>
    </div>
  )
}
