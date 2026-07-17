// Image preloading.
//
// Why this exists: games used to fetch their round images at the moment the
// round started. A phone on fast wifi rendered the board in ~100ms; a phone on
// weaker signal took 1-3 seconds. That gap was a real head start, because the
// fast player could study and act while others stared at a blank box.
//
// The fix is to fetch during dead time (the lobby, and the reveal between
// rounds) so that by the time a round starts, every device is rendering from
// cache. Decode is included deliberately: a cached-but-undecoded image still
// costs a frame or two to paint.

const seen = new Map<string, Promise<void>>()

/** Fetch and decode one image. Resolves even on failure, so a missing asset
 *  can never wedge a round behind a hanging promise. */
export function preloadImage(src: string): Promise<void> {
  const hit = seen.get(src)
  if (hit) return hit
  const p = new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      // decode() paints the cost now rather than on first render
      const done = () => resolve()
      if (typeof img.decode === 'function') img.decode().then(done, done)
      else done()
    }
    img.onerror = () => resolve()
    img.src = src
  })
  seen.set(src, p)
  return p
}

/** Fetch and decode many images. Never rejects. */
export function preloadImages(srcs: string[]): Promise<void> {
  return Promise.all(srcs.map(preloadImage)).then(() => undefined)
}

/** True only if every src has already been fetched AND decoded. Used to gate
 *  the start of a round so nobody begins before their board can paint. */
export function allPreloaded(srcs: string[]): boolean {
  return srcs.every((s) => settled.has(s))
}

const settled = new Set<string>()
export function markSettled(src: string) { settled.add(src) }

/** Preload and record completion, so allPreloaded() can answer synchronously. */
export function preloadTracked(srcs: string[]): Promise<void> {
  return Promise.all(
    srcs.map((s) => preloadImage(s).then(() => { settled.add(s) })),
  ).then(() => undefined)
}
