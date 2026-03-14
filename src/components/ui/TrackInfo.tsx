import { MusicNote } from '@phosphor-icons/react'
import { useAppStore } from '../../store/useAppStore'

export function TrackInfo() {
  const currentTrack = useAppStore((s) => s.currentTrack)
  if (!currentTrack) return null

  return (
    <div className="flex items-center gap-3">
      {currentTrack.artworkUrl ? (
        <img
          src={currentTrack.artworkUrl}
          alt={currentTrack.album ?? currentTrack.title}
          loading="lazy"
          decoding="async"
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <MusicNote size={20} className="text-white/40" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm truncate">{currentTrack.title}</p>
          {currentTrack.sourceType === 'preview' && (
            <span className="flex-shrink-0 text-xs border px-1.5 py-0.5 rounded text-[10px] theme-badge">
              30s
            </span>
          )}
        </div>
        <p className="text-white/65 text-xs truncate">{currentTrack.artist}</p>
      </div>
    </div>
  )
}
