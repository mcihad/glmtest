import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ThemeContext } from './theme-context'
import { DEFAULT_THEME, THEME_STORAGE_KEY } from './presets'
import { generateThemeCss } from './generate-css'
import type { ThemeConfig, ThemeContextValue, ThemeMode } from './types'

const THEME_STYLE_ID = 'app-theme'

function loadConfig(): ThemeConfig {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return DEFAULT_THEME
    return { ...DEFAULT_THEME, ...(JSON.parse(raw) as Partial<ThemeConfig>) }
  } catch {
    return DEFAULT_THEME
  }
}

function getSystemDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<ThemeConfig>(loadConfig)
  const [systemDark, setSystemDark] = useState<boolean>(getSystemDark)

  const resolvedMode: 'light' | 'dark' =
    config.mode === 'system' ? (systemDark ? 'dark' : 'light') : config.mode

  // Inject generated CSS into <style id="app-theme">.
  useLayoutEffect(() => {
    let style = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = THEME_STYLE_ID
      document.head.appendChild(style)
    }
    style.textContent = generateThemeCss(config)
  }, [config])

  // Apply dark class + color-scheme.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedMode === 'dark')
    root.style.colorScheme = resolvedMode
  }, [resolvedMode])

  // Live-subscribe to OS scheme when in system mode.
  useEffect(() => {
    if (config.mode !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [config.mode])

  // Persist config.
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config))
    } catch {
      /* ignore quota errors */
    }
  }, [config])

  const setConfig = useCallback((patch: Partial<ThemeConfig>) => {
    setConfigState((prev) => ({ ...prev, ...patch }))
  }, [])

  const setMode = useCallback(
    (mode: ThemeMode) => setConfig({ mode }),
    [setConfig],
  )

  const toggleMode = useCallback(() => {
    setConfigState((prev) => {
      const current =
        prev.mode === 'system'
          ? systemDark
            ? 'dark'
            : 'light'
          : prev.mode
      return { ...prev, mode: current === 'dark' ? 'light' : 'dark' }
    })
  }, [systemDark])

  const reset = useCallback(() => setConfigState(DEFAULT_THEME), [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      config,
      mode: config.mode,
      resolvedMode,
      setConfig,
      setMode,
      toggleMode,
      reset,
    }),
    [config, resolvedMode, setConfig, setMode, toggleMode, reset],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
