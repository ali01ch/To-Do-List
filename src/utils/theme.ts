import { THEME_MIRROR_KEY } from '@/app/version'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#f3f1eb',
  dark: '#121311',
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === 'system') return prefersDark ? 'dark' : 'light'
  return preference
}

export function readThemeMirror(): ThemePreference | null {
  try {
    const value = localStorage.getItem(THEME_MIRROR_KEY)
    return isThemePreference(value) ? value : null
  } catch {
    return null
  }
}

export function writeThemeMirror(theme: ThemePreference): void {
  try {
    localStorage.setItem(THEME_MIRROR_KEY, theme)
  } catch {
    // IndexedDB is still updated once the database is open.
  }
}

export function applyTheme(preference: ThemePreference, prefersDark = prefersDarkScheme()): void {
  const resolved = resolveTheme(preference, prefersDark)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.style.colorScheme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolved])
}

export function prefersDarkScheme(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
