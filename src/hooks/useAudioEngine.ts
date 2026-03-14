import { useCallback } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { decodeFile, FilePlayer } from '../audio/FileDecoder'
import { PreviewPlayer } from '../audio/PreviewPlayer'
import { useAppStore } from '../store/useAppStore'
import type { TrackInfo } from '../audio/types'

export function useAudioEngine() {
  const { setIsPlaying, setCurrentTime, setDuration, setVolume, setIsMuted, setAudioStarted, addToHistory } = useAppStore()

  const loadFile = useCallback(async (file: File) => {
    setAudioStarted(true)
    const player = await decodeFile(file)

    const trackInfo: TrackInfo = {
      id: `file-${file.name}-${file.size}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local File',
      duration: player.getDuration(),
      sourceType: 'file',
    }

    player.onEnded(() => {
      setIsPlaying(false)
      setCurrentTime(0)
    })
    player.onTimeUpdate((t) => setCurrentTime(t))

    audioEngine.setSource(player)
    setDuration(player.getDuration())
    setCurrentTime(0)
    setIsPlaying(false)
    useAppStore.getState().setCurrentTrack(trackInfo)
    addToHistory(trackInfo)

    await player.play()
    setIsPlaying(true)
  }, [setIsPlaying, setCurrentTime, setDuration, setAudioStarted, addToHistory])

  const loadPreview = useCallback(async (trackInfo: TrackInfo) => {
    if (!trackInfo.previewUrl) {
      alert('No 30-second preview available for this track.')
      return
    }
    setAudioStarted(true)
    const player = new PreviewPlayer(trackInfo.previewUrl)

    player.onEnded(() => {
      setIsPlaying(false)
      setCurrentTime(0)
    })
    player.onTimeUpdate((t) => setCurrentTime(t))

    audioEngine.setSource(player)
    useAppStore.getState().setCurrentTrack(trackInfo)
    addToHistory(trackInfo)

    // Duration isn't always available immediately from HTMLAudioElement
    const getDur = () => {
      const d = player.getDuration()
      setDuration(d > 0 ? d : trackInfo.duration)
    }
    getDur()
    setTimeout(getDur, 500)

    setCurrentTime(0)
    setIsPlaying(false)
    await player.play()
    setIsPlaying(true)
  }, [setIsPlaying, setCurrentTime, setDuration, setAudioStarted, addToHistory])

  const togglePlay = useCallback(async () => {
    const source = audioEngine.getSource()
    if (!source) return
    if (source.isPlaying()) {
      source.pause()
      setIsPlaying(false)
    } else {
      await source.play()
      setIsPlaying(true)
    }
  }, [setIsPlaying])

  const seek = useCallback((seconds: number) => {
    audioEngine.getSource()?.seek(seconds)
    setCurrentTime(seconds)
  }, [setCurrentTime])

  const stop = useCallback(() => {
    const source = audioEngine.getSource()
    if (!source) return
    if (source.isPlaying()) {
      source.pause()
      setIsPlaying(false)
    }
    source.seek(0)
    setCurrentTime(0)
  }, [setIsPlaying, setCurrentTime])

  const changeVolume = useCallback((level: number) => {
    audioEngine.setVolume(level)
    setVolume(level)
  }, [setVolume])

  const toggleMute = useCallback(() => {
    const muted = audioEngine.toggleMute()
    setIsMuted(muted)
  }, [setIsMuted])

  const reloadTrack = useCallback(async (track: TrackInfo) => {
    if (track.sourceType === 'preview' && track.previewUrl) {
      await loadPreview(track)
    }
  }, [loadPreview])

  const unload = useCallback(() => {
    const source = audioEngine.getSource()
    if (source) {
      if (source.isPlaying()) source.pause()
      source.seek(0)
    }
    useAppStore.getState().setCurrentTrack(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setAudioStarted(false)
  }, [setIsPlaying, setCurrentTime, setDuration, setAudioStarted])

  return { loadFile, loadPreview, togglePlay, seek, stop, unload, changeVolume, toggleMute, reloadTrack }
}

// Expose FilePlayer type for instanceof checks
export { FilePlayer }
