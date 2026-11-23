import type { ProjectTask } from '@/domain/types'

export function progressForProject(tasks: ProjectTask[], projectId: string): { done: number; total: number; percent: number } {
  const scoped = tasks.filter((task) => task.projectId === projectId && task.deletedAt === null)
  const total = scoped.length
  const done = scoped.filter((task) => task.completedAt !== null).length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return { done, total, percent }
}

export function tasksForProject(
  tasks: ProjectTask[],
  projectId: string,
  includeCompleted: boolean,
): ProjectTask[] {
  return tasks
    .filter(
      (task) =>
        task.projectId === projectId && task.deletedAt === null && (includeCompleted || task.completedAt === null),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
}