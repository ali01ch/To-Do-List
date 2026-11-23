import Dexie, { type EntityTable, type Table } from 'dexie'
import { DB_NAME, SCHEMA_VERSION } from '@/app/version'
import type { AppSetting, FocusSession, Project, ProjectTask, Tag, Task, TaskList, TaskTag } from '@/domain/types'

export interface RoznoDatabase extends Dexie {
  tasks: EntityTable<Task, 'id'>
  lists: EntityTable<TaskList, 'id'>
  tags: EntityTable<Tag, 'id'>
  taskTags: Table<TaskTag, [string, string]>
  focusSessions: EntityTable<FocusSession, 'id'>
  appSettings: EntityTable<AppSetting, 'key'>
  projects: EntityTable<Project, 'id'>
  projectTasks: EntityTable<ProjectTask, 'id'>
}

/**
 * Version 1 is the initial local schema.
 * Adding or renaming an index later requires a new Dexie version.
 * Nullable fields are not relied on for existence queries.
 */
const BASE_STORES = {
  tasks: 'id, listId, dueOn, priority, completedAt, updatedAt, sortOrder, reminderAt',
  lists: 'id, sortOrder, archivedAt',
  tags: 'id, name',
  taskTags: '[taskId+tagId], taskId, tagId',
  focusSessions: 'id, taskId, startedAt, status',
  appSettings: 'key',
} as const

const STORES_V2 = {
  ...BASE_STORES,
  projects: 'id, sortOrder, archivedAt, targetOn',
  projectTasks: 'id, projectId, completedAt, sortOrder, updatedAt',
} as const

const STORES_V3 = {
  ...BASE_STORES,
  projects: 'id, sortOrder, archivedAt, targetOn',
  projectTasks: 'id, projectId, priority, completedAt, sortOrder, updatedAt',
} as const

export function createDatabase(name = DB_NAME): RoznoDatabase {
  const database = new Dexie(name) as RoznoDatabase
  database.version(1).stores(BASE_STORES)
  database.version(2).stores(STORES_V2)
  database
    .version(SCHEMA_VERSION)
    .stores(STORES_V3)
    .upgrade(async (transaction) => {
      await transaction
        .table('projectTasks')
        .toCollection()
        .modify((task: ProjectTask) => {
          if (task.priority === undefined) task.priority = 'none'
        })
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
