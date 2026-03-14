import { useRef } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { visualizerEngine } from '../../visualizer/VisualizerEngine'

const MIN = 0.1
const MAX = 3

export function SensitivitySlider() {
  const { sensitivity, setSensitivity } = useAppStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const commit = (v: number) => {
    const clamped = Math.max(MIN, Math.min(MAX, v))
    visualizerEngine.setSensitivity(clamped)
    setSensitivity(clamped)
  }

  const calcValue = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return sensitivity
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return MIN + pct * (MAX - MIN)
  }

  const pct = ((sensitivity - MIN) / (MAX - MIN)) * 100

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-white/55 text-xs group-hover:text-white/80 transition-colors">Sensitivity</span>
      <div
        ref={containerRef}
        className="relative w-20 h-8 flex items-center cursor-pointer"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          commit(calcValue(e.clientX))
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return
          commit(calcValue(e.clientX))
        }}
        onPointerUp={() => { dragging.current = false }}
        onPointerCancel={() => { dragging.current = false }}
      >
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/20" />
        <div
          className="absolute left-0 h-1 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ width: `${pct}%`, background: 'var(--theme-primary)' }}
        />
        <div
          className="absolute w-3 h-3 rounded-full -translate-x-1/2 opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ left: `${pct}%`, background: 'var(--theme-primary)', boxShadow: '0 0 6px var(--theme-primary)' }}
        />
        {/* Keyboard-only input — pointer events handled by the container above */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={0.05}
          value={sensitivity}
          onChange={(e) => commit(parseFloat(e.target.value))}
          aria-label="Visualizer sensitivity"
          aria-valuetext={`${sensitivity.toFixed(1)}×`}
          className="sr-only"
        />
      </div>
    </div>
  )
}
