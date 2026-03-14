import { SpeakerHigh, SpeakerLow, SpeakerSlash } from '@phosphor-icons/react'
import { useRef } from 'react'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useAppStore } from '../../store/useAppStore'

export function VolumeSlider() {
  const { volume, isMuted } = useAppStore()
  const { changeVolume, toggleMute } = useAudioEngine()
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const displayValue = isMuted ? 0 : volume
  const pct = displayValue * 100

  const calcValue = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return displayValue
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  const applyValue = (clientX: number) => {
    const v = calcValue(clientX)
    changeVolume(v)
    if (isMuted) toggleMute()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        aria-pressed={isMuted}
        className="text-white/70 hover:text-white hover:scale-110 transition-all duration-150"
        title="Toggle mute (M)"
      >
        {isMuted || volume === 0
          ? <SpeakerSlash size={16} weight="fill" />
          : volume < 0.5
            ? <SpeakerLow size={16} weight="fill" />
            : <SpeakerHigh size={16} weight="fill" />
        }
      </button>
      <div
        ref={containerRef}
        className="relative w-20 h-8 flex items-center cursor-pointer"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          applyValue(e.clientX)
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return
          applyValue(e.clientX)
        }}
        onPointerUp={() => { dragging.current = false }}
        onPointerCancel={() => { dragging.current = false }}
      >
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/20" />
        <div
          className="absolute left-0 h-1 rounded-full"
          style={{ width: `${pct}%`, background: 'var(--theme-primary)' }}
        />
        <div
          className="absolute w-3 h-3 rounded-full -translate-x-1/2"
          style={{ left: `${pct}%`, background: 'var(--theme-primary)', boxShadow: '0 0 6px var(--theme-primary)' }}
        />
        {/* Keyboard-only input — pointer events handled by the container above */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={displayValue}
          onChange={(e) => {
            changeVolume(parseFloat(e.target.value))
            if (isMuted) toggleMute()
          }}
          aria-label="Volume"
          aria-valuetext={`${Math.round(displayValue * 100)}%`}
          className="sr-only"
        />
      </div>
    </div>
  )
}
