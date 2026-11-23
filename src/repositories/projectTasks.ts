import type { RoznoDatabase } from '@/db/database'
import { DataError, guard } from '@/domain/errors'
import type { NewProjectTask, ProjectTask, ProjectTaskPatch } from '@/domain/types'
import { buildProjectTask, mergeProjectTask } from '@/domain/validation'
import { nowIso } from '@/utils/dates'

export function createProjectTaskRepository(database: RoznoDatabase) {
  return {
    async list(options?: { includeDeleted?: boolean }): Promise<ProjectTask[]> {
      return guard(async () => {
        const rows = await database.projectTasks.toArray()
        return rows
          .filter((task) => options?.includeDeleted || task.deletedAt === null)
          .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
      })
    },

    async listByProject(projectId: string, includeCompleted = true): Promise<ProjectTask[]> {
      return guard(async () => {
        const rows = await database.projectTasks.where('projectId').equals(projectId).toArray()
        return rows
          .filter((task) => task.deletedAt === null && (includeCompleted || task.completedAt === null))
          .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
      })
    },

    async create(input: NewProjectTask): Promise<ProjectTask> {
      return guard(() =>
        database.transaction('rw', database.projects, database.projectTasks, async () => {
          const project = await database.projects.get(input.projectId)
          if (!project) throw new DataError('NOT_FOUND')
          const task = buildProjectTask(input)
          await database.projectTasks.add(task)
          return task
        }),
      )
    },

    async update(id: string, patch: ProjectTaskPatch): Promise<ProjectTask> {
      return guard(async () => {
        const current = await database.projectTasks.get(id)
        if (!current || current.deletedAt) throw new DataError('NOT_FOUND')
        const next = mergeProjectTask(current, patch)
        await database.projectTasks.put(next)
        return next
      })
    },

    async complete(id: string): Promise<ProjectTask> {
      return guard(async () => {
        const current = await database.projectTasks.get(id)
        if (!current || current.deletedAt) throw new DataError('NOT_FOUND')
        if (current.completedAt) return current
        const next = { ...current, completedAt: nowIso(), updatedAt: nowIso() }
        await database.projectTasks.put(next)
        return next
      })
    },

    async uncomplete(id: string): Promise<ProjectTask> {
      return guard(async () => {
        const current = await database.projectTasks.get(id)
        if (!current || current.deletedAt) throw new DataError('NOT_FOUND')
        if (!current.completedAt) return current
        const next = { ...current, completedAt: null, updatedAt: nowIso() }
        await database.projectTasks.put(next)
        return next
      })
    },

    async softDelete(id: string): Promise<ProjectTask> {
      return guard(async () => {
        const current = await database.projectTasks.get(id)
        if (!current || current.deletedAt) throw new DataError('NOT_FOUND')
        const next = { ...current, deletedAt: nowIso(), updatedAt: nowIso() }
        await database.projectTasks.put(next)
        return next
      })
    },

    async restore(id: string): Promise<ProjectTask> {
      return guard(async () => {
        const current = await database.projectTasks.get(id)
        if (!current) throw new DataError('NOT_FOUND')
        const next = { ...current, deletedAt: null, updatedAt: nowIso() }
        await database.projectTasks.put(next)
        return next
      })
    },
  }
}

export type ProjectTaskRepository = ReturnType<typeof createProjectTaskRepository>