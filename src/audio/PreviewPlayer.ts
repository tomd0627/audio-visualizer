import { audioEngine } from './AudioEngine'
import type { AudioSource } from './types'

/**
 * Wraps HTMLAudioElement for Spotify 30-second preview playback.
 * Routes audio through Web Audio API: MediaElementSource → GainNode → AnalyserNode → destination
 */
export class PreviewPlayer implements AudioSource {
  private audio: HTMLAudioElement
  private mediaSource: MediaElementAudioSourceNode | null = null
  private onEndedCallbacks: (() => void)[] = []
  private onTimeUpdateCallbacks: ((t: number) => void)[] = []
  private connected = false

  constructor(previewUrl: string) {
    this.audio = new Audio()
    this.audio.crossOrigin = 'anonymous'
    this.audio.src = previewUrl
    this.audio.preload = 'auto'

    this.audio.addEventListener('ended', () => {
      this.onEndedCallbacks.forEach((cb) => cb())
    })
    this.audio.addEventListener('timeupdate', () => {
      this.onTimeUpdateCallbacks.forEach((cb) => cb(this.audio.currentTime))
    })
  }

  private connect(): void {
    if (this.connected) return
    const ctx = audioEngine.resume()
    const gain = audioEngine.getGainNode()
    if (!gain) return
    this.mediaSource = ctx.createMediaElementSource(this.audio)
    this.mediaSource.connect(gain)
    this.connected = true
  }

  async play(): Promise<void> {
    this.connect()
    await this.audio.play()
  }

  pause(): void {
    this.audio.pause()
  }

  seek(seconds: number): void {
    this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || 0))
  }

  setVolume(level: number): void {
    // Volume is managed by AudioEngine GainNode; keep audio element at 1
    this.audio.volume = level > 0 ? 1 : 0
  }

  getDuration(): number {
    return isFinite(this.audio.duration) ? this.audio.duration : 0
  }

  getCurrentTime(): number {
    return this.audio.currentTime
  }

  isPlaying(): boolean {
    return !this.audio.paused
  }

  onEnded(cb: () => void): void {
    this.onEndedCallbacks.push(cb)
  }

  onTimeUpdate(cb: (t: number) => void): void {
    this.onTimeUpdateCallbacks.push(cb)
  }

  destroy(): void {
    this.audio.pause()
    this.audio.src = ''
    this.mediaSource?.disconnect()
    this.onEndedCallbacks = []
    this.onTimeUpdateCallbacks = []
  }
}
