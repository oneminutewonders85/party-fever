import type { ReactNode } from 'react'

// The shared Party Fever backdrop (deep-purple wash + glow). Wraps every screen.
export default function Stage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`pf-stage ${className}`}>{children}</div>
}
