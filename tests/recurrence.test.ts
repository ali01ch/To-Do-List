import { describe, expect, it } from 'vitest'
import { buildWeeklyRecurrence, firstMatchingDueOn, nextWeeklyDueOn } from '@/services/recurrence'
import { sortWeekdays, weekdayFromDueOn } from '@/utils/weekdays'

describe('weekly recurrence', () => {
  it('orders weekdays from Saturday', () => {
    expect(sortWeekdays([1, 6, 0])).toEqual([6, 0, 1])
  })

  it('builds a weekly rule from selected days', () => {
    expect(buildWeeklyRecurrence([1, 3])).toEqual({
      frequency: 'weekly',
      interval: 1,
      weekdays: [1, 3],
      endsOn: null,
      count: null,
      generatedCount: 0,
    })
  })

  it('finds the next matching weekday after a due date', () => {
    // 2026-10-11 is Sunday (0)
    expect(weekdayFromDueOn('2026-10-11')).toBe(0)
    const rule = buildWeeklyRecurrence([1, 3])
    expect(nextWeeklyDueOn('2026-10-11', rule)).toBe('2026-10-12')
    expect(nextWeeklyDueOn('2026-10-12', rule)).toBe('2026-10-14')
  })

  it('snaps the first due date onto a selected weekday', () => {
    expect(firstMatchingDueOn('2026-10-11', [6, 1])).toBe('2026-10-12')
  })
})
