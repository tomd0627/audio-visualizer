import type { CanvasTheme } from '../../themes/themes'

// Radial frequency bars shooting outward from center.
// Each bar maps to a frequency bin; bass bins are thicker and brighter.
export function drawTunnel(
  ctx: CanvasRenderingContext2D,
  freqData: Uint8Array,
  width: number,
  height: number,
  sensitivity: number,
  rotation: number,
  theme: CanvasTheme,
): void {
  const cx = width / 2
  const cy = height / 2
  const BAR_COUNT = 128
  const innerRadius = Math.min(width, height) * 0.08
  const maxBarLen = Math.min(width, height) * 0.42

  ctx.save()
  ctx.shadowBlur = 14

  for (let i = 0; i < BAR_COUNT; i++) {
    const angle = (i / BAR_COUNT) * Math.PI * 2 + rotation

    // Log-scale bin mapping (same as BarSpectrum)
    const minHz = 20, maxHz = 20000, nyquist = 22050
    const freqLow = minHz * Math.pow(maxHz / minHz, i / BAR_COUNT)
    const freqHigh = minHz * Math.pow(maxHz / minHz, (i + 1) / BAR_COUNT)
    const binLow = Math.floor((freqLow / nyquist) * freqData.length)
    const binHigh = Math.min(Math.ceil((freqHigh / nyquist) * freqData.length), freqData.length - 1)

    let sum = 0, count = 0
    for (let b = binLow; b <= binHigh; b++) { sum += freqData[b] ?? 0; count++ }
    const avg = count > 0 ? sum / count : 0
    const barLen = (avg / 255) * maxBarLen * sensitivity

    if (barLen < 1) continue

    const t = avg / 255
    const hue = theme.hueMin + t * (theme.hueMax - theme.hueMin)
    const color = `hsla(${hue}, 100%, 65%, 0.9)`

    ctx.shadowColor = color
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1, 2 - t)

    const x0 = cx + Math.cos(angle) * innerRadius
    const y0 = cy + Math.sin(angle) * innerRadius
    const x1 = cx + Math.cos(angle) * (innerRadius + barLen)
    const y1 = cy + Math.sin(angle) * (innerRadius + barLen)

    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
  }

  // Solid inner circle
  ctx.shadowBlur = 20
  ctx.shadowColor = theme.innerCircleShadow
  ctx.strokeStyle = theme.innerCircle
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.restore()
}
