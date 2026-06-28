// The PARTY FEVER wordmark. `size` controls scale; used big on TV, small on phone.
export default function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'lg' ? 'text-6xl md:text-8xl' : size === 'sm' ? 'text-2xl' : 'text-4xl'
  return (
    <div className={`pf-wordmark ${scale} select-none`}>
      <span className="block text-white">PARTY</span>
      <span
        className="block"
        style={{
          background: 'linear-gradient(92deg,#06b6d4,#84cc16 50%,#fbbf24 75%,#ec4899)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        FEVER
      </span>
    </div>
  )
}
