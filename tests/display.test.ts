import { describe, expect, it } from 'vitest'
import { formatBytes } from '@/utils/bytes'
import { normalizeDigits, toPersianDigits } from '@/utils/digits'
import { isColorPalette, resolveTheme } from '@/utils/theme'

describe('digits and display', () => {
  it('normalizes Persian and Arabic-Indic digits', () => {
    expect(normalizeDigits('۱۲۳')).toBe('123')
    expect(normalizeDigits('٤')).toBe('4')
    expect(toPersianDigits('1.5')).toBe('۱٫۵')
  })

  it('formats storage sizes in Persian', () => {
    expect(formatBytes(1536)).toBe('۱٫۵ کیلوبایت')
  })

  it('resolves the system theme from the device preference', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('light', true)).toBe('light')
  })

  it('accepts the green and rose color palettes', () => {
    expect(isColorPalette('green')).toBe(true)
    expect(isColorPalette('rose')).toBe(true)
    expect(isColorPalette('pink')).toBe(false)
  })
})
