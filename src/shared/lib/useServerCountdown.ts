import { useEffect, useState } from 'react'

// Server-anchored timer: given an ISO timestamp from the server and a duration,
// compute remaining seconds locally. Never a free-running countdown, so every
// device agrees regardless of when it joined or re-rendered.
export function useServerCountdown(anchorIso: string | null | undefined, seconds: number) {
  const [remaining, setRemaining] = useState<number>(seconds)

  useEffect(() => {
    if (!anchorIso) {
      setRemaining(seconds)
      return
    }
    const anchor = new Date(anchorIso).getTime()
    const compute = () => {
      const elapsed = (Date.now() - anchor) / 1000
      setRemaining(Math.max(0, Math.ceil(seconds - elapsed)))
    }
    compute()
    const id = window.setInterval(compute, 250)
    return () => window.clearInterval(id)
  }, [anchorIso, seconds])

  return remaining
}
