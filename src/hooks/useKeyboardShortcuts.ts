import { useEffect } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { visualizerEngine } from '../visualizer/VisualizerEngine'
import { useAppStore } from '../store/useAppStore'
import type { VisualizerMode } from '../audio/types'

const MODES: VisualizerMode[] = ['bars', 'circular', 'oscilloscope', 'particles', 'tunnel', 'aurora']

export function useKeyboardShortcuts() {
  const { setIsPlaying, setCurrentTime, setVolume, setIsMuted, setVisualizerMode, toggleHistory } = useAppStore()

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      // Don't fire when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const source = audioEngine.getSource()

      switch (e.code) {
        case 'Space': {
          e.preventDefault()
          if (!source) return
          if (source.isPlaying()) {
            source.pause()
            setIsPlaying(false)
          } else {
            void source.play().then(() => setIsPlaying(true))
          }
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          const t = Math.max(0, (source?.getCurrentTime() ?? 0) - 10)
          source?.seek(t)
          setCurrentTime(t)
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          const dur = source?.getDuration() ?? 0
          const t2 = Math.min(dur, (source?.getCurrentTime() ?? 0) + 10)
          source?.seek(t2)
          setCurrentTime(t2)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const newVol = Math.min(1, audioEngine.getVolume() + 0.1)
          audioEngine.setVolume(newVol)
          setVolume(newVol)
          break
        }
        case 'ArrowDown': {
          e.preventDefault()
          const newVol2 = Math.max(0, audioEngine.getVolume() - 0.1)
          audioEngine.setVolume(newVol2)
          setVolume(newVol2)
          break
        }
        case 'KeyM': {
          const muted = audioEngine.toggleMute()
          setIsMuted(muted)
          break
        }
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6': {
          const idx = parseInt(e.code.replace('Digit', '')) - 1
          const mode = MODES[idx]
          if (mode) {
            visualizerEngine.setMode(mode)
            setVisualizerMode(mode)
          }
          break
        }
        case 'KeyF': {
          if (!document.fullscreenElement) {
            void document.documentElement.requestFullscreen()
          } else {
            void document.exitFullscreen()
          }
          break
        }
        case 'KeyH': {
          toggleHistory()
          break
        }
      }
    }

    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [setIsPlaying, setCurrentTime, setVolume, setIsMuted, setVisualizerMode, toggleHistory])
}
