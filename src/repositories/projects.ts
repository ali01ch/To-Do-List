import type { RoznoDatabase } from '@/db/database'
import { DataError, guard } from '@/domain/errors'
import type { NewProject, Project, ProjectPatch } from '@/domain/types'
import { buildProject, mergeProject } from '@/domain/validation'
import { nowIso } from '@/utils/dates'

export function createProjectRepository(database: RoznoDatabase) {
  return {
    async list(): Promise<Project[]> {
      return guard(async () => {
        const rows = await database.projects.toArray()
        return rows.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
      })
    },

    async getById(id: string): Promise<Project | undefined> {
      return guard(() => database.projects.get(id))
    },

    async create(input: NewProject): Promise<Project> {
      return guard(async () => {
        const project = buildProject(input)
        await database.projects.add(project)
        return project
      })
    },

    async update(id: string, patch: ProjectPatch): Promise<Project> {
      return guard(async () => {
        const current = await database.projects.get(id)
        if (!current) throw new DataError('NOT_FOUND')
        const next = mergeProject(current, patch)
        await database.projects.put(next)
        return next
      })
    },

    async setArchived(id: string, archived: boolean): Promise<Project> {
      return guard(async () => {
        const current = await database.projects.get(id)
        if (!current) throw new DataError('NOT_FOUND')
        const next = { ...current, archivedAt: archived ? nowIso() : null, updatedAt: nowIso() }
        await database.projects.put(next)
        return next
      })
    },

    async remove(id: string): Promise<void> {
      return guard(() =>
        database.transaction('rw', database.projects, database.projectTasks, async () => {
          const existing = await database.projects.get(id)
          if (!existing) throw new DataError('NOT_FOUND')
          await database.projectTasks.where('projectId').equals(id).delete()
          await database.projects.delete(id)
        }),
      )
    },
  }
}

export type ProjectRepository = ReturnType<typeof createProjectRepository>