import type { VisualizerMode } from '../../audio/types'
import { useAppStore } from '../../store/useAppStore'
import { visualizerEngine } from '../../visualizer/VisualizerEngine'

const MODES: { mode: VisualizerMode; label: string; key: string }[] = [
  { mode: 'bars', label: 'Bars', key: '1' },
  { mode: 'circular', label: 'Circle', key: '2' },
  { mode: 'oscilloscope', label: 'Wave', key: '3' },
  { mode: 'particles', label: 'Particles', key: '4' },
  { mode: 'tunnel', label: 'Tunnel', key: '5' },
  { mode: 'aurora', label: 'Aurora', key: '6' },
]

export function VisualizerModeSelector() {
  const { visualizerMode, setVisualizerMode } = useAppStore()

  const select = (mode: VisualizerMode) => {
    visualizerEngine.setMode(mode)
    setVisualizerMode(mode)
  }

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {MODES.map(({ mode, label, key }) => (
        <button
          type="button"
          key={mode}
          onClick={() => select(mode)}
          title={`${label} (${key})`}
          className={`
            px-2 py-1 rounded text-xs font-medium transition-all duration-150
            ${visualizerMode === mode
              ? 'border theme-mode-active'
              : 'text-white/60 hover:text-white border border-transparent hover:border-white/30'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
