import { useCallback } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { decodeFile, FilePlayer } from '../audio/FileDecoder'
import { PreviewPlayer } from '../audio/PreviewPlayer'
import type { TrackInfo } from '../audio/types'
import { useAppStore } from '../store/useAppStore'

export function useAudioEngine() {
  const { setIsPlaying, setCurrentTime, setDuration, setVolume, setIsMuted, setAudioStarted, addToHistory } = useAppStore()

  const loadFile = useCallback(async (file: File) => {
    setAudioStarted(true)
    let player: InstanceType<typeof FilePlayer>
    try {
      player = await decodeFile(file)
    } catch {
      setAudioStarted(false)
      return
    }

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

    player.onDurationChange((d) => setDuration(d))

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
      audioEngine.resume()
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
    audioEngine.suspend()
  }, [setIsPlaying, setCurrentTime])

  const changeVolume = useCallback((level: number) => {
    audioEngine.setVolume(level)
    setVolume(level)
  }, [setVolume])

  const toggleMute = useCallback(() => {
    const muted = audioEngine.toggleMute()
    setIsMuted(muted)
  }, [setIsMuted])

  const loadDemoTrack = useCallback(async () => {
    const demoTrack: TrackInfo = {
      id: 'demo',
      title: 'Demo Track',
      artist: 'Resonance',
      duration: 0,
      sourceType: 'preview',
      previewUrl: '/demo.mp3',
    }
    await loadPreview(demoTrack)
  }, [loadPreview])

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
    audioEngine.suspend()
    useAppStore.getState().setCurrentTrack(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setAudioStarted(false)
  }, [setIsPlaying, setCurrentTime, setDuration, setAudioStarted])

  return { loadFile, loadPreview, loadDemoTrack, togglePlay, seek, stop, unload, changeVolume, toggleMute, reloadTrack }
}

// Expose FilePlayer type for instanceof checks
export { FilePlayer }
