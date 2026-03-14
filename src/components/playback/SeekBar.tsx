import { useAppStore } from '../../store/useAppStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { formatDuration } from '../../utils/format'

export function SeekBar() {
  const { currentTime, duration } = useAppStore()
  const { seek } = useAudioEngine()

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-white/70 text-xs w-10 text-right tabular-nums">
        {formatDuration(currentTime)}
      </span>
      <div className="relative flex-1 h-5 flex items-center group">
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/25" />
        <div
          className="absolute inset-y-0 left-0 my-auto h-1 rounded-full bg-[#ff6b00] transition-none"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          aria-label="Seek"
          aria-valuetext={`${formatDuration(currentTime)} of ${formatDuration(duration)}`}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>
      <span className="text-white/70 text-xs w-10 tabular-nums">
        {formatDuration(duration)}
      </span>
    </div>
  )
}
