import type { RoznoDatabase } from '@/db/database'
import { guard } from '@/domain/errors'
import type { SettingValue } from '@/domain/types'

export function createSettingsRepository(database: RoznoDatabase) {
  return {
    async get(key: string): Promise<SettingValue | undefined> {
      return guard(async () => {
        const row = await database.appSettings.get(key)
        return row?.value
      })
    },

    async set(key: string, value: SettingValue): Promise<void> {
      return guard(async () => {
        await database.appSettings.put({ key, value })
      })
    },

    async remove(key: string): Promise<void> {
      return guard(() => database.appSettings.delete(key))
    },
  }
}

export type SettingsRepository = ReturnType<typeof createSettingsRepository>
