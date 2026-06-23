import type { ShadowStrength, ThemeConfig } from './types'
import { getPreset } from './presets'

const STRENGTH_FACTOR: Record<ShadowStrength, number> = {
  none: 0,
  soft: 0.6,
  default: 1,
  strong: 1.7,
}

interface Layer {
  y: number
  blur: number
  spread: number
  a: number
}

const SHADOW_BASE: Record<string, Layer[]> = {
  xs: [{ y: 1, blur: 2, spread: 0, a: 0.05 }],
  sm: [
    { y: 1, blur: 3, spread: 0, a: 0.1 },
    { y: 1, blur: 2, spread: -1, a: 0.1 },
  ],
  md: [
    { y: 4, blur: 6, spread: -1, a: 0.1 },
    { y: 2, blur: 4, spread: -2, a: 0.1 },
  ],
  lg: [
    { y: 10, blur: 15, spread: -3, a: 0.1 },
    { y: 4, blur: 6, spread: -4, a: 0.1 },
  ],
  xl: [
    { y: 20, blur: 25, spread: -5, a: 0.1 },
    { y: 8, blur: 10, spread: -6, a: 0.1 },
  ],
  '2xl': [{ y: 25, blur: 50, spread: -12, a: 0.25 }],
}

const SHADOW_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const

function buildShadow(key: string, strength: number, dark: boolean): string {
  if (strength <= 0) return 'none'
  const layers = SHADOW_BASE[key]
  const color = dark ? '0 0 0' : '0.21 0.005 270'
  return layers
    .map((l) => {
      const alpha = Math.min(1, l.a * strength * (dark ? 4 : 1))
      return `0 ${l.y}px ${l.blur}px ${l.spread}px oklch(${color} / ${alpha.toFixed(3)})`
    })
    .join(', ')
}

function shadowLines(strength: number, dark: boolean, indent: string): string {
  return SHADOW_KEYS.map(
    (k) => `${indent}--shadow-${k}: ${buildShadow(k, strength, dark)};`,
  ).join('\n')
}

export function generateThemeCss(config: ThemeConfig): string {
  const preset = getPreset(config.preset)
  const strength = STRENGTH_FACTOR[config.shadow]
  const light = preset.light
  const dark = preset.dark

  const root = `:root {
  --radius: ${config.radius}rem;
  --scale: ${config.scale};
  --font-size-base: ${config.fontSize}px;
  --spacing: ${config.spacing}rem;
  --font-sans: ${config.fontSans};
  --font-heading: ${config.fontHeading};
  --font-mono: ${config.fontMono};
${shadowLines(strength, false, '  ')}
  --primary: ${light.primary};
  --primary-foreground: ${light.primaryForeground};
  --accent: ${light.accent};
  --accent-foreground: ${light.accentForeground};
  --ring: ${light.ring};
  --sidebar-primary: ${light.primary};
  --sidebar-ring: ${light.ring};
}`

  const darkBlock = `.dark {
  --primary: ${dark.primary};
  --primary-foreground: ${dark.primaryForeground};
  --accent: ${dark.accent};
  --accent-foreground: ${dark.accentForeground};
  --ring: ${dark.ring};
  --sidebar-primary: ${dark.primary};
  --sidebar-ring: ${dark.ring};
${shadowLines(strength, true, '  ')}
}`

  return `${root}\n${darkBlock}\n`
}
