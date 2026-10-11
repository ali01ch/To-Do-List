import Dexie, { type EntityTable, type Table } from 'dexie'
import { DB_NAME, SCHEMA_VERSION } from '@/app/version'
import type { AppSetting, FocusSession, Tag, Task, TaskList, TaskTag } from '@/domain/types'

export interface RoznoDatabase extends Dexie {
  tasks: EntityTable<Task, 'id'>
  lists: EntityTable<TaskList, 'id'>
  tags: EntityTable<Tag, 'id'>
  taskTags: Table<TaskTag, [string, string]>
  focusSessions: EntityTable<FocusSession, 'id'>
  appSettings: EntityTable<AppSetting, 'key'>
}

/**
 * Version 1 is the initial local schema.
 * Adding or renaming an index later requires a new Dexie version.
 * Nullable fields are not relied on for existence queries.
 */
export function createDatabase(name = DB_NAME): RoznoDatabase {
  const database = new Dexie(name) as RoznoDatabase
  database.version(SCHEMA_VERSION).stores({
    tasks: 'id, listId, dueOn, priority, completedAt, updatedAt, sortOrder, reminderAt',
    lists: 'id, sortOrder, archivedAt',
    tags: 'id, name',
    taskTags: '[taskId+tagId], taskId, tagId',
    focusSessions: 'id, taskId, startedAt, status',
    appSettings: 'key',
  })
  return database
}

const holder = globalThis as { __roznoDb?: RoznoDatabase }

export const db = holder.__roznoDb ?? createDatabase(DB_NAME)
holder.__roznoDb = db

let opening: Promise<void> | null = null

export function openDatabase(): Promise<void> {
  if (!opening) {
    opening = db.open().then(() => undefined).catch((error: unknown) => {
      opening = null
      throw error
    })
  }
  return opening
}
