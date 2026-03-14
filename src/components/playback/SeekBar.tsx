import { useRef, useState } from 'react'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useAppStore } from '../../store/useAppStore'
import { formatDuration } from '../../utils/format'

export function SeekBar() {
  const { currentTime, duration } = useAppStore()
  const { seek } = useAudioEngine()
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const [localTime, setLocalTime] = useState<number | null>(null)

  const displayTime = localTime ?? currentTime
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0

  const calcValue = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return displayTime
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return pct * (duration || 1)
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-white/70 text-xs w-10 text-right tabular-nums">
        {formatDuration(displayTime)}
      </span>
      <div
        ref={containerRef}
        className="relative flex-1 h-8 flex items-center group cursor-pointer"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          isDragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          setLocalTime(calcValue(e.clientX))
        }}
        onPointerMove={(e) => {
          if (!isDragging.current) return
          setLocalTime(calcValue(e.clientX))
        }}
        onPointerUp={(e) => {
          if (!isDragging.current) return
          isDragging.current = false
          const v = calcValue(e.clientX)
          seek(v)
          setLocalTime(null)
        }}
        onPointerCancel={() => {
          isDragging.current = false
          setLocalTime(null)
        }}
      >
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/25" />
        <div
          className="absolute inset-y-0 left-0 my-auto h-1 rounded-full transition-none"
          style={{ width: `${progress}%`, background: 'var(--theme-primary)' }}
        />
        <div
          className="absolute w-3 h-3 rounded-full -translate-x-1/2"
          style={{ left: `${progress}%`, background: 'var(--theme-primary)', boxShadow: '0 0 6px var(--theme-primary)' }}
        />
        {/* Keyboard-only input — pointer events handled by the container above */}
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={displayTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          aria-label="Seek"
          aria-valuetext={`${formatDuration(displayTime)} of ${formatDuration(duration)}`}
          className="sr-only"
        />
      </div>
      <span className="text-white/70 text-xs w-10 tabular-nums">
        {formatDuration(duration)}
      </span>
    </div>
  )
}
