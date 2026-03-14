import { ClockCounterClockwise, MusicNote, X } from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'
import type { TrackInfo } from '../../audio/types'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useAppStore } from '../../store/useAppStore'

export function TrackHistoryPanel() {
  const { showHistory, toggleHistory, history } = useAppStore()
  const { loadPreview } = useAudioEngine()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (showHistory) {
      prevFocusRef.current = document.activeElement as HTMLElement
      closeBtnRef.current?.focus()
    } else {
      prevFocusRef.current?.focus()
      prevFocusRef.current = null
    }
  }, [showHistory])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { toggleHistory(); return }
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }

  const handleSelect = (track: TrackInfo) => {
    if (track.sourceType === 'preview' && track.previewUrl) {
      void loadPreview(track)
      toggleHistory()
    }
  }

  return (
    <>
      {/* Overlay to close */}
      {showHistory && (
        <button
          type="button"
          aria-label="Close history"
          className="fixed inset-0 z-30 w-full h-full cursor-default"
          onClick={toggleHistory}
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Recent Tracks"
        aria-modal="true"
        aria-hidden={!showHistory}
        onKeyDown={handleKeyDown}
        className={`
          fixed top-0 right-0 h-full w-72 z-40
          border-l border-white/10 bg-black/80 backdrop-blur-xl
          transform transition-transform duration-300
          ${showHistory ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-sm">Recent Tracks</h2>
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Close history panel"
            onClick={toggleHistory}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {history.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No tracks played yet</p>
          ) : (
            <ul>
              {history.map((track) => (
                <li key={`${track.id}-${track.playedAt}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(track)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    {track.artworkUrl ? (
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                        <MusicNote size={16} className="text-white/40" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm truncate">{track.title}</p>
                      <p className="text-white/40 text-xs truncate">{track.artist}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        track.sourceType === 'file'
                          ? 'bg-white/10 text-white/40'
                          : 'theme-badge'
                      }`}>
                        {track.sourceType === 'file' ? 'file' : '30s'}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white/20 text-xs text-center">Press H to toggle</p>
        </div>
      </div>
    </>
  )
}

export function HistoryButton() {
  const { toggleHistory, history } = useAppStore()
  return (
    <button
      type="button"
      onClick={toggleHistory}
      title="Track history (H)"
      aria-label={`Track history (${history.length} track${history.length === 1 ? '' : 's'})`}
      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-white/40 hover:text-white/70 border border-transparent hover:border-white/20 transition-all"
    >
      <ClockCounterClockwise size={13} />
      <span aria-hidden="true">{history.length}</span>
    </button>
  )
}
