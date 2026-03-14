import type { CanvasTheme } from '../../themes/themes'

export function drawOscilloscopeWave(
  ctx: CanvasRenderingContext2D,
  timeData: Uint8Array,
  width: number,
  height: number,
  theme: CanvasTheme,
): void {
  const sliceWidth = width / timeData.length
  const midY = height / 2

  ctx.save()
  ctx.shadowBlur = 8
  ctx.shadowColor = theme.shadowColor
  ctx.strokeStyle = theme.strokeColor
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'

  ctx.beginPath()
  for (let i = 0; i < timeData.length; i++) {
    const v = ((timeData[i] ?? 128) / 128) - 1
    const x = i * sliceWidth
    const y = midY + v * (height * 0.4)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.stroke()
  ctx.restore()
}
