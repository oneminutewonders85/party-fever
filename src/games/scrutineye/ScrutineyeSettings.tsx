import { useEffect, useState } from 'react'
import type { SettingsPanelProps } from '../../shared/lib/gameModule'
import { supabase } from '../../shared/lib/supabase'

const OPTS = [1, 2, 3, 4, 5]

export default function ScrutineyeSettings({ room }: SettingsPanelProps) {
  const init = Number((room.settings as { rounds?: number }).rounds ?? 3)
  const [rounds, setRounds] = useState(init)
  useEffect(() => {
    supabase.rpc('set_rounds', { p_room_id: room.id, p_rounds: rounds }).then(({ error }) => error && console.error(error))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rounds])
  return (
    <div className="pf-glass rounded-card p-5">
      <p className="mb-2 text-xs uppercase tracking-widest text-white/50">Rounds (scenes)</p>
      <div className="flex gap-2">
        {OPTS.map((n) => (
          <button key={n} onClick={() => setRounds(n)}
            className={`h-11 w-11 rounded-card pf-wordmark text-lg ${rounds === n ? 'bg-cyan text-grape-900' : 'bg-white/10'}`}>{n}</button>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/40">Each round shows a new scene with 5 random letters. 90 seconds to spot as many as you can.</p>
    </div>
  )
}
