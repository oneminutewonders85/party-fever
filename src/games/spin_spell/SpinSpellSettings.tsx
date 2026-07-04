import { useEffect, useState } from 'react'
import type { SettingsPanelProps } from '../../shared/lib/gameModule'
import { ssSetRounds } from './api'

export default function SpinSpellSettings({ room }: SettingsPanelProps) {
  const [rounds, setRounds] = useState<number>((room.settings as { rounds?: number }).rounds ?? 3)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSaving(true)
    ssSetRounds(room.id, rounds).catch(console.error).finally(() => setSaving(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rounds])

  return (
    <div className="pf-glass rounded-card p-5">
      <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Puzzles per game</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRounds(n)}
            className={`flex-1 rounded-card px-4 py-2 font-medium ${rounds === n ? 'bg-p-lime text-grape-900' : 'bg-white/10'}`}
          >{n}</button>
        ))}
      </div>
      <p className="mt-4 text-sm text-white/50">Spin for points · pick letters · solve for +1000 · beware BANKRUPT</p>
      <p className="mt-1 text-xs text-white/35">{saving ? 'Saving…' : 'Saved'}</p>
    </div>
  )
}
