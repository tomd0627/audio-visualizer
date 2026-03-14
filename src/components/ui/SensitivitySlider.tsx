import { useAppStore } from '../../store/useAppStore'
import { visualizerEngine } from '../../visualizer/VisualizerEngine'

const MIN = 0.1
const MAX = 3

export function SensitivitySlider() {
  const { sensitivity, setSensitivity } = useAppStore()

  const onChange = (v: number) => {
    visualizerEngine.setSensitivity(v)
    setSensitivity(v)
  }

  const pct = ((sensitivity - MIN) / (MAX - MIN)) * 100

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-white/55 text-xs group-hover:text-white/80 transition-colors">Sensitivity</span>
      <div className="relative w-20 h-4 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/20" />
        <div
          className="absolute left-0 h-1 rounded-full bg-[#ffe566] opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-[#ffe566] shadow-[0_0_6px_#ffe566] -translate-x-1/2 opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={0.05}
          value={sensitivity}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label="Visualizer sensitivity"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}
