import { SpeakerHigh, SpeakerLow, SpeakerSlash } from '@phosphor-icons/react'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useAppStore } from '../../store/useAppStore'

export function VolumeSlider() {
  const { volume, isMuted } = useAppStore()
  const { changeVolume, toggleMute } = useAudioEngine()

  const displayValue = isMuted ? 0 : volume
  const pct = displayValue * 100

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        aria-pressed={isMuted}
        className="text-white/70 hover:text-white hover:scale-110 transition-all duration-150"
        title="Toggle mute (M)"
      >
        {isMuted || volume === 0
          ? <SpeakerSlash size={16} weight="fill" />
          : volume < 0.5
            ? <SpeakerLow size={16} weight="fill" />
            : <SpeakerHigh size={16} weight="fill" />
        }
      </button>
      <div className="relative w-20 h-4 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/20" />
        <div
          className="absolute left-0 h-1 rounded-full bg-[#ff6b00]"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-[#ff6b00] shadow-[0_0_6px_#ff6b00] -translate-x-1/2"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={displayValue}
          onChange={(e) => {
            changeVolume(parseFloat(e.target.value))
            if (isMuted) toggleMute()
          }}
          aria-label="Volume"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}
