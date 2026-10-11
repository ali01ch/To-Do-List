const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

export function toPersianDigits(value: number | string): string {
  return String(value)
    .replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit)
    .replace('.', '٫')
}

export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/٫/g, '.')
}
