import { Pause, Play, SkipBack, SkipForward, Stop } from '@phosphor-icons/react'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useAppStore } from '../../store/useAppStore'

interface ButtonProps {
  onClick: () => void
  title: string
  ariaLabel?: string
  children: React.ReactNode
  large?: boolean
  className?: string
}

function CtrlBtn({ onClick, title, ariaLabel, children, large, className = '' }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      className={`
        flex items-center justify-center rounded-full transition-all duration-150
        text-white hover:scale-110 active:scale-95
        ${large ? 'w-12 h-12 theme-play-btn' : 'w-9 h-9 text-base bg-white/10 hover:bg-white/20'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export function PlaybackControls() {
  const { isPlaying, currentTime, duration } = useAppStore()
  const { togglePlay, seek, stop } = useAudioEngine()

  return (
    <div className="flex items-center gap-2 sm:gap-4 justify-center">
      <CtrlBtn onClick={() => seek(0)} title="Restart">
        <SkipBack size={16} weight="fill" />
      </CtrlBtn>
      <CtrlBtn onClick={() => seek(Math.max(0, currentTime - 10))} title="Rewind 10s (←)" ariaLabel="Rewind 10 seconds" className="hidden sm:flex">
        <span className="text-xs font-bold leading-none">−10</span>
      </CtrlBtn>
      <CtrlBtn onClick={() => void togglePlay()} title="Play / Pause (Space)" ariaLabel={isPlaying ? 'Pause' : 'Play'} large>
        {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
      </CtrlBtn>
      <CtrlBtn onClick={stop} title="Stop">
        <Stop size={16} weight="fill" />
      </CtrlBtn>
      <CtrlBtn onClick={() => seek(Math.min(duration, currentTime + 10))} title="Forward 10s (→)" ariaLabel="Forward 10 seconds" className="hidden sm:flex">
        <span className="text-xs font-bold leading-none">+10</span>
      </CtrlBtn>
      <CtrlBtn onClick={() => seek(duration)} title="Skip to end">
        <SkipForward size={16} weight="fill" />
      </CtrlBtn>
    </div>
  )
}
