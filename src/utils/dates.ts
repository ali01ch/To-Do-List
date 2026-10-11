import { toJalaali } from 'jalaali-js'
import { DataError } from '@/domain/errors'
import { toPersianDigits } from '@/utils/digits'

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_ONLY = /^(\d{2}):(\d{2})$/

const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const

export function isDateOnly(value: string): boolean {
  const match = DATE_ONLY.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function isValidTime(value: string): boolean {
  const match = TIME_ONLY.exec(value)
  if (!match) return false
  const hour = Number(match[1])
  const minute = Number(match[2])
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59
}

/** Calendar date in the runtime's local timezone, not a UTC instant. */
export function todayDueOn(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(dueOn: string, days: number): string {
  const [year, month, day] = dueOn.split('-').map(Number) as [number, number, number]
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return todayDueOn(date)
}

export function nowIso(now = new Date()): string {
  return now.toISOString()
}

/** Accepts an instant and rejects a date-only value so the two are not confused. */
export function parseInstant(value: string): string {
  if (!value.includes('T')) throw new DataError('INVALID_DATE')
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw new DataError('INVALID_DATE')
  return parsed.toISOString()
}

export function formatJalaliDate(dueOn: string): string {
  if (!isDateOnly(dueOn)) throw new DataError('INVALID_DATE')
  const [year, month, day] = dueOn.split('-').map(Number) as [number, number, number]
  const jalali = toJalaali(year, month, day)
  const monthName = JALALI_MONTHS[jalali.jm - 1]
  if (!monthName) throw new DataError('INVALID_DATE')
  return `${toPersianDigits(jalali.jd)} ${monthName} ${toPersianDigits(jalali.jy)}`
}
