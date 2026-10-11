import { isValidJalaaliDate, jalaaliMonthLength, jalaaliToDateObject, toGregorian, toJalaali } from 'jalaali-js'
import { normalizeDigits } from '@/utils/digits'
import { isDateOnly } from '@/utils/dates'

export const JALALI_MONTHS = [
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

export const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const

export interface JalaliParts {
  jy: number
  jm: number
  jd: number
}

export interface CalendarCell {
  dueOn: string
  day: number
  inMonth: boolean
}

export function jalaliPartsFromDueOn(dueOn: string): JalaliParts {
  const [year, month, day] = dueOn.split('-').map(Number) as [number, number, number]
  const jalali = toJalaali(year, month, day)
  return { jy: jalali.jy, jm: jalali.jm, jd: jalali.jd }
}

export function formatJalaliNumeric(dueOn: string): string {
  const parts = jalaliPartsFromDueOn(dueOn)
  const month = String(parts.jm).padStart(2, '0')
  const day = String(parts.jd).padStart(2, '0')
  return `${parts.jy}/${month}/${day}`
}

export function dueOnFromJalali(jy: number, jm: number, jd: number): string {
  const gregorian = toGregorian(jy, jm, jd)
  const month = String(gregorian.gm).padStart(2, '0')
  const day = String(gregorian.gd).padStart(2, '0')
  return `${gregorian.gy}-${month}-${day}`
}

export function parseJalaliInput(value: string): string | null {
  const match = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(normalizeDigits(value).trim())
  if (!match) return null
  const jy = Number(match[1])
  const jm = Number(match[2])
  const jd = Number(match[3])
  if (!isValidJalaaliDate(jy, jm, jd)) return null
  const dueOn = dueOnFromJalali(jy, jm, jd)
  return isDateOnly(dueOn) ? dueOn : null
}

export function shiftJalaliMonth(jy: number, jm: number, delta: number): { jy: number; jm: number } {
  const monthIndex = jy * 12 + (jm - 1) + delta
  const nextYear = Math.floor(monthIndex / 12)
  return { jy: nextYear, jm: monthIndex - nextYear * 12 + 1 }
}

export function buildMonthCells(jy: number, jm: number): CalendarCell[] {
  const length = jalaaliMonthLength(jy, jm)
  const lead = (jalaaliToDateObject(jy, jm, 1).getDay() + 1) % 7
  const cells: CalendarCell[] = []

  const previous = shiftJalaliMonth(jy, jm, -1)
  const previousLength = jalaaliMonthLength(previous.jy, previous.jm)
  for (let index = 0; index < lead; index += 1) {
    const day = previousLength - lead + index + 1
    cells.push({
      dueOn: dueOnFromJalali(previous.jy, previous.jm, day),
      day,
      inMonth: false,
    })
  }

  for (let day = 1; day <= length; day += 1) {
    cells.push({ dueOn: dueOnFromJalali(jy, jm, day), day, inMonth: true })
  }

  const next = shiftJalaliMonth(jy, jm, 1)
  let day = 1
  while (cells.length % 7 !== 0) {
    cells.push({ dueOn: dueOnFromJalali(next.jy, next.jm, day), day, inMonth: false })
    day += 1
  }
  return cells
}
