import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION } from '@/app/version'
import { createListRepository } from '@/repositories/lists'
import { createSettingsRepository } from '@/repositories/settings'
import { createTaskRepository } from '@/repositories/tasks'
import { clearAllData, exportBackup, importBackup, parseBackup, summarizeBackup } from '@/services/backup'
import { openTestDatabase } from './helpers'

describe('backup', () => {
  it('exports and restores local data, and rejects incompatible files', async () => {
    const source = openTestDatabase()
    const list = await createListRepository(source).create({ name: 'خانه' })
    await createTaskRepository(source).create({ title: 'کار نمونه', listId: list.id, dueOn: '2026-10-12' })
    await createSettingsRepository(source).set('theme', 'dark')

    const backup = await exportBackup(source)
    expect(backup.format).toBe('rozno-backup')
    expect(backup.schemaVersion).toBe(SCHEMA_VERSION)
    expect(summarizeBackup(backup).tasks).toBe(1)

    const target = openTestDatabase()
    await createTaskRepository(target).create({ title: 'باید پاک شود' })
    await importBackup(backup, target)
    expect(await target.tasks.count()).toBe(1)
    expect((await target.tasks.toArray())[0]?.title).toBe('کار نمونه')
    expect((await target.appSettings.get('theme'))?.value).toBe('dark')

    await clearAllData(target)
    expect(await target.tasks.count()).toBe(0)
    expect(() => parseBackup({ format: 'other' })).toThrow()
    expect(() => parseBackup({ format: 'rozno-backup', schemaVersion: 999, data: {} })).toThrow()
  })
})
