import type { AudioSource } from './types'

/**
 * Central audio graph: Source → GainNode → AnalyserNode → destination
 * Instantiated once as a module-level singleton; never re-created.
 */
class AudioEngine {
  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private gainNode: GainNode | null = null
  private source: AudioSource | null = null

  private freqData: Uint8Array = new Uint8Array(0)
  private timeData: Uint8Array = new Uint8Array(0)

  private _volume = 1
  private _isMuted = false

  /** Lazily create AudioContext on first user gesture */
  resume(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.gainNode = this.ctx.createGain()
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8
      this.gainNode.connect(this.analyser)
      this.analyser.connect(this.ctx.destination)

      const binCount = this.analyser.frequencyBinCount
      this.freqData = new Uint8Array(binCount)
      this.timeData = new Uint8Array(binCount)
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  getContext(): AudioContext | null {
    return this.ctx
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser
  }

  getGainNode(): GainNode | null {
    return this.gainNode
  }

  setSource(newSource: AudioSource | null): void {
    if (this.source) {
      this.source.destroy()
    }
    this.source = newSource
    if (this.source) {
      this.source.setVolume(this._isMuted ? 0 : this._volume)
    }
  }

  getSource(): AudioSource | null {
    return this.source
  }

  /** Read frequency data into internal buffer and return it */
  getFrequencyData(): Uint8Array {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.freqData)
    }
    return this.freqData
  }

  /** Read time-domain data into internal buffer and return it */
  getTimeDomainData(): Uint8Array {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(this.timeData)
    }
    return this.timeData
  }

  setVolume(level: number): void {
    this._volume = Math.max(0, Math.min(1, level))
    if (!this._isMuted && this.gainNode) {
      this.gainNode.gain.setTargetAtTime(this._volume, this.ctx?.currentTime ?? 0, 0.01)
    }
    this.source?.setVolume(this._isMuted ? 0 : this._volume)
  }

  getVolume(): number {
    return this._volume
  }

  toggleMute(): boolean {
    this._isMuted = !this._isMuted
    const effectiveVolume = this._isMuted ? 0 : this._volume
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(effectiveVolume, this.ctx?.currentTime ?? 0, 0.01)
    }
    this.source?.setVolume(effectiveVolume)
    return this._isMuted
  }

  isMuted(): boolean {
    return this._isMuted
  }

  suspend(): void {
    if (this.ctx?.state === 'running') {
      void this.ctx.suspend()
    }
  }
}

export const audioEngine = new AudioEngine()
