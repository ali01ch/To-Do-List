import { defineStore } from 'pinia'
import { ref } from 'vue'
import { openDatabase } from '@/db/database'
import { toDataError, type DataErrorCode } from '@/domain/errors'
import { SETTING_KEYS } from '@/domain/types'
import { settingsRepository } from '@/repositories/container'
import { readStorageEstimate, type StorageEstimate } from '@/services/storageEstimate'
import {
  applyPalette,
  applyTheme,
  isColorPalette,
  isThemePreference,
  readPaletteMirror,
  readThemeMirror,
  writePaletteMirror,
  writeThemeMirror,
  type ColorPalette,
  type ThemePreference,
} from '@/utils/theme'

export const useAppStore = defineStore('app', () => {
  const dbStatus = ref<'opening' | 'ready' | 'error'>('opening')
  const dbError = ref<DataErrorCode | null>(null)
  const theme = ref<ThemePreference>(readThemeMirror() ?? 'system')
  const palette = ref<ColorPalette>(readPaletteMirror() ?? 'green')
  const storage = ref<StorageEstimate | null>(null)
  let themeTouched = false
  let paletteTouched = false
  let systemBound = false

  function bindSystemTheme(): void {
    if (systemBound || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    systemBound = true
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') applyTheme(theme.value, undefined, palette.value)
    })
  }

  async function hydrateAppearance(): Promise<void> {
    const [storedTheme, storedPalette] = await Promise.all([
      settingsRepository.get(SETTING_KEYS.theme),
      settingsRepository.get(SETTING_KEYS.colorPalette),
    ])

    if (!themeTouched && isThemePreference(storedTheme)) {
      theme.value = storedTheme
      writeThemeMirror(storedTheme)
    } else if (themeTouched) {
      await settingsRepository.set(SETTING_KEYS.theme, theme.value)
    }

    if (!paletteTouched && isColorPalette(storedPalette)) {
      palette.value = storedPalette
      writePaletteMirror(storedPalette)
    } else if (paletteTouched) {
      await settingsRepository.set(SETTING_KEYS.colorPalette, palette.value)
    }

    applyPalette(palette.value, theme.value)
  }

  async function refreshStorage(): Promise<void> {
    storage.value = await readStorageEstimate()
  }

  async function connect(): Promise<void> {
    dbStatus.value = 'opening'
    dbError.value = null
    try {
      await openDatabase()
      dbStatus.value = 'ready'
      await hydrateAppearance()
      await refreshStorage()
    } catch (error) {
      const mapped = toDataError(error)
      dbStatus.value = 'error'
      dbError.value = mapped.code
    }
  }

  async function init(): Promise<void> {
    bindSystemTheme()
    applyPalette(palette.value, theme.value)
    await connect()
  }

  async function retry(): Promise<void> {
    await connect()
  }

  async function setTheme(next: ThemePreference): Promise<void> {
    themeTouched = true
    theme.value = next
    writeThemeMirror(next)
    applyTheme(next, undefined, palette.value)
    if (dbStatus.value !== 'ready') return
    try {
      await settingsRepository.set(SETTING_KEYS.theme, next)
    } catch (error) {
      const mapped = toDataError(error)
      dbStatus.value = 'error'
      dbError.value = mapped.code
    }
  }

  async function setPalette(next: ColorPalette): Promise<void> {
    paletteTouched = true
    palette.value = next
    writePaletteMirror(next)
    applyPalette(next, theme.value)
    if (dbStatus.value !== 'ready') return
    try {
      await settingsRepository.set(SETTING_KEYS.colorPalette, next)
    } catch (error) {
      const mapped = toDataError(error)
      dbStatus.value = 'error'
      dbError.value = mapped.code
    }
  }

  async function togglePalette(): Promise<void> {
    await setPalette(palette.value === 'green' ? 'rose' : 'green')
  }

  return {
    dbStatus,
    dbError,
    theme,
    palette,
    storage,
    init,
    retry,
    setTheme,
    setPalette,
    togglePalette,
    refreshStorage,
  }
})
