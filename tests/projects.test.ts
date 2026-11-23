import { describe, expect, it } from 'vitest'
import { createProjectRepository } from '@/repositories/projects'
import { createProjectTaskRepository } from '@/repositories/projectTasks'
import { progressForProject } from '@/services/projectQuery'
import { openTestDatabase } from './helpers'

describe('projects', () => {
  it('creates projects with tasks and tracks completion progress', async () => {
    const db = openTestDatabase()
    const projects = createProjectRepository(db)
    const tasks = createProjectTaskRepository(db)

    const project = await projects.create({ name: 'طراحی اپ' })
    const first = await tasks.create({ projectId: project.id, title: 'وایرفریم' })
    const second = await tasks.create({ projectId: project.id, title: 'پیاده‌سازی' })
    await tasks.complete(first.id)

    const rows = await tasks.list()
    expect(rows).toHaveLength(2)
    const stats = progressForProject(rows, project.id)
    expect(stats.done).toBe(1)
    expect(stats.total).toBe(2)
    expect(stats.percent).toBe(50)

    await projects.remove(project.id)
    expect(await db.projectTasks.where('projectId').equals(project.id).count()).toBe(0)
    expect(second.id).toBeTruthy()
  })
})