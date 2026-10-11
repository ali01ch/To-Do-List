import { formatJalaliDate, addDays } from '@/utils/dates'

export function formatDuePhrase(dueOn: string, today: string): string {
  if (dueOn === today) return 'امروز'
  if (dueOn === addDays(today, 1)) return 'فردا'
  if (dueOn === addDays(today, -1)) return 'دیروز'
  return formatJalaliDate(dueOn)
}

export function formatDueWithState(dueOn: string | null, today: string): string | null {
  if (!dueOn) return null
  const phrase = formatDuePhrase(dueOn, today)
  if (dueOn < today) return `${phrase}، عقب‌افتاده`
  return phrase
}
