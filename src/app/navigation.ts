import {
  CalendarClock,
  CalendarRange,
  ChartColumn,
  CircleCheck,
  Ellipsis,
  Folders,
  Inbox,
  ListTodo,
  Settings,
  Sun,
  Timer,
} from '@lucide/vue'
import type { Component } from 'vue'
import { fa } from '@/locales/fa'

export interface NavItem {
  name: string
  label: string
  icon: Component
}

export const primaryNav: NavItem[] = [
  { name: 'today', label: fa.nav.today, icon: Sun },
  { name: 'upcoming', label: fa.nav.upcoming, icon: CalendarClock },
  { name: 'inbox', label: fa.nav.inbox, icon: Inbox },
  { name: 'calendar', label: fa.nav.calendar, icon: CalendarRange },
]

export const moreNav: NavItem = { name: 'more', label: fa.nav.more, icon: Ellipsis }

export const libraryNav: NavItem[] = [
  { name: 'tasks', label: fa.nav.tasks, icon: ListTodo },
  { name: 'completed', label: fa.nav.completed, icon: CircleCheck },
  { name: 'lists', label: fa.nav.lists, icon: Folders },
  { name: 'focus', label: fa.nav.focus, icon: Timer },
  { name: 'stats', label: fa.nav.stats, icon: ChartColumn },
  { name: 'settings', label: fa.nav.settings, icon: Settings },
]

const libraryNames = new Set(libraryNav.map((item) => item.name))

export function isMoreSection(name: unknown): boolean {
  return name === moreNav.name || (typeof name === 'string' && libraryNames.has(name))
}
