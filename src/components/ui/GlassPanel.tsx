import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function GlassPanel({ children, className = '' }: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/20 bg-gray-900/75 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  )
}
