import { describe, expect, it } from 'vitest'
import { createProjectRepository } from '@/repositories/projects'
import { createProjectTaskRepository } from '@/repositories/projectTasks'
import { compareProjectTasksByPriority, progressForProject } from '@/services/projectQuery'
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

  it('sorts project tasks by priority high to low', async () => {
    const db = openTestDatabase()
    const projects = createProjectRepository(db)
    const taskRepo = createProjectTaskRepository(db)
    const project = await projects.create({ name: 'مرتب‌سازی' })
    const low = await taskRepo.create({ projectId: project.id, title: 'کم', priority: 'low' })
    const high = await taskRepo.create({ projectId: project.id, title: 'زیاد', priority: 'high' })
    const none = await taskRepo.create({ projectId: project.id, title: 'بدون', priority: 'none' })
    const rows = await taskRepo.listByProject(project.id)
    const sorted = [...rows].sort(compareProjectTasksByPriority)
    expect(sorted.map((item) => item.id)).toEqual([high.id, low.id, none.id])
    expect(high.priority).toBe('high')
  })
})