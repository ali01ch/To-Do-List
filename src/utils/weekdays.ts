import { fa } from '@/locales/fa'

/** JavaScript weekday: 0 Sunday … 6 Saturday. UI order starts on Saturday. */
export const WEEKDAY_JS_ORDER = [6, 0, 1, 2, 3, 4, 5] as const

export type WeekdayJs = (typeof WEEKDAY_JS_ORDER)[number]

const WEEKDAY_LABELS: Record<WeekdayJs, string> = {
  6: fa.weekdays[6],
  0: fa.weekdays[0],
  1: fa.weekdays[1],
  2: fa.weekdays[2],
  3: fa.weekdays[3],
  4: fa.weekdays[4],
  5: fa.weekdays[5],
}

const WEEKDAY_SHORT: Record<WeekdayJs, string> = {
  6: fa.weekdayShort[6],
  0: fa.weekdayShort[0],
  1: fa.weekdayShort[1],
  2: fa.weekdayShort[2],
  3: fa.weekdayShort[3],
  4: fa.weekdayShort[4],
  5: fa.weekdayShort[5],
}

export function weekdayFromDueOn(dueOn: string): number {
  const [year, month, day] = dueOn.split('-').map(Number) as [number, number, number]
  return new Date(year, month - 1, day).getDay()
}

export function sortWeekdays(weekdays: number[]): WeekdayJs[] {
  return WEEKDAY_JS_ORDER.filter((day) => weekdays.includes(day))
}

export function isWeekdayJs(day: number): day is WeekdayJs {
  return (WEEKDAY_JS_ORDER as readonly number[]).includes(day)
}

export function weekdayLabel(day: number): string {
  return isWeekdayJs(day) ? WEEKDAY_LABELS[day] : ''
}

export function weekdayShortLabel(day: number): string {
  return isWeekdayJs(day) ? WEEKDAY_SHORT[day] : ''
}

export function formatWeekdayLabels(weekdays: number[]): string {
  return sortWeekdays(weekdays).map(weekdayLabel).join('، ')
}

export function formatWeekdayShorts(weekdays: number[]): string {
  return sortWeekdays(weekdays).map(weekdayShortLabel).join(' ')
}
