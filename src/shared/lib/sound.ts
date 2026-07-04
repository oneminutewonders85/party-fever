// Party Fever audio — synthesized with the Web Audio API (no files, no
// licensing). One looping background bed + two SFX. To swap in a real licensed
// track later, replace startMusic() with an <audio loop> and keep the SFX.

type Maybe<T> = T | undefined

class SoundManager {
  private ctx: Maybe<AudioContext>
  private master: Maybe<GainNode>
  private musicBus: Maybe<GainNode>
  private musicOn = false
  private music: Maybe<HTMLAudioElement> // HTMLAudio fallback only
  private musicSrc: Maybe<AudioBufferSourceNode>
  private musicBuf: Maybe<AudioBuffer>
  private loadingBuf = false
  muted = false

  // Call from a user gesture (click/tap) so browsers allow audio.
  init() {
    if (this.ctx) {
      void this.ctx.resume()
      return
    }
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 0.6
    this.master.connect(this.ctx.destination)
    this.musicBus = this.ctx.createGain()
    this.musicBus.gain.value = 0.16 // background sits politely under the SFX
    this.musicBus.connect(this.master)
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.master) this.master.gain.value = m ? 0 : 0.6
    if (this.music) this.music.muted = m
  }
  isMuted() {
    return this.muted
  }

  private tone(
    freq: number,
    start: number,
    dur: number,
    opts: { type?: OscillatorType; gain?: number; bus?: AudioNode } = {},
  ) {
    if (!this.ctx || !this.master) return
    const { type = 'sine', gain = 0.3, bus = this.master } = opts
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    // soft attack + exponential release so notes don't click
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(gain, start + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    osc.connect(g)
    g.connect(bus)
    osc.start(start)
    osc.stop(start + dur + 0.05)
  }

  // Gapless background loop. HTMLAudio's `loop` leaves an audible seam
  // (mp3 encoder padding), so the track is decoded into an AudioBuffer and
  // looped sample-accurately through the Web Audio graph instead.
  startMusic() {
    if (this.musicOn) return
    this.musicOn = true
    this.init()
    if (!this.ctx || !this.musicBus) return
    if (this.musicBuf) { this.playBuffer(); return }
    if (this.loadingBuf) return
    this.loadingBuf = true
    fetch('/music/partyfever-loop.mp3')
      .then((r) => r.arrayBuffer())
      .then((ab) => this.ctx!.decodeAudioData(ab))
      .then((buf) => {
        this.musicBuf = buf
        if (this.musicOn) this.playBuffer()
      })
      .catch(() => {
        // decode/fetch failed -> plain <audio loop> beats silence
        if (!this.music) {
          this.music = new Audio('/music/partyfever-loop.mp3')
          this.music.loop = true
          this.music.volume = 0.5
          this.music.muted = this.muted
        }
        void this.music.play().catch(() => { /* needs a gesture */ })
      })
      .finally(() => { this.loadingBuf = false })
  }

  private playBuffer() {
    if (!this.ctx || !this.musicBus || !this.musicBuf) return
    this.musicSrc?.stop()
    const src = this.ctx.createBufferSource()
    src.buffer = this.musicBuf
    src.loop = true // sample-accurate, no seam
    src.connect(this.musicBus)
    src.start()
    this.musicSrc = src
  }

  stopMusic() {
    this.musicOn = false
    this.musicSrc?.stop()
    this.musicSrc = undefined
    this.music?.pause()
  }

  // Wire this once per TV page: starts the music on the very first tap,
  // click, or key press anywhere (browsers refuse audio before a gesture).
  armAutostart() {
    const go = () => {
      this.init()
      if (!this.isMuted()) this.startMusic()
      window.removeEventListener('pointerdown', go)
      window.removeEventListener('keydown', go)
    }
    window.addEventListener('pointerdown', go)
    window.addEventListener('keydown', go)
    return () => { window.removeEventListener('pointerdown', go); window.removeEventListener('keydown', go) }
  }

  // SFX 1 — correct guess: bright ascending arpeggio.
  correct() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone(f, t + i * 0.08, 0.18, { type: 'triangle', gain: 0.35 }),
    )
  }

  // SFX 2 — round start: quick rising "whoosh" cue.
  roundStart() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.tone(392, t, 0.12, { type: 'sine', gain: 0.25 })
    this.tone(587.33, t + 0.1, 0.16, { type: 'sine', gain: 0.3 })
  }

  // SFX 3 — nightfall: low ominous swell (Werewolf).
  night() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.tone(110, t, 0.9, { type: 'sine', gain: 0.28 })
    this.tone(146.83, t + 0.05, 0.8, { type: 'sine', gain: 0.18 })
  }

  // SFX 4 — elimination / reveal sting (Werewolf).
  eliminate() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.tone(330, t, 0.18, { type: 'sawtooth', gain: 0.25 })
    this.tone(220, t + 0.12, 0.3, { type: 'sawtooth', gain: 0.22 })
    this.tone(155.56, t + 0.26, 0.5, { type: 'sine', gain: 0.2 })
  }
}

export const sound = new SoundManager()
