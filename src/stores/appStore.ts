import { defineStore } from 'pinia'
import { ref } from 'vue'
import { openDatabase } from '@/db/database'
import { toDataError, type DataErrorCode } from '@/domain/errors'
import { SETTING_KEYS } from '@/domain/types'
import { settingsRepository } from '@/repositories/container'
import { readStorageEstimate, type StorageEstimate } from '@/services/storageEstimate'
import {
  applyTheme,
  isThemePreference,
  readThemeMirror,
  writeThemeMirror,
  type ThemePreference,
} from '@/utils/theme'

export const useAppStore = defineStore('app', () => {
  const dbStatus = ref<'opening' | 'ready' | 'error'>('opening')
  const dbError = ref<DataErrorCode | null>(null)
  const theme = ref<ThemePreference>(readThemeMirror() ?? 'system')
  const storage = ref<StorageEstimate | null>(null)
  let themeTouched = false
  let systemBound = false

  function bindSystemTheme(): void {
    if (systemBound || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    systemBound = true
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') applyTheme('system')
    })
  }

  async function hydrateTheme(): Promise<void> {
    const stored = await settingsRepository.get(SETTING_KEYS.theme)
    if (!themeTouched && isThemePreference(stored)) {
      theme.value = stored
      writeThemeMirror(stored)
      applyTheme(stored)
      return
    }
    if (themeTouched) await settingsRepository.set(SETTING_KEYS.theme, theme.value)
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
      await hydrateTheme()
      await refreshStorage()
    } catch (error) {
      const mapped = toDataError(error)
      dbStatus.value = 'error'
      dbError.value = mapped.code
    }
  }

  async function init(): Promise<void> {
    bindSystemTheme()
    applyTheme(theme.value)
    await connect()
  }

  async function retry(): Promise<void> {
    await connect()
  }

  async function setTheme(next: ThemePreference): Promise<void> {
    themeTouched = true
    theme.value = next
    writeThemeMirror(next)
    applyTheme(next)
    if (dbStatus.value !== 'ready') return
    try {
      await settingsRepository.set(SETTING_KEYS.theme, next)
    } catch (error) {
      const mapped = toDataError(error)
      dbStatus.value = 'error'
      dbError.value = mapped.code
    }
  }

  return { dbStatus, dbError, theme, storage, init, retry, setTheme, refreshStorage }
})
