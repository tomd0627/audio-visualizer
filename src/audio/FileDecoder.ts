import { audioEngine } from './AudioEngine'
import type { AudioSource } from './types'

/**
 * Wraps a decoded AudioBuffer for local file playback.
 * Uses AudioBufferSourceNode → GainNode → AnalyserNode → destination.
 */
export class FilePlayer implements AudioSource {
  private buffer: AudioBuffer
  private bufferSource: AudioBufferSourceNode | null = null
  private startTime = 0
  private pauseOffset = 0
  private playing = false
  private onEndedCallbacks: (() => void)[] = []
  private onTimeUpdateCallbacks: ((t: number) => void)[] = []
  private rafId: number | null = null

  constructor(buffer: AudioBuffer) {
    this.buffer = buffer
  }

  async play(): Promise<void> {
    const ctx = audioEngine.resume()
    const gain = audioEngine.getGainNode()
    if (!gain) return

    if (this.playing) return

    this.bufferSource = ctx.createBufferSource()
    this.bufferSource.buffer = this.buffer
    this.bufferSource.connect(gain)
    this.bufferSource.onended = () => {
      if (this.playing) {
        this.playing = false
        this.pauseOffset = 0
        this.onEndedCallbacks.forEach((cb) => cb())
        this.stopTimeUpdater()
      }
    }

    this.startTime = ctx.currentTime - this.pauseOffset
    this.bufferSource.start(0, this.pauseOffset)
    this.playing = true
    this.startTimeUpdater()
  }

  pause(): void {
    if (!this.playing || !this.bufferSource) return
    const ctx = audioEngine.getContext()
    if (!ctx) return

    this.pauseOffset = ctx.currentTime - this.startTime
    this.bufferSource.onended = null
    this.bufferSource.stop()
    this.bufferSource = null
    this.playing = false
    this.stopTimeUpdater()
  }

  seek(seconds: number): void {
    const wasPlaying = this.playing
    if (this.playing) this.pause()
    this.pauseOffset = Math.max(0, Math.min(seconds, this.buffer.duration))
    if (wasPlaying) void this.play()
  }

  setVolume(_level: number): void {
    // Volume is managed by the GainNode in AudioEngine
  }

  getDuration(): number {
    return this.buffer.duration
  }

  getCurrentTime(): number {
    if (!this.playing) return this.pauseOffset
    const ctx = audioEngine.getContext()
    if (!ctx) return this.pauseOffset
    return Math.min(ctx.currentTime - this.startTime, this.buffer.duration)
  }

  isPlaying(): boolean {
    return this.playing
  }

  onEnded(cb: () => void): void {
    this.onEndedCallbacks.push(cb)
  }

  onTimeUpdate(cb: (t: number) => void): void {
    this.onTimeUpdateCallbacks.push(cb)
  }

  private startTimeUpdater(): void {
    let lastEmit = 0
    const tick = (now: number) => {
      if (!this.playing) return
      if (now - lastEmit >= 250) {
        lastEmit = now
        this.onTimeUpdateCallbacks.forEach((cb) => { cb(this.getCurrentTime()) })
      }
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private stopTimeUpdater(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  destroy(): void {
    if (this.playing) this.pause()
    this.onEndedCallbacks = []
    this.onTimeUpdateCallbacks = []
  }
}

export async function decodeFile(file: File): Promise<FilePlayer> {
  const ctx = audioEngine.resume()
  const arrayBuffer = await file.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  return new FilePlayer(audioBuffer)
}
