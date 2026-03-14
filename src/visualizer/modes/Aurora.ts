// Two mirrored waveform ribbons with a glowing fill between them.
// Upper and lower bands shift in hue based on dominant frequency energy.
export function drawAurora(
  ctx: CanvasRenderingContext2D,
  timeData: Uint8Array,
  freqData: Uint8Array,
  width: number,
  height: number,
): void {
  const midY = height / 2
  const spread = height * 0.28
  const len = timeData.length
  const step = width / (len - 1)

  // Dominant hue from frequency energy (bass=cyan, mid=purple, treble=pink)
  let bassSum = 0, midSum = 0, trebleSum = 0
  for (let i = 0; i < freqData.length; i++) {
    const v = freqData[i] ?? 0
    if (i < freqData.length * 0.1) bassSum += v
    else if (i < freqData.length * 0.5) midSum += v
    else trebleSum += v
  }
  const bass = bassSum / (freqData.length * 0.1 * 255)
  const mid = midSum / (freqData.length * 0.4 * 255)
  const treble = trebleSum / (freqData.length * 0.5 * 255)
  const hue = bass > mid && bass > treble ? 15
    : mid > treble ? 30
    : 48

  // Build upper and lower wave paths
  const upper: [number, number][] = []
  const lower: [number, number][] = []

  for (let i = 0; i < len; i++) {
    const v = ((timeData[i] ?? 128) / 128) - 1
    const x = i * step
    upper.push([x, midY - spread * 0.4 + v * spread])
    lower.push([x, midY + spread * 0.4 - v * spread])
  }

  ctx.save()

  // Filled ribbon between the two waves
  ctx.beginPath()
  ctx.moveTo(upper[0]![0], upper[0]![1])
  for (let i = 1; i < upper.length; i++) ctx.lineTo(upper[i]![0], upper[i]![1])
  for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(lower[i]![0], lower[i]![1])
  ctx.closePath()

  const fillGrad = ctx.createLinearGradient(0, midY - spread, 0, midY + spread)
  fillGrad.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.12)`)
  fillGrad.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 70%, 0.22)`)
  fillGrad.addColorStop(1, `hsla(${hue}, 100%, 60%, 0.12)`)
  ctx.fillStyle = fillGrad
  ctx.fill()

  // Upper stroke
  ctx.shadowBlur = 18
  ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.8)`
  ctx.strokeStyle = `hsla(${hue}, 100%, 72%, 0.85)`
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(upper[0]![0], upper[0]![1])
  for (let i = 1; i < upper.length; i++) ctx.lineTo(upper[i]![0], upper[i]![1])
  ctx.stroke()

  // Lower stroke (complementary hue)
  const hue2 = (hue + 60) % 360
  ctx.shadowColor = `hsla(${hue2}, 100%, 65%, 0.8)`
  ctx.strokeStyle = `hsla(${hue2}, 100%, 72%, 0.85)`
  ctx.beginPath()
  ctx.moveTo(lower[0]![0], lower[0]![1])
  for (let i = 1; i < lower.length; i++) ctx.lineTo(lower[i]![0], lower[i]![1])
  ctx.stroke()

  ctx.restore()
}
