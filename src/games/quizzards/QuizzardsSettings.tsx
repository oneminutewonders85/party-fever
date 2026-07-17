import { useEffect, useState } from 'react'
import type { SettingsPanelProps } from '../../shared/lib/gameModule'
import { setSettings } from '../../shared/lib/room'
import { DIFFICULTY_LABEL, type Difficulty, type RoomSettingsM2 } from '../../shared/lib/types'

const DIFFS: Difficulty[] = ['easy', 'moderate', 'pro']

export default function QuizzardsSettings({ room }: SettingsPanelProps) {
  const s = room.settings as RoomSettingsM2
  const [diff, setDiff] = useState<Difficulty>(s.difficulty ?? 'easy')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSaving(true)
    setSettings(room.id, 1, diff).catch(console.error).finally(() => setSaving(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diff])

  return (
    <div className="pf-glass rounded-card p-5">
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
      <p className="mt-4 text-sm text-white/50">15 questions · 30s each · +100 per correct answer</p>
      <p className="mt-1 text-xs text-white/35">{saving ? 'Saving…' : 'Saved'}</p>
    </div>
  )
}
