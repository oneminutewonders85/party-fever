import { useEffect, useRef } from 'react'

// Hybrid sync model for all games.
//
// Real-time updates already arrive via the room broadcast channel (openRoomChannel
// -> onSync -> reload). This hook adds the SAFETY POLL underneath push: a slower
// interval that guarantees a client self-heals if a broadcast is ever missed
// (backgrounded tab, dropped socket frame), preserving polling's self-correcting
// property while cutting steady-state request load by ~50-85% vs the old 1.2-1.5s
// polling.
//
// Tiers (safety-poll interval):
//   'race' — 3000ms  : first-correct-action decides a winner (Cups, Quick Doodle,
//                       Werewolf night/phase). Tight net so any missed event
//                       self-heals within one race window.
//   'calm' — 9000ms  : turn-based or independently-scored (Quizzards, Scrutineye,
//                       Spin & Spell). Poll is pure insurance; rarely needed.
//
// Correctness note: the server remains authoritative for all scoring/winner logic.
// Push/poll only affect how quickly a client's DISPLAY catches up to server truth,
// never the truth itself. So no game can be mis-scored by a delayed update.

export type SyncTier = 'race' | 'calm'
const INTERVAL: Record<SyncTier, number> = { race: 3000, calm: 9000 }

export function useHybridSync(reload: () => void, tier: SyncTier, key: string) {
  const reloadRef = useRef(reload)
  reloadRef.current = reload

  useEffect(() => {
    // initial fetch on mount / room change
    reloadRef.current()

    const ms = INTERVAL[tier]
    const id = window.setInterval(() => reloadRef.current(), ms)

    // Instant resync when the tab/app returns to the foreground. This closes the
    // one edge case in any push system: a phone backgrounded longer than its
    // safety interval (player checked a message mid-game) refreshes immediately
    // on return rather than waiting for the next tick.
    const onVisible = () => { if (document.visibilityState === 'visible') reloadRef.current() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tier])
}
