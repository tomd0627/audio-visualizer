import { Sparkle, UploadSimple, X } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { PlaybackControls } from '../components/playback/PlaybackControls'
import { SeekBar } from '../components/playback/SeekBar'
import { VolumeSlider } from '../components/playback/VolumeSlider'
import { SearchBar } from '../components/search/SearchBar'
import { GlassPanel } from '../components/ui/GlassPanel'
import { SensitivitySlider } from '../components/ui/SensitivitySlider'
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher'
import { HistoryButton, TrackHistoryPanel } from '../components/ui/TrackHistoryPanel'
import { TrackInfo } from '../components/ui/TrackInfo'
import { VisualizerModeSelector } from '../components/ui/VisualizerModeSelector'
import { VisualizerCanvas } from '../components/visualizer/VisualizerCanvas'
import { useAudioEngine } from '../hooks/useAudioEngine'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useAppStore } from '../store/useAppStore'

function Announcer() {
  const { currentTrack, isPlaying } = useAppStore()
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (currentTrack) setMsg(`Now playing: ${currentTrack.title} by ${currentTrack.artist}`)
  }, [currentTrack])

  useEffect(() => {
    if (currentTrack) setMsg(isPlaying ? 'Playing' : 'Paused')
  }, [isPlaying, currentTrack])

  return <output aria-live="polite" aria-atomic="true" className="sr-only">{msg}</output>
}

export function MainPage() {
  const { currentTrack, audioStarted, setAudioStarted } = useAppStore()
  const { loadFile, loadDemoTrack, unload } = useAudioEngine()
  const [showTechNote, setShowTechNote] = useState(false)
  useKeyboardShortcuts()

  // Global drop zone (when a track is already loaded, support drag-to-replace)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      const f = files[0]
      if (f) { setAudioStarted(true); void loadFile(f) }
    },
    accept: { 'audio/*': [] },
    multiple: false,
    noClick: true, // don't open file picker on click; the empty state handles that
  })

  return (
    <div {...getRootProps()} className="fixed inset-0 overflow-hidden bg-black">
      <input {...getInputProps()} aria-label="Drop zone for audio files" />

      {/* Layer 0: Full-screen canvas */}
      <VisualizerCanvas />

      {/* Drag overlay */}
      {isDragActive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 border-2 border-dashed pointer-events-none"
          style={{ borderColor: 'var(--theme-primary)' }}
        >
          <p className="text-2xl font-semibold theme-text">Drop to load track</p>
        </div>
      )}

      {/* Audio context gate */}
      {!audioStarted && !currentTrack && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto flex flex-col items-center">
            <div className="mb-4 flex justify-center">
              <Sparkle size={48} weight="duotone" className="theme-text" />
            </div>
            <p className="text-3xl font-semibold mb-1 theme-text">Resonance</p>
            <p className="text-white/40 text-sm mb-8">Search for a track above, or load a local file below</p>
            <label className="group cursor-pointer flex flex-col items-center gap-3 px-12 py-8 rounded-2xl border-2 border-dashed transition-all duration-200 theme-browse-btn" style={{ borderStyle: 'dashed' }}>
              <UploadSimple size={36} weight="duotone" className="theme-icon transition-colors duration-200" />
              <div>
                <p className="text-sm font-semibold theme-text">Drag &amp; drop an audio file</p>
                <p className="text-white/40 text-xs mt-0.5 text-center">or click to browse — MP3, WAV, FLAC, OGG</p>
              </div>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setAudioStarted(true); void loadFile(f) }
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => { setAudioStarted(true); void loadDemoTrack() }}
              className="mt-4 px-5 py-2 rounded-full text-sm font-semibold theme-text border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-all"
            >
              Try Demo →
            </button>
          </div>
        </div>
      )}

      {/* Search bar — own stacking context above gate (z-20) */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg">
          <SearchBar />
        </div>
      </div>

      {/* Layer z-[25]: UI controls — above empty state gate (z-20), below search bar (z-30) */}
      <div className="fixed inset-0 z-[25] pointer-events-none flex flex-col">
        {/* Top bar spacer (SearchBar is now in its own layer above) */}
        <div className="h-16" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom controls */}
        <div className="p-4 flex flex-col items-center gap-3 pointer-events-auto">
          {currentTrack && (
            <div className="relative w-full max-w-2xl">
              <button
                type="button"
                onClick={unload}
                title="Close player"
                aria-label="Close player"
                className="absolute -top-2.5 -right-2.5 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-900/90 border border-white/20 text-white/50 hover:text-white hover:border-white/50 transition-all"
              >
                <X size={10} />
              </button>
            <GlassPanel className="w-full px-4 py-3 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <TrackInfo />
                <HistoryButton />
              </div>
              <SeekBar />
              <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3">
                <div className="order-2 sm:order-1"><VolumeSlider /></div>
                <div className="order-1 sm:order-2"><PlaybackControls /></div>
                <div className="order-3"><SensitivitySlider /></div>
              </div>
            </GlassPanel>
            </div>
          )}

          {/* Tech note (collapsible) */}
          {showTechNote && (
            <GlassPanel className="w-full max-w-2xl px-5 py-4 text-sm text-white/70 leading-relaxed">
              <p className="font-semibold theme-text mb-1">How it works</p>
              <p>
                Resonance uses the Web Audio API&apos;s <code className="text-white/90">AnalyserNode</code> to
                run a real-time Fast Fourier Transform (FFT) on the audio signal, producing 1024 frequency
                bins spanning ~20 Hz to 20 kHz. Bins are grouped into bass (0–250 Hz), mid (250–4 kHz), and
                treble (4–20 kHz) bands. Each visualizer mode maps these bands differently: Bars and Tunnel
                use logarithmic bin scaling so bass frequencies get more visual weight; Particles spawn on
                bass transients above an energy threshold; Aurora shifts hue continuously based on the
                dominant band energy; Oscilloscope and Circle draw the raw time-domain waveform rather than
                frequency data.
              </p>
            </GlassPanel>
          )}

          {/* Visualizer mode selector + theme switcher + tech note toggle */}
          <div className="flex items-center gap-2">
            <GlassPanel className="px-3 py-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <VisualizerModeSelector />
              <div className="sm:hidden w-full h-px bg-white/20" />
              <div className="hidden sm:block w-px h-4 bg-white/20 flex-shrink-0" />
              <ThemeSwitcher />
            </GlassPanel>
            <button
              type="button"
              onClick={() => setShowTechNote(v => !v)}
              title="How it works"
              aria-label="Toggle technical explanation"
              aria-expanded={showTechNote}
              className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border border-white/20 hover:border-white/50 bg-gray-900/90 hover:bg-gray-800 theme-text transition-all flex-shrink-0"
            >
              ?
            </button>
          </div>
        </div>
      </div>

      {/* Track history slide-in */}
      <TrackHistoryPanel />

      {/* Screen reader announcements */}
      <Announcer />
    </div>
  )
}
