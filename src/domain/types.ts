export const PRIORITIES = ['none', 'low', 'medium', 'high'] as const
export type Priority = (typeof PRIORITIES)[number]

export const LIST_COLORS = ['teal', 'clay', 'olive', 'ink', 'amber', 'iris'] as const
export type ListColor = (typeof LIST_COLORS)[number]

export const LIST_ICONS = ['folder', 'inbox', 'star', 'briefcase', 'heart', 'book'] as const
export type ListIcon = (typeof LIST_ICONS)[number]

/** Weekdays follow JavaScript: 0 is Sunday and 6 is Saturday. */
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  weekdays: number[] | null
  endsOn: string | null
  count: number | null
  generatedCount: number
}

export interface Task {
  id: string
  title: string
  description: string
  notes: string
  /** Local calendar date, YYYY-MM-DD. Never an instant. */
  dueOn: string | null
  /** Local time, HH:mm. Only valid together with dueOn. */
  dueTime: string | null
  priority: Priority
  listId: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  sortOrder: number
  deletedAt: string | null
  recurrence: RecurrenceRule | null
  /** Instant in ISO 8601. Distinct from a date-only due date. */
  reminderAt: string | null
}

export interface TaskList {
  id: string
  name: string
  color: ListColor
  icon: ListIcon
  sortOrder: number
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  color: ListColor
  createdAt: string
  updatedAt: string
}

export interface TaskTag {
  taskId: string
  tagId: string
}

export type FocusKind = 'focus' | 'break'
export type FocusStatus = 'running' | 'paused' | 'completed' | 'cancelled'

export interface FocusSession {
  id: string
  taskId: string | null
  kind: FocusKind
  status: FocusStatus
  startedAt: string
  endedAt: string | null
  durationMs: number
}

export type SettingValue =
  | string
  | number
  | boolean
  | null
  | SettingValue[]
  | { [key: string]: SettingValue }

export interface AppSetting {
  key: string
  value: SettingValue
}

export interface NewTask {
  title: string
  description?: string
  notes?: string
  dueOn?: string | null
  dueTime?: string | null
  priority?: Priority
  listId?: string | null
  recurrence?: RecurrenceRule | null
  reminderAt?: string | null
  sortOrder?: number
}

export type TaskPatch = Partial<
  Pick<
    Task,
    | 'title'
    | 'description'
    | 'notes'
    | 'dueOn'
    | 'dueTime'
    | 'priority'
    | 'listId'
    | 'recurrence'
    | 'reminderAt'
    | 'sortOrder'
  >
>

export interface NewTaskList {
  name: string
  color?: ListColor
  icon?: ListIcon
  sortOrder?: number
}

export type TaskListPatch = Partial<Pick<TaskList, 'name' | 'color' | 'icon' | 'sortOrder'>>

export interface NewTag {
  name: string
  color?: ListColor
}

export type TagPatch = Partial<Pick<Tag, 'name' | 'color'>>

export interface NewFocusSession {
  taskId?: string | null
  kind?: FocusKind
  status?: FocusStatus
  startedAt: string
  endedAt?: string | null
  durationMs?: number
}

export const SETTING_KEYS = {
  theme: 'theme',
  colorPalette: 'colorPalette',
  focusTimerStyle: 'focusTimerStyle',
} as const

export const FOCUS_TIMER_STYLES = ['digital', 'ring'] as const
export type FocusTimerStyle = (typeof FOCUS_TIMER_STYLES)[number]
