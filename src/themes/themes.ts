export type ThemeId = 'solar' | 'aurora' | 'neon' | 'forest' | 'glacier'

export interface CanvasTheme {
  shadowColor: string
  strokeColor: string
  gradBottom: string
  gradTop: string
  fillCenter: string
  fillEdge: string
  innerCircle: string
  innerCircleShadow: string
  hueMin: number
  hueMax: number
  auroraHueBass: number
  auroraHueMid: number
  auroraHueTreble: number
}

export interface Theme {
  id: ThemeId
  name: string
  bg: string
  primary: string
  primaryRgb: string  // "r, g, b" for use in rgba()
  accent: string
  accentRgb: string
  canvas: CanvasTheme
}

export const THEMES: Record<ThemeId, Theme> = {
  solar: {
    id: 'solar',
    name: 'Solar',
    bg: '#0a0600',
    primary: '#ff6b00',
    primaryRgb: '255, 107, 0',
    accent: '#ff3d00',
    accentRgb: '255, 61, 0',
    canvas: {
      shadowColor: '#ff6b00',
      strokeColor: 'rgba(255, 107, 0, 0.9)',
      gradBottom: 'rgba(255, 61, 0, 0.9)',
      gradTop: 'rgba(255, 229, 102, 0.9)',
      fillCenter: 'rgba(255, 61, 0, 0.6)',
      fillEdge: 'rgba(255, 229, 102, 0.2)',
      innerCircle: 'rgba(255, 107, 0, 0.5)',
      innerCircleShadow: 'rgba(255, 107, 0, 0.6)',
      hueMin: 10,
      hueMax: 50,
      auroraHueBass: 15,
      auroraHueMid: 30,
      auroraHueTreble: 48,
    },
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    bg: '#01060d',
    primary: '#00e5ff',
    primaryRgb: '0, 229, 255',
    accent: '#00ffff',
    accentRgb: '0, 255, 255',
    canvas: {
      shadowColor: '#00e5ff',
      strokeColor: 'rgba(0, 229, 255, 0.9)',
      gradBottom: 'rgba(0, 180, 216, 0.9)',
      gradTop: 'rgba(168, 85, 247, 0.9)',
      fillCenter: 'rgba(0, 180, 216, 0.6)',
      fillEdge: 'rgba(168, 85, 247, 0.2)',
      innerCircle: 'rgba(0, 229, 255, 0.5)',
      innerCircleShadow: 'rgba(0, 229, 255, 0.6)',
      hueMin: 185,
      hueMax: 285,
      auroraHueBass: 195,
      auroraHueMid: 270,
      auroraHueTreble: 310,
    },
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    bg: '#050005',
    primary: '#ff00ff',
    primaryRgb: '255, 0, 255',
    accent: '#bf5af2',
    accentRgb: '191, 90, 242',
    canvas: {
      shadowColor: '#ff00ff',
      strokeColor: 'rgba(255, 0, 255, 0.9)',
      gradBottom: 'rgba(255, 0, 255, 0.9)',
      gradTop: 'rgba(0, 255, 255, 0.9)',
      fillCenter: 'rgba(255, 0, 255, 0.6)',
      fillEdge: 'rgba(0, 255, 255, 0.2)',
      innerCircle: 'rgba(255, 0, 255, 0.5)',
      innerCircleShadow: 'rgba(255, 0, 255, 0.6)',
      hueMin: 180,
      hueMax: 300,
      auroraHueBass: 300,
      auroraHueMid: 200,
      auroraHueTreble: 240,
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    bg: '#020a04',
    primary: '#00ff7f',
    primaryRgb: '0, 255, 127',
    accent: '#00fa9a',
    accentRgb: '0, 250, 154',
    canvas: {
      shadowColor: '#00ff7f',
      strokeColor: 'rgba(0, 255, 127, 0.9)',
      gradBottom: 'rgba(0, 180, 80, 0.9)',
      gradTop: 'rgba(173, 255, 47, 0.9)',
      fillCenter: 'rgba(0, 180, 80, 0.6)',
      fillEdge: 'rgba(173, 255, 47, 0.2)',
      innerCircle: 'rgba(0, 255, 127, 0.5)',
      innerCircleShadow: 'rgba(0, 255, 127, 0.6)',
      hueMin: 90,
      hueMax: 150,
      auroraHueBass: 120,
      auroraHueMid: 95,
      auroraHueTreble: 160,
    },
  },
  glacier: {
    id: 'glacier',
    name: 'Glacier',
    bg: '#010a14',
    primary: '#00b4d8',
    primaryRgb: '0, 180, 216',
    accent: '#0077b6',
    accentRgb: '0, 119, 182',
    canvas: {
      shadowColor: '#00b4d8',
      strokeColor: 'rgba(0, 180, 216, 0.9)',
      gradBottom: 'rgba(0, 119, 182, 0.9)',
      gradTop: 'rgba(144, 224, 239, 0.9)',
      fillCenter: 'rgba(0, 119, 182, 0.6)',
      fillEdge: 'rgba(144, 224, 239, 0.2)',
      innerCircle: 'rgba(0, 180, 216, 0.5)',
      innerCircleShadow: 'rgba(0, 180, 216, 0.6)',
      hueMin: 190,
      hueMax: 220,
      auroraHueBass: 200,
      auroraHueMid: 215,
      auroraHueTreble: 185,
    },
  },
}

export function applyThemeToDom(theme: Theme): void {
  const root = document.documentElement
  root.style.setProperty('--theme-primary', theme.primary)
  root.style.setProperty('--theme-primary-rgb', theme.primaryRgb)
  root.style.setProperty('--theme-accent', theme.accent)
  root.style.setProperty('--theme-accent-rgb', theme.accentRgb)
  root.style.setProperty('--theme-bg', theme.bg)
  document.body.style.background = theme.bg
}
