import { useEffect, useRef, useState } from 'react'
import { SPIN_ANIM_MS } from './wheel'
import type { SsLast } from './api'

// The server resolves a spin instantly: it picks the segment, applies the
// points or the bankrupt, and passes the turn, all in one write. The TV then
// spends 3.4 seconds animating the wheel towards a result it already knows.
//
// That gap used to leak the outcome. A player saw "you lost your turn" on their
// phone, and the next player's phone lit up, while the TV was still spinning.
//
// This hook holds every client for exactly the animation's length, keyed off the
// spin event itself, so the reveal happens when the wheel lands and not before.
// A fresh mount adopts the current event without holding, so reloading mid-round
// does not strand the player behind a phantom spin.
export function useSpinHold(last: SsLast | null | undefined): boolean {
  const [holding, setHolding] = useState(false)
  const seen = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const key = last && last.type === 'spin' ? JSON.stringify(last) : null
    if (seen.current === undefined) { seen.current = key; return } // first render: adopt, don't hold
    if (key && key !== seen.current) {
      seen.current = key
      setHolding(true)
      const id = window.setTimeout(() => setHolding(false), SPIN_ANIM_MS)
      return () => window.clearTimeout(id)
    }
    if (!key) seen.current = key
  }, [last])

  return holding
}
