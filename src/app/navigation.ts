import {
  CalendarRange,
  ChartColumn,
  CircleCheck,
  Ellipsis,
  Folders,
  Lightbulb,
  ListChecks,
  ListTodo,
  Settings,
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
  { name: 'work', label: fa.nav.work, icon: ListChecks },
  { name: 'inbox', label: fa.nav.inbox, icon: Lightbulb },
  { name: 'calendar', label: fa.nav.calendar, icon: CalendarRange },
  { name: 'focus', label: fa.nav.focus, icon: Timer },
]

export const moreNav: NavItem = { name: 'more', label: fa.nav.more, icon: Ellipsis }

export const libraryNav: NavItem[] = [
  { name: 'tasks', label: fa.nav.tasks, icon: ListTodo },
  { name: 'completed', label: fa.nav.completed, icon: CircleCheck },
  { name: 'lists', label: fa.nav.lists, icon: Folders },
  { name: 'stats', label: fa.nav.stats, icon: ChartColumn },
  { name: 'settings', label: fa.nav.settings, icon: Settings },
]

const libraryNames = new Set(libraryNav.map((item) => item.name))

export function isMoreSection(name: unknown): boolean {
  return name === moreNav.name || (typeof name === 'string' && libraryNames.has(name))
}
