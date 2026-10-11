import type { FocusSession, Task } from '@/domain/types'
import { localDateFromIso } from '@/services/taskQuery'
import { addDays } from '@/utils/dates'

export interface DayCount {
  dueOn: string
  completed: number
}

export interface StatsSummary {
  completedTotal: number
  completedToday: number
  openToday: number
  overdue: number
  completedWeek: number
  focusMinutesToday: number
  focusMinutesWeek: number
  days: DayCount[]
}

function minutesOf(sessions: FocusSession[], from: string, today: string): number {
  const total = sessions.reduce((sum, session) => {
    if (session.kind !== 'focus' || session.status !== 'completed') return sum
    const day = localDateFromIso(session.endedAt ?? session.startedAt)
    if (!day || day < from || day > today) return sum
    return sum + session.durationMs
  }, 0)
  return Math.round(total / 60000)
}

export function summarize(tasks: Task[], sessions: FocusSession[], today: string): StatsSummary {
  const visible = tasks.filter((task) => task.deletedAt === null)
  const completedToday = visible.filter(
    (task) => task.completedAt !== null && localDateFromIso(task.completedAt) === today,
  ).length
  const weekStart = addDays(today, -6)
  const days: DayCount[] = []
  for (let offset = 6; offset >= 0; offset -= 1) {
    const dueOn = addDays(today, -offset)
    days.push({
      dueOn,
      completed: visible.filter((task) => task.completedAt !== null && localDateFromIso(task.completedAt) === dueOn)
        .length,
    })
  }
  return {
    completedTotal: visible.filter((task) => task.completedAt !== null).length,
    completedToday,
    openToday: visible.filter((task) => task.completedAt === null && task.dueOn === today).length,
    overdue: visible.filter((task) => task.completedAt === null && task.dueOn !== null && task.dueOn < today).length,
    completedWeek: visible.filter((task) => {
      if (!task.completedAt) return false
      const day = localDateFromIso(task.completedAt)
      return day !== null && day >= weekStart && day <= today
    }).length,
    focusMinutesToday: minutesOf(sessions, today, today),
    focusMinutesWeek: minutesOf(sessions, weekStart, today),
    days,
  }
}
