import Dexie from 'dexie'
import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION } from '@/app/version'
import { createDatabase } from '@/db/database'
import { DataError, toDataError } from '@/domain/errors'
import { createSettingsRepository } from '@/repositories/settings'
import { createTaskRepository } from '@/repositories/tasks'
import { openTestDatabase } from './helpers'

describe('tasks', () => {
  it('creates, completes, restores and keeps a date-only due date', async () => {
    const database = openTestDatabase()
    const tasks = createTaskRepository(database)
    const created = await tasks.create({
      title: '  خرید نان  ',
      dueOn: '2026-10-11',
      dueTime: '09:30',
      priority: 'high',
    })

    expect(created.title).toBe('خرید نان')
    expect(created.dueOn).toBe('2026-10-11')
    expect(created.dueTime).toBe('09:30')
    expect(created.completedAt).toBeNull()

    const completed = await tasks.complete(created.id)
    expect(completed.completedAt).toEqual(expect.any(String))
    const activeAgain = await tasks.uncomplete(created.id)
    expect(activeAgain.completedAt).toBeNull()

    await tasks.softDelete(created.id)
    expect(await tasks.list()).toEqual([])
    await tasks.restore(created.id)
    expect(await tasks.list()).toHaveLength(1)
  })

  it('rejects an empty title, a datetime used as a due date, and a time without a date', async () => {
    const tasks = createTaskRepository(openTestDatabase())
    await expect(tasks.create({ title: '   ' })).rejects.toMatchObject({ code: 'TITLE_REQUIRED' })
    await expect(tasks.create({ title: 'کار', dueOn: '2026-10-11T00:00:00.000Z' })).rejects.toMatchObject({
      code: 'INVALID_DATE',
    })
    await expect(tasks.create({ title: 'کار', dueTime: '09:00' })).rejects.toMatchObject({ code: 'INVALID_TIME' })
  })

  it('reorders tasks and duplicates tags onto a new incomplete copy', async () => {
    const database = openTestDatabase()
    const tasks = createTaskRepository(database)
    const first = await tasks.create({ title: 'اول', sortOrder: 0 })
    const second = await tasks.create({ title: 'دوم', sortOrder: 1 })
    await database.tags.add({
      id: 'tag-1',
      name: 'خانه',
      color: 'olive',
      createdAt: '2026-10-11T00:00:00.000Z',
      updatedAt: '2026-10-11T00:00:00.000Z',
    })
    await tasks.setTags(first.id, ['tag-1'])
    await tasks.complete(first.id)
    const copy = await tasks.duplicate(first.id)
    expect(copy.id).not.toBe(first.id)
    expect(copy.completedAt).toBeNull()
    expect(await tasks.tagIds(copy.id)).toEqual(['tag-1'])

    await tasks.reorder([second.id, first.id])
    const ordered = (await tasks.list()).filter((task) => task.id === first.id || task.id === second.id)
    expect(ordered.map((task) => task.id)).toEqual([second.id, first.id])
  })

  it('keeps the task after the database is closed and opened again', async () => {
    const database = openTestDatabase()
    const created = await createTaskRepository(database).create({ title: 'یادداشت ماندگار' })
    const name = database.name
    database.close()
    const reopened = createDatabase(name)
    try {
      const again = await createTaskRepository(reopened).getById(created.id)
      expect(again?.title).toBe('یادداشت ماندگار')
      expect(reopened.verno).toBe(SCHEMA_VERSION)
    } finally {
      reopened.close()
    }
  })
})

describe('database errors', () => {
  it('maps quota and version failures without exposing stored content', () => {
    expect(toDataError(new Dexie.QuotaExceededError('full')).code).toBe('QUOTA')
    expect(toDataError(new Dexie.VersionError('mismatch')).code).toBe('VERSION')
    expect(toDataError(new DataError('NOT_FOUND')).code).toBe('NOT_FOUND')
    expect(toDataError(new Error('secret task title')).message).toBe('UNKNOWN')
  })

  it('opens the versioned schema', async () => {
    const database = openTestDatabase()
    await database.open()
    expect(database.verno).toBe(SCHEMA_VERSION)
    expect(database.tables.map((table) => table.name).sort()).toEqual([
      'appSettings',
      'focusSessions',
      'lists',
      'tags',
      'taskTags',
      'tasks',
    ])
  })
})

describe('settings', () => {
  it('stores a theme preference', async () => {
    const settings = createSettingsRepository(openTestDatabase())
    expect(await settings.get('theme')).toBeUndefined()
    await settings.set('theme', 'dark')
    expect(await settings.get('theme')).toBe('dark')
  })
})
