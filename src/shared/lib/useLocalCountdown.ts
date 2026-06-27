import { useEffect, useRef, useState } from 'react'

// Counts down `seconds` from the moment `resetKey` last changed, using ONLY the
// local device clock — immune to client/server clock skew (a TV clock running
// fast would otherwise see every phase as already expired and race the game).
//
// The start time lives in a ref that resets *synchronously* during render when
// the key changes, so the value is never momentarily 0 right after a phase flip
// (which would otherwise fire an immediate, spurious advance).
export function useLocalCountdown(resetKey: string, seconds: number): number {
  const start = useRef<{ key: string; at: number }>({ key: resetKey, at: Date.now() })
  if (start.current.key !== resetKey) {
    start.current = { key: resetKey, at: Date.now() }
  }
  const [, force] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 250)
    return () => window.clearInterval(id)
  }, [])
  const elapsed = (Date.now() - start.current.at) / 1000
  return Math.max(0, Math.ceil(seconds - elapsed))
}
