import { describe, expect, it } from 'vitest'
import { formatJalaliDate, isDateOnly, parseInstant, todayDueOn } from '@/utils/dates'
import { DataError } from '@/domain/errors'

describe('dates', () => {
  it('keeps a due date as a local calendar date', () => {
    expect(todayDueOn(new Date(2026, 9, 11, 23, 30))).toBe('2026-10-11')
    expect(isDateOnly('2026-10-11')).toBe(true)
    expect(isDateOnly('2026-02-31')).toBe(false)
    expect(isDateOnly('2026-10-11T00:00:00.000Z')).toBe(false)
  })

  it('formats a Gregorian date-only value on the Jalali calendar', () => {
    expect(formatJalaliDate('2016-04-11')).toBe('۲۳ فروردین ۱۳۹۵')
    expect(formatJalaliDate('2024-03-20')).toBe('۱ فروردین ۱۴۰۳')
  })

  it('rejects a date-only string when an instant is required', () => {
    expect(() => parseInstant('2026-10-11')).toThrow(DataError)
    expect(parseInstant('2026-10-11T08:30:00.000Z')).toBe('2026-10-11T08:30:00.000Z')
  })
})
