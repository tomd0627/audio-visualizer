interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
}

const particles: Particle[] = []
const MAX_PARTICLES = 300

function spawnParticle(cx: number, cy: number, energy: number): void {
  if (particles.length >= MAX_PARTICLES) return
  const angle = Math.random() * Math.PI * 2
  const speed = (0.5 + Math.random() * 2) * energy
  const life = 60 + Math.random() * 60
  particles.push({
    x: cx + (Math.random() - 0.5) * 20,
    y: cy + (Math.random() - 0.5) * 20,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life,
    maxLife: life,
    size: 1 + Math.random() * 3,
    hue: 10 + Math.random() * 40, // ember to yellow range
  })
}

export function drawParticleField(
  ctx: CanvasRenderingContext2D,
  freqData: Uint8Array,
  width: number,
  height: number,
  sensitivity: number,
): void {
  const cx = width / 2
  const cy = height / 2

  // Bass energy (bins 0–15)
  let bassSum = 0
  for (let i = 0; i < 16; i++) bassSum += freqData[i] ?? 0
  const bassEnergy = (bassSum / (16 * 255)) * sensitivity

  // Spawn particles on bass hit
  const spawnCount = Math.floor(bassEnergy * 8)
  for (let i = 0; i < spawnCount; i++) {
    spawnParticle(cx, cy, bassEnergy)
  }

  // Update and draw particles
  ctx.save()
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]!
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.02 // subtle gravity
    p.life--

    if (p.life <= 0) {
      particles.splice(i, 1)
      continue
    }

    const alpha = p.life / p.maxLife
    ctx.shadowBlur = 6
    ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${alpha})`
    ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

export function resetParticles(): void {
  particles.length = 0
}
