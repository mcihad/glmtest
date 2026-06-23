import type { ColorPreset, ColorTokens, ThemeConfig } from './types'

const SANS_STACK = `'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
const MONO_STACK = `ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace`

function lightTokens(hue: number, l: number, c: number): ColorTokens {
  return {
    primary: `oklch(${l} ${c} ${hue})`,
    primaryForeground: `oklch(0.98 0.01 ${hue})`,
    accent: `oklch(0.94 0.03 ${hue})`,
    accentForeground: `oklch(0.32 0.06 ${hue})`,
    ring: `oklch(${l} ${c} ${hue})`,
  }
}

function darkTokens(hue: number, l: number, c: number): ColorTokens {
  return {
    primary: `oklch(${l} ${c} ${hue})`,
    primaryForeground: `oklch(0.2 0.04 ${hue})`,
    accent: `oklch(0.3 0.05 ${hue})`,
    accentForeground: `oklch(0.92 0.04 ${hue})`,
    ring: `oklch(${l} ${c} ${hue})`,
  }
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'violet',
    label: 'Violet',
    swatch: 'oklch(0.55 0.22 295)',
    hue: 295,
    light: lightTokens(295, 0.55, 0.22),
    dark: darkTokens(295, 0.7, 0.17),
  },
  {
    id: 'blue',
    label: 'Blue',
    swatch: 'oklch(0.55 0.2 255)',
    hue: 255,
    light: lightTokens(255, 0.55, 0.2),
    dark: darkTokens(255, 0.7, 0.16),
  },
  {
    id: 'teal',
    label: 'Teal',
    swatch: 'oklch(0.6 0.13 195)',
    hue: 195,
    light: lightTokens(195, 0.6, 0.13),
    dark: darkTokens(195, 0.72, 0.12),
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: 'oklch(0.6 0.15 155)',
    hue: 155,
    light: lightTokens(155, 0.6, 0.15),
    dark: darkTokens(155, 0.72, 0.14),
  },
  {
    id: 'amber',
    label: 'Amber',
    swatch: 'oklch(0.72 0.16 65)',
    hue: 65,
    light: lightTokens(65, 0.72, 0.16),
    dark: darkTokens(65, 0.8, 0.15),
  },
  {
    id: 'rose',
    label: 'Rose',
    swatch: 'oklch(0.6 0.21 15)',
    hue: 15,
    light: lightTokens(15, 0.6, 0.21),
    dark: darkTokens(15, 0.7, 0.18),
  },
  {
    id: 'neutral',
    label: 'Neutral',
    swatch: 'oklch(0.32 0.01 270)',
    hue: 270,
    light: lightTokens(270, 0.32, 0.01),
    dark: {
      primary: 'oklch(0.92 0.005 270)',
      primaryForeground: 'oklch(0.2 0.01 270)',
      accent: 'oklch(0.27 0.01 270)',
      accentForeground: 'oklch(0.92 0.005 270)',
      ring: 'oklch(0.92 0.005 270)',
    },
  },
]

export function getPreset(id: string): ColorPreset {
  return COLOR_PRESETS.find((p) => p.id === id) ?? COLOR_PRESETS[0]
}

export interface FontOption {
  id: string
  label: string
  stack: string
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'inter', label: 'Inter', stack: SANS_STACK },
  {
    id: 'geist',
    label: 'Geist Sans',
    stack: `'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`,
  },
  {
    id: 'system',
    label: 'System UI',
    stack: `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
  },
  {
    id: 'serif',
    label: 'Serif',
    stack: `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
  },
  {
    id: 'mono-sans',
    label: 'IBM Plex Sans',
    stack: `'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, sans-serif`,
  },
]

export const MONO_FONT_OPTIONS: FontOption[] = [
  { id: 'jetbrains', label: 'JetBrains Mono', stack: MONO_STACK },
  {
    id: 'geist-mono',
    label: 'Geist Mono',
    stack: `'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace`,
  },
  {
    id: 'system-mono',
    label: 'System Mono',
    stack: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`,
  },
]

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'system',
  preset: 'violet',
  radius: 0.625,
  scale: 1,
  fontSize: 16,
  spacing: 0.25,
  fontSans: SANS_STACK,
  fontHeading: SANS_STACK,
  fontMono: MONO_STACK,
  shadow: 'default',
}

export const THEME_STORAGE_KEY = 'app-theme'
