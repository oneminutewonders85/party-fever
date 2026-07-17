import { SpeakerOffIcon, SpeakerOnIcon } from './icons'
import { useState } from 'react'
import { sound } from '../lib/sound'

// Small speaker toggle. Tapping it also counts as the user gesture that unlocks
// audio, so pressing unmute will start the music even on a fresh page load.
export default function SoundToggle({ className = '' }: { className?: string }) {
  const [muted, setMuted] = useState(sound.isMuted())
  function toggle() {
    sound.init()
    const next = !muted
    sound.setMuted(next)
    if (!next) sound.startMusic()
    setMuted(next)
  }
  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Unmute' : 'Mute'}
      className={`pf-glass rounded-full px-3 py-2 text-lg leading-none ${className}`}
    >
      {muted ? <SpeakerOffIcon size={22} /> : <SpeakerOnIcon size={22} />}
    </button>
  )
}
