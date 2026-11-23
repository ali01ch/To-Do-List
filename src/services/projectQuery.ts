import type { Priority, ProjectTask } from '@/domain/types'
import { PRIORITY_RANK } from '@/services/taskQuery'

export function progressForProject(tasks: ProjectTask[], projectId: string): { done: number; total: number; percent: number } {
  const scoped = tasks.filter((task) => task.projectId === projectId && task.deletedAt === null)
  const total = scoped.length
  const done = scoped.filter((task) => task.completedAt !== null).length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return { done, total, percent }
}

function effectivePriority(task: ProjectTask): Priority {
  return task.priority ?? 'none'
}

export function compareProjectTasksByPriority(left: ProjectTask, right: ProjectTask): number {
  const byPriority = PRIORITY_RANK[effectivePriority(left)] - PRIORITY_RANK[effectivePriority(right)]
  if (byPriority !== 0) return byPriority
  const byManual = left.sortOrder - right.sortOrder
  if (byManual !== 0) return byManual
  return left.createdAt.localeCompare(right.createdAt)
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
    .sort(compareProjectTasksByPriority)
}