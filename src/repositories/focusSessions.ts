import type { RoznoDatabase } from '@/db/database'
import { DataError, guard } from '@/domain/errors'
import type { FocusSession, NewFocusSession } from '@/domain/types'
import { buildFocusSession } from '@/domain/validation'

export function createFocusRepository(database: RoznoDatabase) {
  return {
    async list(): Promise<FocusSession[]> {
      return guard(async () => {
        const rows = await database.focusSessions.toArray()
        return rows.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      })
    },

    async getById(id: string): Promise<FocusSession | undefined> {
      return guard(() => database.focusSessions.get(id))
    },

    async create(input: NewFocusSession): Promise<FocusSession> {
      return guard(() =>
        database.transaction('rw', database.focusSessions, database.tasks, async () => {
          const session = buildFocusSession(input)
          if (session.taskId) {
            const task = await database.tasks.get(session.taskId)
            if (!task || task.deletedAt) throw new DataError('NOT_FOUND')
          }
          await database.focusSessions.add(session)
          return session
        }),
      )
    },
  }
}

export type FocusRepository = ReturnType<typeof createFocusRepository>
