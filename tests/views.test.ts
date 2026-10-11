import { describe, expect, it } from 'vitest'
import type { Task } from '@/domain/types'
import { filterTasks, inboxTasks, todayBuckets } from '@/services/taskQuery'
import { summarize } from '@/services/stats'
import { buildMonthCells, parseJalaliInput } from '@/utils/jalali'

function task(patch: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    description: '',
    notes: '',
    dueOn: null,
    dueTime: null,
    priority: 'none',
    listId: null,
    completedAt: null,
    createdAt: '2026-10-11T08:00:00.000Z',
    updatedAt: '2026-10-11T08:00:00.000Z',
    sortOrder: 0,
    deletedAt: null,
    recurrence: null,
    reminderAt: null,
    ...patch,
  }
}

describe('task views', () => {
  const today = '2026-10-11'
  const tasks = [
    task({ id: '1', title: 'عقب', dueOn: '2026-10-10' }),
    task({ id: '2', title: 'امروز', dueOn: today, priority: 'high' }),
    task({ id: '3', title: 'ایده' }),
    task({ id: '4', title: 'انجام‌شده', dueOn: today, completedAt: '2026-10-11T09:00:00.000Z' }),
    task({ id: '5', title: 'آینده', dueOn: '2026-10-12' }),
  ]

  it('splits today into overdue, due today, and completed today', () => {
    const buckets = todayBuckets(tasks, today)
    expect(buckets.overdue.map((item) => item.id)).toEqual(['1'])
    expect(buckets.today.map((item) => item.id)).toEqual(['2'])
    expect(buckets.completedToday.map((item) => item.id)).toEqual(['4'])
  })

  it('keeps undated open tasks in the inbox', () => {
    expect(inboxTasks(tasks).map((item) => item.id)).toEqual(['3'])
  })

  it('combines search, priority and tag filters', () => {
    const tags = new Map<string, string[]>([['2', ['home']]])
    const found = filterTasks(
      tasks,
      { search: 'امروز', status: 'active', priority: 'high', listId: 'any', tagIds: ['home'], due: 'today' },
      tags,
      today,
    )
    expect(found.map((item) => item.id)).toEqual(['2'])
  })

  it('counts only real completed tasks and focus minutes', () => {
    const summary = summarize(
      tasks,
      [
        {
          id: 's',
          taskId: '2',
          kind: 'focus',
          status: 'completed',
          startedAt: '2026-10-11T08:00:00.000Z',
          endedAt: '2026-10-11T08:25:00.000Z',
          durationMs: 25 * 60 * 1000,
        },
      ],
      today,
    )
    expect(summary.completedToday).toBe(1)
    expect(summary.overdue).toBe(1)
    expect(summary.focusMinutesToday).toBe(25)
  })
})

describe('jalali calendar', () => {
  it('parses a Persian numeric date into a date-only value', () => {
    expect(parseJalaliInput('۱۴۰۳/۰۱/۰۱')).toBe('2024-03-20')
    expect(parseJalaliInput('1403/13/01')).toBeNull()
  })

  it('builds full weeks for a month', () => {
    const cells = buildMonthCells(1403, 1)
    expect(cells.length % 7).toBe(0)
    expect(cells.some((cell) => cell.dueOn === '2024-03-20' && cell.inMonth)).toBe(true)
  })
})
