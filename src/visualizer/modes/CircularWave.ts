import type { CanvasTheme } from '../../themes/themes'

export function drawCircularWave(
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
  const baseRadius = Math.min(width, height) * 0.2
  const maxAmplitude = Math.min(width, height) * 0.25
  const points = 180

  ctx.save()
  ctx.shadowBlur = 16
  ctx.shadowColor = theme.shadowColor

  ctx.beginPath()
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2 + rotation
    const binIndex = Math.floor((i / points) * (freqData.length / 2))
    const amplitude = ((freqData[binIndex] ?? 0) / 255) * maxAmplitude * sensitivity
    const r = baseRadius + amplitude

    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()

  const grad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, baseRadius + maxAmplitude)
  grad.addColorStop(0, theme.fillCenter)
  grad.addColorStop(1, theme.fillEdge)

  ctx.strokeStyle = theme.strokeColor
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = grad
  ctx.fill()

  ctx.restore()
}
