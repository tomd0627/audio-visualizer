import { THEMES, type ThemeId } from '../../themes/themes'
import { useAppStore } from '../../store/useAppStore'
import { visualizerEngine } from '../../visualizer/VisualizerEngine'

const THEME_ORDER: ThemeId[] = ['solar', 'aurora', 'neon', 'forest', 'glacier']

export function ThemeSwitcher() {
  const { theme, setTheme } = useAppStore()

  const select = (id: ThemeId) => {
    setTheme(id)
    visualizerEngine.setCanvasTheme(THEMES[id].canvas)
  }

  return (
    <div className="flex items-center gap-2">
      {THEME_ORDER.map((id) => {
        const t = THEMES[id]
        return (
          <button
            key={id}
            type="button"
            title={t.name}
            aria-label={t.name}
            onClick={() => select(id)}
            className="p-2 flex items-center justify-center"
          >
            <span
              className={`block w-5 h-5 rounded-full border-2 transition-all duration-150 ${
                theme === id ? 'border-white scale-125' : 'border-transparent hover:scale-110 hover:border-white/50'
              }`}
              style={{ background: t.primary }}
            />
          </button>
        )
      })}
    </div>
  )
}
