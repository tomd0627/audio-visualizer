import { Sparkle, X } from '@phosphor-icons/react'
import { useDropzone } from 'react-dropzone'
import { PlaybackControls } from '../components/playback/PlaybackControls'
import { SeekBar } from '../components/playback/SeekBar'
import { VolumeSlider } from '../components/playback/VolumeSlider'
import { SearchBar } from '../components/search/SearchBar'
import { GlassPanel } from '../components/ui/GlassPanel'
import { SensitivitySlider } from '../components/ui/SensitivitySlider'
import { TrackHistoryPanel, HistoryButton } from '../components/ui/TrackHistoryPanel'
import { TrackInfo } from '../components/ui/TrackInfo'
import { VisualizerModeSelector } from '../components/ui/VisualizerModeSelector'
import { VisualizerCanvas } from '../components/visualizer/VisualizerCanvas'
import { useAudioEngine } from '../hooks/useAudioEngine'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useAppStore } from '../store/useAppStore'

export function MainPage() {
  const { currentTrack, audioStarted, setAudioStarted } = useAppStore()
  const { loadFile, unload } = useAudioEngine()
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
      <input {...getInputProps()} />

      {/* Layer 0: Full-screen canvas */}
      <VisualizerCanvas />

      {/* Drag overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 border-2 border-dashed border-[#ff6b00] pointer-events-none">
          <p className="text-[#ff6b00] text-2xl font-semibold">Drop to load track</p>
        </div>
      )}

      {/* Audio context gate */}
      {!audioStarted && !currentTrack && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            <div className="mb-6 flex justify-center">
              <Sparkle size={64} weight="duotone" className="text-[#ff6b00]" />
            </div>
            <p className="text-[#ff6b00] text-3xl font-semibold mb-2">Resonance</p>
            <p className="text-white/50 text-sm mb-8">Drop a track or search to watch your music come alive</p>
            <label className="cursor-pointer px-6 py-3 rounded-xl bg-[#ff6b00]/20 hover:bg-[#ff6b00]/30 text-[#ff6b00] border border-[#ff6b00]/30 transition-colors text-sm font-medium">
              Browse Files
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
          </div>
        </div>
      )}

      {/* Search bar — own stacking context above gate (z-20) */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg">
          <SearchBar />
        </div>
      </div>

      {/* Layer 10: UI */}
      <div className="fixed inset-0 z-10 pointer-events-none flex flex-col">
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

          {/* Visualizer mode selector */}
          <GlassPanel className="px-3 py-2">
            <VisualizerModeSelector />
          </GlassPanel>
        </div>
      </div>

      {/* Track history slide-in */}
      <TrackHistoryPanel />
    </div>
  )
}
