import { useState } from 'react'
import type { SettingsPanelProps } from '../../shared/lib/gameModule'
import { cuSetRounds } from './api'

const ROUNDS = [10, 20, 40]

export default function CupsSettings({ room }: SettingsPanelProps) {
  const s = room.settings as { rounds?: number }
  const [rounds, setRounds] = useState<number>(ROUNDS.includes(s.rounds ?? 0) ? (s.rounds as number) : 10)
  const [saving, setSaving] = useState(false)

  function pick(n: number) {
    setRounds(n); setSaving(true)
    cuSetRounds(room.id, n).catch(console.error).finally(() => setSaving(false))
  }

  return (
    <div className="pf-glass rounded-card p-5">
      <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Rounds</p>
      <div className="flex gap-2">
        {ROUNDS.map((n) => (
          <button
            key={n}
            onClick={() => pick(n)}
            className={`flex-1 rounded-card px-4 py-3 pf-wordmark text-xl ${rounds === n ? 'bg-p-lime text-grape-900' : 'bg-white/10'}`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-white/50">Match the colour sequence, first correct buzz wins +100. A wrong buzz costs 50.</p>
      <p className="mt-1 text-xs text-white/35">{saving ? 'Saving…' : 'Saved'}</p>
    </div>
  )
}
