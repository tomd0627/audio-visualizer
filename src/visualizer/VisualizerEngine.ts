import { audioEngine } from '../audio/AudioEngine'
import type { VisualizerMode } from '../audio/types'
import { THEMES } from '../themes/themes'
import type { CanvasTheme } from '../themes/themes'
import { drawAurora } from './modes/Aurora'
import { drawBarSpectrum } from './modes/BarSpectrum'
import { drawCircularWave } from './modes/CircularWave'
import { drawOscilloscopeWave } from './modes/OscilloscopeWave'
import { drawParticleField, resetParticles } from './modes/ParticleField'
import { drawTunnel } from './modes/Tunnel'

/**
 * Owns the canvas, the rAF loop, and all drawing.
 * Completely decoupled from React — no hooks, no state.
 */
class VisualizerEngine {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private offscreen: HTMLCanvasElement | null = null
  private rafId: number | null = null
  private mode: VisualizerMode = 'bars'
  private rotation = 0
  private sensitivity = 1.0
  private canvasTheme: CanvasTheme = THEMES.solar.canvas
  private isMobile = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
  private active = false

  // Cross-fade state
  private prevMode: VisualizerMode | null = null
  private fadeFrame = 0
  private FADE_FRAMES = 8

  mount(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.offscreen = document.createElement('canvas')
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
    // Don't start loop here — setActive(true) controls it
  }

  unmount(): void {
    this.stop()
    this.active = false
    window.removeEventListener('resize', this.handleResize)
    this.canvas = null
    this.ctx = null
  }

  setActive(v: boolean): void {
    if (this.active === v) return
    this.active = v
    if (v) {
      this.start()
    } else {
      this.stop()
      if (this.ctx && this.canvas) {
        const dpr = window.devicePixelRatio || 1
        this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr)
      }
    }
  }

  setMode(mode: VisualizerMode): void {
    if (mode === this.mode) return
    this.prevMode = this.mode
    this.fadeFrame = this.FADE_FRAMES
    this.mode = mode
    if (mode !== 'particles') resetParticles()
  }

  getMode(): VisualizerMode {
    return this.mode
  }

  setSensitivity(s: number): void {
    this.sensitivity = Math.max(0.1, Math.min(3, s))
  }

  getSensitivity(): number {
    return this.sensitivity
  }

  setCanvasTheme(theme: CanvasTheme): void {
    this.canvasTheme = theme
  }

  private handleResize = (): void => {
    if (!this.canvas || !this.offscreen) return
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = this.canvas.clientWidth * dpr
    this.canvas.height = this.canvas.clientHeight * dpr
    this.offscreen.width = this.canvas.width
    this.offscreen.height = this.canvas.height
    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }
  }

  private start(): void {
    const tick = () => {
      this.draw()
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private draw(): void {
    const ctx = this.ctx
    const canvas = this.canvas
    if (!ctx || !canvas) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr

    const freqData = audioEngine.getFrequencyData()
    const timeData = audioEngine.getTimeDomainData()

    // Background clear with trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.fillRect(0, 0, w, h)

    // Ambient background gradient
    this.drawAmbientBackground(ctx, freqData, w, h)

    // Cross-fade between modes
    if (this.fadeFrame > 0 && this.prevMode) {
      const alpha = this.fadeFrame / this.FADE_FRAMES
      ctx.globalAlpha = alpha
      this.drawMode(ctx, this.prevMode, freqData, timeData, w, h)
      ctx.globalAlpha = 1 - alpha
      this.drawMode(ctx, this.mode, freqData, timeData, w, h)
      ctx.globalAlpha = 1
      this.fadeFrame--
    } else {
      this.drawMode(ctx, this.mode, freqData, timeData, w, h)
    }

    this.rotation += 0.003
  }

  private drawMode(
    ctx: CanvasRenderingContext2D,
    mode: VisualizerMode,
    freqData: Uint8Array,
    timeData: Uint8Array,
    w: number,
    h: number,
  ): void {
    const t = this.canvasTheme
    switch (mode) {
      case 'bars':
        drawBarSpectrum(ctx, freqData, w, h, this.sensitivity, t)
        break
      case 'circular':
        drawCircularWave(ctx, freqData, w, h, this.sensitivity, this.rotation, t)
        break
      case 'oscilloscope':
        drawOscilloscopeWave(ctx, timeData, w, h, t)
        break
      case 'particles':
        drawParticleField(ctx, freqData, w, h, this.sensitivity, t)
        break
      case 'tunnel':
        drawTunnel(ctx, freqData, w, h, this.sensitivity, this.rotation, t)
        break
      case 'aurora':
        drawAurora(ctx, timeData, freqData, w, h, t)
        break
    }
  }

  private drawAmbientBackground(
    ctx: CanvasRenderingContext2D,
    freqData: Uint8Array,
    w: number,
    h: number,
  ): void {
    // Dominant frequency band → hue mapping
    let bassSum = 0, midSum = 0, trebleSum = 0
    const len = freqData.length
    for (let i = 0; i < len; i++) {
      const v = freqData[i] ?? 0
      if (i < len * 0.1) bassSum += v
      else if (i < len * 0.5) midSum += v
      else trebleSum += v
    }
    const bass = bassSum / (len * 0.1 * 255)
    const mid = midSum / (len * 0.4 * 255)
    const treble = trebleSum / (len * 0.5 * 255)

    const t = this.canvasTheme
    const dominantHue = bass > mid && bass > treble ? t.hueMin
      : mid > treble ? (t.hueMin + t.hueMax) / 2
      : t.hueMax
    const energy = Math.max(bass, mid, treble) * 0.3

    if (!energy || energy < 0.01) return

    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6)
    grad.addColorStop(0, `hsla(${dominantHue}, 100%, 30%, ${energy * 0.4})`)
    grad.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.save()
    ctx.fillStyle = grad
    if (!this.isMobile) {
      ctx.filter = 'blur(20px)'
    }
    ctx.fillRect(0, 0, w, h)
    ctx.filter = 'none'
    ctx.restore()
  }
}

export const visualizerEngine = new VisualizerEngine()
