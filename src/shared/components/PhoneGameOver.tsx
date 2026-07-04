import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdSlot from './AdSlot'
import Wordmark from './Wordmark'
import { CrownIcon, MedalIcon } from './icons'
import { PAL, type Player } from '../lib/types'

// Phone end-of-game sequence: full-page ad -> leaderboard -> Finish -> home.
export default function PhoneGameOver({ players, meId }: { players: Player[]; meId: string }) {
  const [step, setStep] = useState<'ad' | 'board'>('ad')
  const navigate = useNavigate()
  const ranked = [...players].sort((a, b) => b.score - a.score)
  const myRank = ranked.findIndex((p) => p.id === meId)

  if (step === 'ad') {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-ink">
        <div className="flex flex-1 flex-col items-center justify-center px-5">
          <AdSlot size="interstitial" className="w-full" />
        </div>
        <div className="px-5 pb-8 pt-3">
          <button
            onClick={() => setStep('board')}
            className="w-full rounded-card px-6 py-4 text-lg font-bold text-grape-900"
            style={{ background: 'linear-gradient(95deg,#06b6d4,#84cc16)' }}
          >Continue</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink px-6 pb-8 pt-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="flex flex-col items-center text-center">
          <Wordmark size="sm" />
          <h1 className="pf-wordmark mt-5 text-4xl text-p-lime">Final scores</h1>
          {myRank >= 0 && (
            <p className="mt-2 text-lg text-white/70">
              You finished <b className="text-white">{ordinal(myRank + 1)}</b>
            </p>
          )}
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          {ranked.map((p, i) => (
            <div
              key={p.id}
              className="pf-glass flex items-center gap-3 rounded-card px-4 py-3"
              style={{
                outline: p.id === meId ? `2px solid ${PAL[p.color]}` : i === 0 ? '2px solid rgba(251,191,36,.55)' : undefined,
                background: i === 0 ? 'linear-gradient(90deg, rgba(251,191,36,.10), rgba(255,255,255,.06))' : undefined,
              }}
            >
              <span className="grid w-8 place-items-center">
                {i === 0 ? <CrownIcon size={24} /> : i < 3 ? <MedalIcon rank={i as 1 | 2} size={22} /> : <span className="pf-wordmark text-lg text-white/40">{i + 1}</span>}
              </span>
              <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: PAL[p.color] }} />
              <span className="min-w-0 flex-1 truncate text-lg font-semibold">{p.name}{p.id === meId && <span className="text-white/45"> (you)</span>}</span>
              <span className="pf-wordmark text-2xl text-cyan">{p.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/phone')}
          className="mt-8 w-full rounded-card px-6 py-4 text-lg font-bold text-grape-900"
          style={{ background: 'linear-gradient(95deg,#06b6d4,#84cc16)' }}
        >Finish</button>
        <p className="mt-3 text-center text-sm text-white/45">Scan the TV's QR from home to play the next game.</p>
      </div>
    </div>
  )
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
