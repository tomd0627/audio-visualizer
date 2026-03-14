export interface AudioSource {
  play(): Promise<void>
  pause(): void
  seek(seconds: number): void
  setVolume(level: number): void
  getDuration(): number
  getCurrentTime(): number
  isPlaying(): boolean
  destroy(): void
}

export type VisualizerMode = 'bars' | 'circular' | 'oscilloscope' | 'particles' | 'tunnel' | 'aurora'

export interface TrackInfo {
  id: string
  title: string
  artist: string
  album?: string
  artworkUrl?: string
  duration: number
  sourceType: 'file' | 'preview'
  previewUrl?: string
}
