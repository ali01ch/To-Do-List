import type { RoznoDatabase } from '@/db/database'
import { DataError, guard } from '@/domain/errors'
import type { Task, TaskPatch, NewTask } from '@/domain/types'
import { buildTask, mergeTask } from '@/domain/validation'
import { nowIso } from '@/utils/dates'
import { createId } from '@/utils/id'

export function createTaskRepository(database: RoznoDatabase) {
  return {
    async list(options?: { includeDeleted?: boolean }): Promise<Task[]> {
      return guard(async () => {
        const rows = await database.tasks.toArray()
        return rows
          .filter((task) => options?.includeDeleted || task.deletedAt === null)
          .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
      })
    },

    async getById(id: string): Promise<Task | undefined> {
      return guard(() => database.tasks.get(id))
    },

    async create(input: NewTask): Promise<Task> {
      return guard(async () => {
        const task = buildTask(input)
        await database.transaction('rw', database.tasks, database.lists, async () => {
          if (task.listId) {
            const list = await database.lists.get(task.listId)
            if (!list) throw new DataError('LIST_NOT_FOUND')
          }
          await database.tasks.add(task)
        })
        return task
      })
    },

    async update(id: string, patch: TaskPatch): Promise<Task> {
      return guard(() =>
        database.transaction('rw', database.tasks, database.lists, async () => {
          const current = await database.tasks.get(id)
          if (!current || current.deletedAt) throw new DataError('NOT_FOUND')
          const next = mergeTask(current, patch)
          if (next.listId && next.listId !== current.listId) {
            const list = await database.lists.get(next.listId)
            if (!list) throw new DataError('LIST_NOT_FOUND')
          }
          await database.tasks.put(next)
          return next
        }),
      )
    },

    async complete(id: string): Promise<Task> {
      return guard(() =>
        database.transaction('rw', database.tasks, async () => {
          const current = await database.tasks.get(id)
          if (!current || current.deletedAt) throw new DataError('NOT_FOUND')
          if (current.completedAt) return current
          const next = { ...current, completedAt: nowIso(), updatedAt: nowIso() }
          await database.tasks.put(next)
          return next
        }),
      )
    },

    async uncomplete(id: string): Promise<Task> {
      return guard(() =>
        database.transaction('rw', database.tasks, async () => {
          const current = await database.tasks.get(id)
          if (!current || current.deletedAt) throw new DataError('NOT_FOUND')
          if (!current.completedAt) return current
          const next = { ...current, completedAt: null, updatedAt: nowIso() }
          await database.tasks.put(next)
          return next
        }),
      )
    },

    async softDelete(id: string): Promise<Task> {
      return guard(() =>
        database.transaction('rw', database.tasks, async () => {
          const current = await database.tasks.get(id)
          if (!current) throw new DataError('NOT_FOUND')
          if (current.deletedAt) return current
          const next = { ...current, deletedAt: nowIso(), updatedAt: nowIso() }
          await database.tasks.put(next)
          return next
        }),
      )
    },

    async restore(id: string): Promise<Task> {
      return guard(() =>
        database.transaction('rw', database.tasks, async () => {
          const current = await database.tasks.get(id)
          if (!current) throw new DataError('NOT_FOUND')
          if (!current.deletedAt) return current
          const next = { ...current, deletedAt: null, updatedAt: nowIso() }
          await database.tasks.put(next)
          return next
        }),
      )
    },

    async purge(id: string): Promise<void> {
      return guard(() =>
        database.transaction('rw', database.tasks, database.taskTags, async () => {
          await database.taskTags.where('taskId').equals(id).delete()
          await database.tasks.delete(id)
        }),
      )
    },

    async duplicate(id: string): Promise<Task> {
      return guard(() =>
        database.transaction('rw', database.tasks, database.taskTags, async () => {
          const source = await database.tasks.get(id)
          if (!source || source.deletedAt) throw new DataError('NOT_FOUND')
          const now = nowIso()
          const copy: Task = {
            ...source,
            id: createId(),
            completedAt: null,
            deletedAt: null,
            createdAt: now,
            updatedAt: now,
            sortOrder: Date.now(),
          }
          const links = await database.taskTags.where('taskId').equals(id).toArray()
          await database.tasks.add(copy)
          if (links.length > 0) {
            await database.taskTags.bulkAdd(links.map((link) => ({ taskId: copy.id, tagId: link.tagId })))
          }
          return copy
        }),
      )
    },

    async reorder(ids: string[]): Promise<void> {
      return guard(() =>
        database.transaction('rw', database.tasks, async () => {
          const now = nowIso()
          for (let index = 0; index < ids.length; index += 1) {
            const id = ids[index]
            if (!id) throw new DataError('NOT_FOUND')
            const updated = await database.tasks.update(id, { sortOrder: index, updatedAt: now })
            if (updated === 0) throw new DataError('NOT_FOUND')
          }
        }),
      )
    },

    async tagIds(taskId: string): Promise<string[]> {
      return guard(async () => {
        const links = await database.taskTags.where('taskId').equals(taskId).toArray()
        return links.map((link) => link.tagId)
      })
    },

    async setTags(taskId: string, tagIds: string[]): Promise<void> {
      return guard(() =>
        database.transaction('rw', database.tasks, database.tags, database.taskTags, async () => {
          const task = await database.tasks.get(taskId)
          if (!task || task.deletedAt) throw new DataError('NOT_FOUND')
          const unique = [...new Set(tagIds)]
          const found = await database.tags.bulkGet(unique)
          if (found.some((tag) => !tag)) throw new DataError('TAG_NOT_FOUND')
          await database.taskTags.where('taskId').equals(taskId).delete()
          if (unique.length > 0) {
            await database.taskTags.bulkAdd(unique.map((tagId) => ({ taskId, tagId })))
          }
          await database.tasks.update(taskId, { updatedAt: nowIso() })
        }),
      )
    },
  }
}

export type TaskRepository = ReturnType<typeof createTaskRepository>
