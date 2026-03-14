import { create } from 'zustand'
import type { TrackInfo, VisualizerMode } from '../audio/types'
import { applyThemeToDom, THEMES, type ThemeId } from '../themes/themes'

interface HistoryEntry extends TrackInfo {
  playedAt: number
}

interface AppState {
  // Current track
  currentTrack: TrackInfo | null
  setCurrentTrack: (track: TrackInfo | null) => void

  // Playback
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  currentTime: number
  setCurrentTime: (t: number) => void
  duration: number
  setDuration: (d: number) => void
  volume: number
  setVolume: (v: number) => void
  isMuted: boolean
  setIsMuted: (m: boolean) => void

  // Visualizer
  visualizerMode: VisualizerMode
  setVisualizerMode: (mode: VisualizerMode) => void
  sensitivity: number
  setSensitivity: (s: number) => void

  // Theme
  theme: ThemeId
  setTheme: (id: ThemeId) => void

  // UI
  showHistory: boolean
  toggleHistory: () => void

  // Track history
  history: HistoryEntry[]
  addToHistory: (track: TrackInfo) => void

  // Audio context started
  audioStarted: boolean
  setAudioStarted: (v: boolean) => void
}

const MAX_HISTORY = 10

function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let id: ReturnType<typeof setTimeout>
  return (...args: T) => { clearTimeout(id); id = setTimeout(() => { fn(...args) }, ms) }
}
const saveVolume = debounce((v: number) => { localStorage.setItem('volume', String(v)) }, 400)
const saveSensitivity = debounce((s: number) => { localStorage.setItem('sensitivity', String(s)) }, 400)

const savedTheme = (localStorage.getItem('theme') ?? 'solar') as ThemeId
const savedVolume = parseFloat(localStorage.getItem('volume') ?? '0.8')
const savedSensitivity = parseFloat(localStorage.getItem('sensitivity') ?? '1.0')
// Apply initial theme to DOM immediately (before React renders)
applyThemeToDom(THEMES[savedTheme] ?? THEMES.solar)

export const useAppStore = create<AppState>((set) => ({
  currentTrack: null,
  setCurrentTrack: (track) => set({ currentTrack: track }),

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  currentTime: 0,
  setCurrentTime: (t) => set({ currentTime: t }),
  duration: 0,
  setDuration: (d) => set({ duration: d }),
  volume: savedVolume,
  setVolume: (v) => { saveVolume(v); set({ volume: v }) },
  isMuted: false,
  setIsMuted: (m) => set({ isMuted: m }),

  visualizerMode: 'bars',
  setVisualizerMode: (mode) => set({ visualizerMode: mode }),
  sensitivity: savedSensitivity,
  setSensitivity: (s) => { saveSensitivity(s); set({ sensitivity: s }) },

  theme: savedTheme,
  setTheme: (id) => {
    const t = THEMES[id] ?? THEMES.solar
    applyThemeToDom(t)
    localStorage.setItem('theme', id)
    set({ theme: id })
  },

  showHistory: false,
  toggleHistory: () => set((s) => ({ showHistory: !s.showHistory })),

  history: JSON.parse(localStorage.getItem('track_history') ?? '[]') as HistoryEntry[],
  addToHistory: (track) => {
    set((s) => {
      const prev = s.history.filter((h) => h.id !== track.id)
      const next = [{ ...track, playedAt: Date.now() }, ...prev].slice(0, MAX_HISTORY)
      localStorage.setItem('track_history', JSON.stringify(next))
      return { history: next }
    })
  },

  audioStarted: false,
  setAudioStarted: (v) => set({ audioStarted: v }),
}))
