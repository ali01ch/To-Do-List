import type { RoznoDatabase } from '@/db/database'
import { DataError, guard } from '@/domain/errors'
import type { NewTaskList, TaskList, TaskListPatch } from '@/domain/types'
import { buildList, mergeList } from '@/domain/validation'
import { nowIso } from '@/utils/dates'

export function createListRepository(database: RoznoDatabase) {
  return {
    async list(): Promise<TaskList[]> {
      return guard(async () => {
        const rows = await database.lists.toArray()
        return rows.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
      })
    },

    async getById(id: string): Promise<TaskList | undefined> {
      return guard(() => database.lists.get(id))
    },

    async create(input: NewTaskList): Promise<TaskList> {
      return guard(async () => {
        const list = buildList(input)
        await database.lists.add(list)
        return list
      })
    },

    async update(id: string, patch: TaskListPatch): Promise<TaskList> {
      return guard(async () => {
        const current = await database.lists.get(id)
        if (!current) throw new DataError('NOT_FOUND')
        const next = mergeList(current, patch)
        await database.lists.put(next)
        return next
      })
    },

    async setArchived(id: string, archived: boolean): Promise<TaskList> {
      return guard(async () => {
        const current = await database.lists.get(id)
        if (!current) throw new DataError('NOT_FOUND')
        const next = { ...current, archivedAt: archived ? nowIso() : null, updatedAt: nowIso() }
        await database.lists.put(next)
        return next
      })
    },

    async reorder(ids: string[]): Promise<void> {
      return guard(() =>
        database.transaction('rw', database.lists, async () => {
          const now = nowIso()
          for (let index = 0; index < ids.length; index += 1) {
            const id = ids[index]
            if (!id) throw new DataError('NOT_FOUND')
            const updated = await database.lists.update(id, { sortOrder: index, updatedAt: now })
            if (updated === 0) throw new DataError('NOT_FOUND')
          }
        }),
      )
    },

    /** Removes the list and detaches its tasks in one transaction. Tasks stay. */
    async remove(id: string): Promise<void> {
      return guard(() =>
        database.transaction('rw', database.lists, database.tasks, async () => {
          const existing = await database.lists.get(id)
          if (!existing) throw new DataError('NOT_FOUND')
          await database.tasks.where('listId').equals(id).modify({ listId: null, updatedAt: nowIso() })
          await database.lists.delete(id)
        }),
      )
    },
  }
}

export type ListRepository = ReturnType<typeof createListRepository>
