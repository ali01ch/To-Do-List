import { toPersianDigits } from '@/utils/digits'

const UNITS = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'] as const

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return `${toPersianDigits(0)} ${UNITS[0]}`
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  const rounded = unit === 0 ? String(Math.round(value)) : value.toFixed(value >= 10 ? 0 : 1)
  return `${toPersianDigits(rounded)} ${UNITS[unit]}`
}
