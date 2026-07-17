import { useEffect, useRef, useState } from 'react'
import { SPIN_ANIM_MS } from './wheel'
import type { SsLast } from './api'

// The server resolves a spin instantly: segment, points, turn pass, all in one
// write. The TV then spends SPIN_ANIM_MS animating a wheel towards a result it
// already knows. Without a hold, the phone shows the outcome 3.4s before the
// wheel lands on it.
//
// This holds every client for the animation's length.
//
// Two failure modes are designed out, because the first version had both:
//
//   1. Object identity. `last` is re-parsed from JSON on every state refresh, so
//      it is a NEW object each time even when nothing changed. Keying the effect
//      on the object meant every refresh ran the cleanup, killed the pending
//      timer, and then matched no branch, so the hold never ended and every
//      phone froze on "Spinning...". The effect now keys on the serialised
//      string, which only changes when the event actually changes.
//
//   2. Relying on a timer to end the hold. A lost or cancelled timeout used to
//      mean a permanent freeze. The hold is now a deadline: even if every timer
//      is lost, the next render past the deadline ends it. The interval only
//      drives repaints, it is not load bearing.
//
// `nonce` should be ss.phase_started. Without it, spinning the SAME segment
// twice in a row serialises identically, the key never changes, and the hold
// silently never fires. Every ss_spin path rewrites phase_started, so it is a
// reliable per-spin marker.
export function useSpinHold(last: SsLast | null | undefined, nonce?: string | null): boolean {
  const key = last && last.type === 'spin' ? `${nonce ?? ''}#${JSON.stringify(last)}` : null
  const [holdUntil, setHoldUntil] = useState(0)
  const seen = useRef<string | null | undefined>(undefined)
  const [, tick] = useState(0)

  useEffect(() => {
    // first render adopts whatever is current, so a reload mid-round does not
    // strand the player behind a spin that already happened
    if (seen.current === undefined) { seen.current = key; return }
    if (key === seen.current) return
    seen.current = key
    setHoldUntil(key ? Date.now() + SPIN_ANIM_MS : 0)
  }, [key])

  const holding = holdUntil > 0 && Date.now() < holdUntil

  useEffect(() => {
    if (!holding) return
    const id = window.setInterval(() => tick((n) => n + 1), 100)
    return () => window.clearInterval(id)
  }, [holding])

  return holding
}
