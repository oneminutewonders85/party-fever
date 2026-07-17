import { useEffect, useState } from 'react'
import { serverNow, syncServerClock } from './serverClock'
import { preloadTracked } from './preload'

// Fair starts for race games.
//
// Cups and Scrutineye are races: first correct buzz, first correct word. That
// makes them the two games where an uneven start actually costs someone points.
// Two things used to make starts uneven:
//
//   1. Assets. Each phone fetched the round's images when the round began, so a
//      phone on weaker signal stared at an empty box while a fast phone was
//      already playing.
//   2. State arrival. Input unlocked the instant a phone received the phase, and
//      phones receive it milliseconds to seconds apart.
//
// This hook removes both. It preloads the round's images, then unlocks input at
// an instant expressed on the *server's* clock, which every device agrees on.
// Everyone waits, then everyone starts together.
//
// The window is deliberately silent. No numbers count down, because a countdown
// invites people to pre-load their thumbs on the buzzer. Players just see a hold
// message, then a go message.

export const ARM_MS = 2600

export const FLASH_MS = 900

export interface ArmState {
  /** true once the round is live and input should be accepted */
  armed: boolean
  /** true while waiting, whether for the clock, the assets, or the window */
  holding: boolean
  /** true if this device is still fetching the round's images */
  loading: boolean
  /** true for a beat right after arming, so the UI can shout START */
  justArmed: boolean
}

export function useArmGate(
  phaseStartedIso: string | null | undefined,
  images: string[],
  active: boolean,
): ArmState {
  const [loaded, setLoaded] = useState(false)
  const [, tick] = useState(0)

  // one clock sync per session
  useEffect(() => { void syncServerClock() }, [])

  // fetch this round's images; resolves even if an asset 404s
  const key = images.join('|')
  useEffect(() => {
    if (!active || images.length === 0) { setLoaded(true); return }
    let cancelled = false
    setLoaded(false)
    preloadTracked(images).then(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active])

  // re-render across the hold so `armed` flips on time
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => tick((n) => n + 1), 100)
    return () => window.clearInterval(id)
  }, [active, phaseStartedIso])

  if (!active) return { armed: false, holding: false, loading: false, justArmed: false }

  const anchor = phaseStartedIso ? new Date(phaseStartedIso).getTime() : null
  // No anchor means we cannot know the common instant, so do not stall the game.
  const windowPassed = anchor === null ? true : serverNow() >= anchor + ARM_MS
  const armed = windowPassed && loaded

  // A brief START beat, measured from the same shared instant, so the shout
  // lands together on every device rather than when each one happened to arm.
  const sinceArm = anchor === null ? Infinity : serverNow() - (anchor + ARM_MS)
  const justArmed = armed && sinceArm >= 0 && sinceArm < FLASH_MS

  return { armed, holding: !armed, loading: !loaded, justArmed }
}
