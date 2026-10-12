import type { RecurrenceRule } from '@/domain/types'
import { addDays } from '@/utils/dates'
import { isWeekdayJs, sortWeekdays, weekdayFromDueOn } from '@/utils/weekdays'

export function buildWeeklyRecurrence(weekdays: number[]): RecurrenceRule {
  const ordered = sortWeekdays([...new Set(weekdays)])
  return {
    frequency: 'weekly',
    interval: 1,
    weekdays: ordered,
    endsOn: null,
    count: null,
    generatedCount: 0,
  }
}

/** Next calendar day after `fromDueOn` that matches the weekly rule. */
export function nextWeeklyDueOn(fromDueOn: string, rule: RecurrenceRule): string | null {
  if (rule.frequency !== 'weekly' || !rule.weekdays?.length) return null
  if (rule.count !== null && rule.generatedCount >= rule.count) return null

  let cursor = addDays(fromDueOn, 1)
  for (let step = 0; step < 400; step += 1) {
    if (rule.endsOn && cursor > rule.endsOn) return null
    if (rule.weekdays.includes(weekdayFromDueOn(cursor))) return cursor
    cursor = addDays(cursor, 1)
  }
  return null
}

/** First due date on or after `fromDueOn` that matches selected weekdays. */
export function firstMatchingDueOn(fromDueOn: string, weekdays: number[]): string {
  const ordered = sortWeekdays(weekdays)
  if (ordered.length === 0) return fromDueOn
  let cursor = fromDueOn
  for (let step = 0; step < 8; step += 1) {
    const day = weekdayFromDueOn(cursor)
    if (isWeekdayJs(day) && ordered.includes(day)) return cursor
    cursor = addDays(cursor, 1)
  }
  return fromDueOn
}
