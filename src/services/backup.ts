import { APP_VERSION, SCHEMA_VERSION } from '@/app/version'
import { db, type RoznoDatabase } from '@/db/database'
import { DataError, toDataError } from '@/domain/errors'
import type { AppSetting, FocusSession, Tag, Task, TaskList, TaskTag } from '@/domain/types'

export const BACKUP_FORMAT = 'rozno-backup' as const

export interface RoznoBackup {
  format: typeof BACKUP_FORMAT
  appVersion: string
  schemaVersion: number
  exportedAt: string
  data: {
    tasks: Task[]
    lists: TaskList[]
    tags: Tag[]
    taskTags: TaskTag[]
    focusSessions: FocusSession[]
    appSettings: AppSetting[]
  }
}

export interface BackupSummary {
  tasks: number
  lists: number
  tags: number
  focusSessions: number
  settings: number
  exportedAt: string
  schemaVersion: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function exportBackup(database: RoznoDatabase = db): Promise<RoznoBackup> {
  try {
    const [tasks, lists, tags, taskTags, focusSessions, appSettings] = await Promise.all([
      database.tasks.toArray(),
      database.lists.toArray(),
      database.tags.toArray(),
      database.taskTags.toArray(),
      database.focusSessions.toArray(),
      database.appSettings.toArray(),
    ])
    return {
      format: BACKUP_FORMAT,
      appVersion: APP_VERSION,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: { tasks, lists, tags, taskTags, focusSessions, appSettings },
    }
  } catch (error) {
    throw toDataError(error)
  }
}

export function summarizeBackup(backup: RoznoBackup): BackupSummary {
  return {
    tasks: backup.data.tasks.length,
    lists: backup.data.lists.length,
    tags: backup.data.tags.length,
    focusSessions: backup.data.focusSessions.length,
    settings: backup.data.appSettings.length,
    exportedAt: backup.exportedAt,
    schemaVersion: backup.schemaVersion,
  }
}

export function parseBackup(raw: unknown): RoznoBackup {
  if (!isRecord(raw)) throw new DataError('UNKNOWN')
  if (raw.format !== BACKUP_FORMAT) throw new DataError('VERSION')
  if (typeof raw.schemaVersion !== 'number') throw new DataError('VERSION')
  if (raw.schemaVersion > SCHEMA_VERSION) throw new DataError('VERSION')
  if (!isRecord(raw.data)) throw new DataError('UNKNOWN')
  const data = raw.data
  for (const key of ['tasks', 'lists', 'tags', 'taskTags', 'focusSessions', 'appSettings'] as const) {
    if (!Array.isArray(data[key])) throw new DataError('UNKNOWN')
  }
  return {
    format: BACKUP_FORMAT,
    appVersion: typeof raw.appVersion === 'string' ? raw.appVersion : APP_VERSION,
    schemaVersion: raw.schemaVersion,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
    data: {
      tasks: data.tasks as Task[],
      lists: data.lists as TaskList[],
      tags: data.tags as Tag[],
      taskTags: data.taskTags as TaskTag[],
      focusSessions: data.focusSessions as FocusSession[],
      appSettings: data.appSettings as AppSetting[],
    },
  }
}

/** Replaces all local data with the backup contents in one transaction. */
async function withAllTables(database: RoznoDatabase, work: () => Promise<void>): Promise<void> {
  const tables = [
    database.tasks,
    database.lists,
    database.tags,
    database.taskTags,
    database.focusSessions,
    database.appSettings,
  ]
  await (database as unknown as { transaction: (mode: string, storeNames: unknown[], scope: () => Promise<void>) => Promise<void> }).transaction(
    'rw',
    tables,
    work,
  )
}

export async function importBackup(backup: RoznoBackup, database: RoznoDatabase = db): Promise<BackupSummary> {
  try {
    await withAllTables(database, async () => {
      await Promise.all([
        database.tasks.clear(),
        database.lists.clear(),
        database.tags.clear(),
        database.taskTags.clear(),
        database.focusSessions.clear(),
        database.appSettings.clear(),
      ])
      if (backup.data.lists.length) await database.lists.bulkPut(backup.data.lists as TaskList[])
      if (backup.data.tags.length) await database.tags.bulkPut(backup.data.tags as Tag[])
      if (backup.data.tasks.length) await database.tasks.bulkPut(backup.data.tasks as Task[])
      if (backup.data.taskTags.length) await database.taskTags.bulkPut(backup.data.taskTags as TaskTag[])
      if (backup.data.focusSessions.length) {
        await database.focusSessions.bulkPut(backup.data.focusSessions as FocusSession[])
      }
      if (backup.data.appSettings.length) {
        await database.appSettings.bulkPut(backup.data.appSettings as AppSetting[])
      }
    })
    return summarizeBackup(backup)
  } catch (error) {
    throw toDataError(error)
  }
}

export async function clearAllData(database: RoznoDatabase = db): Promise<void> {
  try {
    await withAllTables(database, async () => {
      await Promise.all([
        database.tasks.clear(),
        database.lists.clear(),
        database.tags.clear(),
        database.taskTags.clear(),
        database.focusSessions.clear(),
        database.appSettings.clear(),
      ])
    })
  } catch (error) {
    throw toDataError(error)
  }
}

export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
