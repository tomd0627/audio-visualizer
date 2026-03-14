export function drawBarSpectrum(
  ctx: CanvasRenderingContext2D,
  freqData: Uint8Array,
  width: number,
  height: number,
  sensitivity: number,
): void {
  const BAR_COUNT = 80
  const binCount = freqData.length
  const gap = 2

  // Map bar index to frequency bin using logarithmic scale
  const minHz = 20
  const maxHz = 20000
  const nyquist = 22050

  const barWidth = (width / 2 - gap * BAR_COUNT) / BAR_COUNT
  const centerX = width / 2

  ctx.save()
  ctx.shadowBlur = 12

  for (let i = 0; i < BAR_COUNT; i++) {
    // Log-scale frequency mapping
    const freqLow = minHz * Math.pow(maxHz / minHz, i / BAR_COUNT)
    const freqHigh = minHz * Math.pow(maxHz / minHz, (i + 1) / BAR_COUNT)
    const binLow = Math.floor((freqLow / nyquist) * binCount)
    const binHigh = Math.min(Math.ceil((freqHigh / nyquist) * binCount), binCount - 1)

    // Average the bins in this range
    let sum = 0
    let count = 0
    for (let b = binLow; b <= binHigh; b++) {
      sum += freqData[b] ?? 0
      count++
    }
    const avg = count > 0 ? sum / count : 0
    const barHeight = ((avg / 255) * height * 0.85 * sensitivity)

    if (barHeight < 1) continue

    // Color: cyan at base → purple at top, with glow
    const t = avg / 255
    const r = 255
    const g = Math.round(t * 229 + (1 - t) * 61)
    const b2 = Math.round(t * 102)
    const color = `rgb(${r},${g},${b2})`

    ctx.shadowColor = color

    const grad = ctx.createLinearGradient(0, height, 0, height - barHeight)
    grad.addColorStop(0, `rgba(255, 61, 0, 0.9)`)
    grad.addColorStop(1, `rgba(255, 229, 102, 0.9)`)
    ctx.fillStyle = grad

    const x = i * (barWidth + gap)

    // Right side
    ctx.beginPath()
    ctx.roundRect(centerX + x, height - barHeight, barWidth, barHeight, [3, 3, 0, 0])
    ctx.fill()

    // Mirror left side
    ctx.beginPath()
    ctx.roundRect(centerX - x - barWidth, height - barHeight, barWidth, barHeight, [3, 3, 0, 0])
    ctx.fill()
  }

  ctx.restore()
}
