import { create } from 'zustand'
import type { TrackInfo, VisualizerMode } from '../audio/types'

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

export const useAppStore = create<AppState>((set, get) => ({
  currentTrack: null,
  setCurrentTrack: (track) => set({ currentTrack: track }),

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  currentTime: 0,
  setCurrentTime: (t) => set({ currentTime: t }),
  duration: 0,
  setDuration: (d) => set({ duration: d }),
  volume: 1,
  setVolume: (v) => set({ volume: v }),
  isMuted: false,
  setIsMuted: (m) => set({ isMuted: m }),

  visualizerMode: 'bars',
  setVisualizerMode: (mode) => set({ visualizerMode: mode }),
  sensitivity: 1.0,
  setSensitivity: (s) => set({ sensitivity: s }),

  showHistory: false,
  toggleHistory: () => set((s) => ({ showHistory: !s.showHistory })),

  history: JSON.parse(localStorage.getItem('track_history') ?? '[]') as HistoryEntry[],
  addToHistory: (track) => {
    const prev = get().history.filter((h) => h.id !== track.id)
    const next = [{ ...track, playedAt: Date.now() }, ...prev].slice(0, MAX_HISTORY)
    localStorage.setItem('track_history', JSON.stringify(next))
    set({ history: next })
  },

  audioStarted: false,
  setAudioStarted: (v) => set({ audioStarted: v }),
}))
