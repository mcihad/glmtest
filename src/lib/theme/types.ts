export type ThemeMode = 'light' | 'dark' | 'system'
export type ShadowStrength = 'none' | 'soft' | 'default' | 'strong'

export interface ColorTokens {
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  ring: string
}

export interface ColorPreset {
  id: string
  label: string
  swatch: string
  hue: number
  light: ColorTokens
  dark: ColorTokens
}

export interface ThemeConfig {
  mode: ThemeMode
  preset: string
  radius: number
  scale: number
  fontSize: number
  spacing: number
  fontSans: string
  fontHeading: string
  fontMono: string
  shadow: ShadowStrength
}

export interface ThemeContextValue {
  config: ThemeConfig
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  setConfig: (patch: Partial<ThemeConfig>) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  reset: () => void
}
