import { PALETTE_MIRROR_KEY, THEME_MIRROR_KEY } from '@/app/version'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
export type ColorPalette = 'green' | 'rose'

const THEME_COLORS: Record<ColorPalette, Record<ResolvedTheme, string>> = {
  green: {
    light: '#1a7a4c',
    dark: '#0c1511',
  },
  rose: {
    light: '#c45c7a',
    dark: '#160f12',
  },
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function isColorPalette(value: unknown): value is ColorPalette {
  return value === 'green' || value === 'rose'
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

export function readPaletteMirror(): ColorPalette | null {
  try {
    const value = localStorage.getItem(PALETTE_MIRROR_KEY)
    return isColorPalette(value) ? value : null
  } catch {
    return null
  }
}

export function writePaletteMirror(palette: ColorPalette): void {
  try {
    localStorage.setItem(PALETTE_MIRROR_KEY, palette)
  } catch {
    // IndexedDB is still updated once the database is open.
  }
}

function readDomPalette(): ColorPalette {
  return document.documentElement.classList.contains('palette-rose') ? 'rose' : 'green'
}

function setThemeColor(resolved: ResolvedTheme, palette: ColorPalette): void {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[palette][resolved])
}

export function applyTheme(
  preference: ThemePreference,
  prefersDark = prefersDarkScheme(),
  palette = readDomPalette(),
): void {
  const resolved = resolveTheme(preference, prefersDark)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.style.colorScheme = resolved
  setThemeColor(resolved, palette)
}

export function applyPalette(
  palette: ColorPalette,
  preference: ThemePreference = 'system',
  prefersDark = prefersDarkScheme(),
): void {
  document.documentElement.classList.toggle('palette-rose', palette === 'rose')
  applyTheme(preference, prefersDark, palette)
}

export function prefersDarkScheme(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
