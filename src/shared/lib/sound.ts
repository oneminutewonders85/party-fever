// Party Fever audio — synthesized with the Web Audio API (no files, no
// licensing). One looping background bed + two SFX. To swap in a real licensed
// track later, replace startMusic() with an <audio loop> and keep the SFX.

type Maybe<T> = T | undefined

class SoundManager {
  private ctx: Maybe<AudioContext>
  private master: Maybe<GainNode>
  private musicBus: Maybe<GainNode>
  private musicOn = false
  private timer = 0
  private bar = 0
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

  private hat(start: number) {
    if (!this.ctx || !this.musicBus) return
    const buf = this.ctx.createBuffer(1, 1024, this.ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7000
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.06, start)
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.05)
    src.connect(hp)
    hp.connect(g)
    g.connect(this.musicBus)
    src.start(start)
    src.stop(start + 0.06)
  }

  // I – V – vi – IV in C, as gentle arpeggios + bass + hats.
  private static CHORDS: number[][] = [
    [261.63, 329.63, 392.0, 523.25], // C
    [196.0, 246.94, 293.66, 392.0], // G
    [220.0, 261.63, 329.63, 440.0], // Am
    [174.61, 220.0, 261.63, 349.23], // F
  ]
  private static ARP = [0, 1, 2, 3, 2, 1, 2, 3]

  private scheduleBar(at: number, chordIdx: number) {
    const bpm = 100
    const beat = 60 / bpm
    const eighth = beat / 2
    const chord = SoundManager.CHORDS[chordIdx]
    // bass
    this.tone(chord[0] / 2, at, beat * 3.6, { type: 'sine', gain: 0.22, bus: this.musicBus })
    // arpeggio
    SoundManager.ARP.forEach((n, i) => {
      this.tone(chord[n], at + i * eighth, eighth * 1.3, { type: 'triangle', gain: 0.12, bus: this.musicBus })
    })
    // hats on the off-beats for a light groove
    for (let i = 0; i < 4; i++) this.hat(at + i * beat + eighth)
  }

  startMusic() {
    if (!this.ctx || this.musicOn) return
    this.musicOn = true
    const bpm = 100
    const barLen = (60 / bpm) * 4
    const loop = () => {
      if (!this.ctx || !this.musicOn) return
      const at = this.ctx.currentTime + 0.05
      this.scheduleBar(at, this.bar % SoundManager.CHORDS.length)
      this.bar++
      this.timer = window.setTimeout(loop, barLen * 1000)
    }
    loop()
  }
  stopMusic() {
    this.musicOn = false
    window.clearTimeout(this.timer)
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
}

export const sound = new SoundManager()
