import type { SettingsPanelProps } from '../../shared/lib/gameModule'

// Werewolf has no host-tunable settings — roles are dealt automatically. This
// panel just explains the role mix that will be used.
export default function WerewolfSettings(_: SettingsPanelProps) {
  void _
  return (
    <div className="pf-glass rounded-card p-5 text-sm text-white/75">
      <p className="mb-2 font-medium text-white">Roles are dealt in secret</p>
      <p>5–7 players → 🐺 1 · ⚕️ 1 · 🧑‍🌾 rest</p>
      <p>8+ players → 🐺 2 · ⚕️ 1 · 🧑‍🌾 rest</p>
      <p className="mt-2 text-white/45">Needs at least 5 players to start.</p>
    </div>
  )
}
