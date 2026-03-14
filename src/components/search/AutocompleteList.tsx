import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { trackResultToTrackInfo, type TrackResult } from '../../music/search'
import { formatDuration } from '../../utils/format'

interface Props {
  results: TrackResult[]
  loading: boolean
  error: string | null
  onClose: () => void
}

export function AutocompleteList({ results, loading, error, onClose }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const { loadPreview } = useAudioEngine()
  const listRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback((result: TrackResult) => {
    void loadPreview(trackResultToTrackInfo(result))
    onClose()
  }, [loadPreview, onClose])

  // biome-ignore lint/correctness/useExhaustiveDependencies: results is the trigger, not a value used inside
  useEffect(() => {
    setSelectedIdx(-1)
  }, [results])

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!results.length) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && selectedIdx >= 0) {
        e.preventDefault()
        const result = results[selectedIdx]
        if (result) handleSelect(result)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [results, selectedIdx, onClose, handleSelect])

  if (!loading && !error && results.length === 0) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50">
      <div className="rounded-xl border border-[#ff6b00]/30 bg-black/80 backdrop-blur-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(255,107,0,0.08)]">
        {loading && (
          <div className="px-4 py-3 text-white/50 text-sm">Searching...</div>
        )}
        {error && (
          <div className="px-4 py-3 text-red-400 text-sm">{error}</div>
        )}
        {!loading && !error && (
          <div id="track-search-listbox" role="listbox" aria-label="Search results" ref={listRef} className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {results.map((result, i) => (
              <div key={result.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === selectedIdx}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                    ${i === selectedIdx ? 'bg-[#ff6b00]/15' : 'hover:bg-white/5'}
                  `}
                >
                  {result.artworkUrl ? (
                    <img
                      src={result.artworkUrl}
                      alt={result.album}
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white/10 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{result.name}</p>
                    <p className="text-white/60 text-xs truncate">{result.artists}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!result.previewUrl && (
                      <span className="text-white/35 text-xs">no preview</span>
                    )}
                    <span className="text-white/50 text-xs tabular-nums">
                      {formatDuration(result.durationMs / 1000)}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
