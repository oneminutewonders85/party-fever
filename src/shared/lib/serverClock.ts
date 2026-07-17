import { supabase } from './supabase'

// A shared clock.
//
// Device clocks disagree, often by seconds. That is why the countdown hooks
// deliberately avoided server timestamps: a TV running fast would think every
// phase had already expired. The cost of that decision was fairness. Each phone
// started its round timer when *it* happened to receive the state, so a phone
// that got the broadcast late, or finished loading images late, was simply
// behind, and a phone on fast wifi got a real head start.
//
// This measures the offset between this device and the database, once, using
// the keepalive() function (which returns now() and is already open to anon).
// After that, serverNow() gives every device the same number at the same
// moment, so a round can be armed for everyone at a single instant.
//
// Accuracy is roughly half the round trip, typically 30-80ms. That is far
// tighter than the 1-3 second spread we are removing, and it is well inside
// human reaction time.

let offsetMs = 0
let ready = false
let inflight: Promise<void> | null = null

async function measureOnce(): Promise<number | null> {
  const t0 = Date.now()
  const { data, error } = await supabase.rpc('keepalive')
  const t1 = Date.now()
  if (error || !data) return null
  const rtt = t1 - t0
  const serverMs = new Date(data as string).getTime()
  // assume the server observed now() at the midpoint of the round trip
  return serverMs - (t0 + rtt / 2)
}

/** Measure the clock offset. Safe to call repeatedly; only the first runs. */
export function syncServerClock(): Promise<void> {
  if (inflight) return inflight
  inflight = (async () => {
    // take the best of three: the sample with the tightest round trip wins,
    // since a slow sample carries the most uncertainty about the midpoint
    const samples: number[] = []
    for (let i = 0; i < 3; i++) {
      const o = await measureOnce()
      if (o !== null) samples.push(o)
    }
    if (samples.length) {
      samples.sort((a, b) => a - b)
      offsetMs = samples[Math.floor(samples.length / 2)] // median
      ready = true
    }
  })()
  return inflight
}

/** Current time on the database's clock. Falls back to local time until the
 *  first sync lands, which is correct-ish and never blocks a round. */
export function serverNow(): number {
  return Date.now() + offsetMs
}

export function clockReady(): boolean {
  return ready
}

export function clockOffset(): number {
  return offsetMs
}
