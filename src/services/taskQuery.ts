import type { Priority, Task } from '@/domain/types'
import { addDays, todayDueOn } from '@/utils/dates'
import { normalizeDigits } from '@/utils/digits'

export interface TaskBuckets {
  overdue: Task[]
  today: Task[]
  completedToday: Task[]
}

export interface TaskFilter {
  search: string
  status: 'active' | 'completed' | 'all'
  priority: Priority | 'any'
  listId: string | 'any'
  tagIds: string[]
  due: 'any' | 'overdue' | 'today' | 'upcoming' | 'none'
}

export type TaskSort = 'manual' | 'due' | 'priority' | 'title'
export type CompletedRange = 'today' | 'week' | 'month' | 'all'

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2, none: 3 }

export function localDateFromIso(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return todayDueOn(date)
}

export function isOpen(task: Task): boolean {
  return task.deletedAt === null && task.completedAt === null
}

function bySchedule(left: Task, right: Task): number {
  const date = (left.dueOn ?? '9999-99-99').localeCompare(right.dueOn ?? '9999-99-99')
  if (date !== 0) return date
  const time = (left.dueTime ?? '99:99').localeCompare(right.dueTime ?? '99:99')
  if (time !== 0) return time
  return left.sortOrder - right.sortOrder || left.createdAt.localeCompare(right.createdAt)
}

export function todayBuckets(tasks: Task[], today: string): TaskBuckets {
  const visible = tasks.filter((task) => task.deletedAt === null)
  return {
    overdue: visible.filter((task) => isOpen(task) && task.dueOn !== null && task.dueOn < today).sort(bySchedule),
    today: visible.filter((task) => isOpen(task) && task.dueOn === today).sort(bySchedule),
    completedToday: visible
      .filter((task) => task.completedAt !== null && localDateFromIso(task.completedAt) === today)
      .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? '')),
  }
}

export function upcomingTasks(tasks: Task[], today: string): Task[] {
  return tasks.filter((task) => isOpen(task) && task.dueOn !== null && task.dueOn > today).sort(bySchedule)
}

export function inboxTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => isOpen(task) && task.dueOn === null)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.createdAt.localeCompare(right.createdAt))
}

export function groupByDueOn(tasks: Task[]): { dueOn: string; tasks: Task[] }[] {
  const groups = new Map<string, Task[]>()
  for (const task of tasks) {
    if (!task.dueOn) continue
    const group = groups.get(task.dueOn) ?? []
    group.push(task)
    groups.set(task.dueOn, group)
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dueOn, grouped]) => ({ dueOn, tasks: grouped }))
}

function matchesSearch(task: Task, search: string): boolean {
  const needle = normalizeDigits(search).trim().toLocaleLowerCase('fa')
  if (!needle) return true
  const haystack = normalizeDigits(`${task.title}\n${task.description}\n${task.notes}`).toLocaleLowerCase('fa')
  return haystack.includes(needle)
}

export function filterTasks(
  tasks: Task[],
  filter: TaskFilter,
  tagsByTask: Map<string, string[]>,
  today: string,
): Task[] {
  return tasks.filter((task) => {
    if (task.deletedAt) return false
    if (filter.status === 'active' && task.completedAt) return false
    if (filter.status === 'completed' && !task.completedAt) return false
    if (filter.priority !== 'any' && task.priority !== filter.priority) return false
    if (filter.listId !== 'any' && task.listId !== filter.listId) return false
    if (filter.tagIds.length > 0) {
      const tags = tagsByTask.get(task.id) ?? []
      if (!filter.tagIds.every((tagId) => tags.includes(tagId))) return false
    }
    if (filter.due === 'none' && task.dueOn !== null) return false
    if (filter.due === 'today' && task.dueOn !== today) return false
    if (filter.due === 'overdue' && !(task.dueOn !== null && task.dueOn < today && !task.completedAt)) return false
    if (filter.due === 'upcoming' && !(task.dueOn !== null && task.dueOn > today)) return false
    return matchesSearch(task, filter.search)
  })
}

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const copy = [...tasks]
  if (sort === 'due') return copy.sort(bySchedule)
  if (sort === 'priority') {
    return copy.sort(
      (left, right) => PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] || bySchedule(left, right),
    )
  }
  if (sort === 'title') return copy.sort((left, right) => left.title.localeCompare(right.title, 'fa'))
  return copy.sort((left, right) => left.sortOrder - right.sortOrder || left.createdAt.localeCompare(right.createdAt))
}

export function completedInRange(tasks: Task[], range: CompletedRange, today: string): Task[] {
  return tasks
    .filter((task) => {
      if (!task.completedAt || task.deletedAt) return false
      if (range === 'all') return true
      const day = localDateFromIso(task.completedAt)
      if (!day) return false
      if (range === 'today') return day === today
      const start = addDays(today, range === 'week' ? -6 : -29)
      return day >= start && day <= today
    })
    .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? ''))
}

export function tasksForList(tasks: Task[], listId: string, includeCompleted: boolean): Task[] {
  return sortTasks(
    tasks.filter((task) => task.listId === listId && task.deletedAt === null && (includeCompleted || !task.completedAt)),
    'manual',
  )
}

export function tasksOnDay(tasks: Task[], dueOn: string): Task[] {
  return tasks.filter((task) => task.deletedAt === null && task.dueOn === dueOn).sort(bySchedule)
}
