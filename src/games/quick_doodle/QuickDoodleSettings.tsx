import { useEffect, useState } from 'react'
import type { SettingsPanelProps } from '../../shared/lib/gameModule'
import { setSettings } from '../../shared/lib/room'
import { DIFFICULTY_LABEL, type Difficulty, type RoomSettingsM2 } from '../../shared/lib/types'

const RPP_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const DIFFS: Difficulty[] = ['easy', 'moderate', 'pro']

// Shown on the TV lobby. The host taps to set rounds-per-player and difficulty;
// values persist to rooms.settings via the set_settings RPC.
export default function QuickDoodleSettings({ room }: SettingsPanelProps) {
  const s = room.settings as RoomSettingsM2
  const [rpp, setRpp] = useState<number>(s.rounds_per_player ?? 3)
  const [diff, setDiff] = useState<Difficulty>(s.difficulty ?? 'easy')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSaving(true)
    setSettings(room.id, rpp, diff)
      .catch(console.error)
      .finally(() => setSaving(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpp, diff])

  return (
    <div className="pf-glass rounded-card p-5">
      <div className="mb-4">
        <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Rounds per player</p>
        <div className="flex flex-wrap gap-2">
          {RPP_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setRpp(n)}
              className={`h-11 w-11 rounded-card pf-wordmark text-lg ${rpp === n ? 'bg-cyan text-grape-900' : 'bg-white/10'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Difficulty</p>
        <div className="flex gap-2">
          {DIFFS.map((d) => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className={`flex-1 rounded-card px-4 py-2 font-medium ${diff === d ? 'bg-p-lime text-grape-900' : 'bg-white/10'}`}
            >
              {DIFFICULTY_LABEL[d]}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-white/35">{saving ? 'Saving…' : 'Saved'}</p>
    </div>
  )
}
