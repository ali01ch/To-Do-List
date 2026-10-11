import { DataError } from '@/domain/errors'
import type {
  FocusKind,
  FocusSession,
  FocusStatus,
  ListColor,
  ListIcon,
  NewFocusSession,
  NewTag,
  NewTask,
  NewTaskList,
  Priority,
  RecurrenceRule,
  Tag,
  TagPatch,
  Task,
  TaskList,
  TaskListPatch,
  TaskPatch,
} from '@/domain/types'
import { LIST_COLORS, LIST_ICONS, PRIORITIES } from '@/domain/types'
import { isDateOnly, isValidTime, nowIso, parseInstant } from '@/utils/dates'
import { createId } from '@/utils/id'

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value)
}

export function isListColor(value: unknown): value is ListColor {
  return typeof value === 'string' && (LIST_COLORS as readonly string[]).includes(value)
}

export function isListIcon(value: unknown): value is ListIcon {
  return typeof value === 'string' && (LIST_ICONS as readonly string[]).includes(value)
}

function assertRecurrence(rule: RecurrenceRule): void {
  const frequencies = ['daily', 'weekly', 'monthly', 'yearly']
  if (!frequencies.includes(rule.frequency)) throw new DataError('INVALID_RECURRENCE')
  if (!Number.isInteger(rule.interval) || rule.interval < 1) throw new DataError('INVALID_RECURRENCE')
  if (rule.frequency === 'weekly') {
    if (!rule.weekdays?.length) throw new DataError('INVALID_RECURRENCE')
    const unique = new Set(rule.weekdays)
    if (unique.size !== rule.weekdays.length) throw new DataError('INVALID_RECURRENCE')
    if (rule.weekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
      throw new DataError('INVALID_RECURRENCE')
    }
  } else if (rule.weekdays !== null) {
    throw new DataError('INVALID_RECURRENCE')
  }
  if (rule.endsOn !== null && !isDateOnly(rule.endsOn)) throw new DataError('INVALID_RECURRENCE')
  if (rule.count !== null && (!Number.isInteger(rule.count) || rule.count < 1)) {
    throw new DataError('INVALID_RECURRENCE')
  }
  if (rule.endsOn !== null && rule.count !== null) throw new DataError('INVALID_RECURRENCE')
  if (!Number.isInteger(rule.generatedCount) || rule.generatedCount < 0) {
    throw new DataError('INVALID_RECURRENCE')
  }
}

function assertTaskFields(task: Pick<
  Task,
  'title' | 'dueOn' | 'dueTime' | 'priority' | 'recurrence' | 'reminderAt' | 'sortOrder'
>): void {
  if (!task.title.trim()) throw new DataError('TITLE_REQUIRED')
  if (!isPriority(task.priority)) throw new DataError('INVALID_PRIORITY')
  if (task.dueOn !== null && !isDateOnly(task.dueOn)) throw new DataError('INVALID_DATE')
  if (task.dueTime !== null && !isValidTime(task.dueTime)) throw new DataError('INVALID_TIME')
  if (task.dueTime !== null && task.dueOn === null) throw new DataError('INVALID_TIME')
  if (task.reminderAt !== null) parseInstant(task.reminderAt)
  if (task.recurrence) assertRecurrence(task.recurrence)
  if (!Number.isFinite(task.sortOrder)) throw new DataError('UNKNOWN')
}

export function buildTask(input: NewTask, sortOrder = nowSort()): Task {
  const now = nowIso()
  const task: Task = {
    id: createId(),
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    notes: input.notes?.trim() ?? '',
    dueOn: input.dueOn ?? null,
    dueTime: input.dueTime ?? null,
    priority: input.priority ?? 'none',
    listId: input.listId ?? null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: input.sortOrder ?? sortOrder,
    deletedAt: null,
    recurrence: input.recurrence ?? null,
    reminderAt: input.reminderAt ?? null,
  }
  assertTaskFields(task)
  if (task.reminderAt) task.reminderAt = parseInstant(task.reminderAt)
  return task
}

export function mergeTask(current: Task, patch: TaskPatch): Task {
  const next: Task = {
    ...current,
    title: patch.title !== undefined ? patch.title.trim() : current.title,
    description: patch.description !== undefined ? patch.description.trim() : current.description,
    notes: patch.notes !== undefined ? patch.notes.trim() : current.notes,
    dueOn: patch.dueOn !== undefined ? patch.dueOn : current.dueOn,
    dueTime: patch.dueTime !== undefined ? patch.dueTime : current.dueTime,
    priority: patch.priority !== undefined ? patch.priority : current.priority,
    listId: patch.listId !== undefined ? patch.listId : current.listId,
    recurrence: patch.recurrence !== undefined ? patch.recurrence : current.recurrence,
    reminderAt: patch.reminderAt !== undefined ? patch.reminderAt : current.reminderAt,
    sortOrder: patch.sortOrder !== undefined ? patch.sortOrder : current.sortOrder,
    updatedAt: nowIso(),
  }
  if (next.dueOn === null) next.dueTime = patch.dueTime !== undefined ? patch.dueTime : null
  assertTaskFields(next)
  if (next.reminderAt) next.reminderAt = parseInstant(next.reminderAt)
  return next
}

export function buildList(input: NewTaskList, sortOrder = nowSort()): TaskList {
  const name = input.name.trim()
  if (!name) throw new DataError('NAME_REQUIRED')
  const color = input.color ?? 'teal'
  const icon = input.icon ?? 'folder'
  if (!isListColor(color)) throw new DataError('INVALID_COLOR')
  if (!isListIcon(icon)) throw new DataError('INVALID_ICON')
  const now = nowIso()
  return {
    id: createId(),
    name,
    color,
    icon,
    sortOrder: input.sortOrder ?? sortOrder,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}

export function mergeList(current: TaskList, patch: TaskListPatch): TaskList {
  const next: TaskList = {
    ...current,
    name: patch.name !== undefined ? patch.name.trim() : current.name,
    color: patch.color !== undefined ? patch.color : current.color,
    icon: patch.icon !== undefined ? patch.icon : current.icon,
    sortOrder: patch.sortOrder !== undefined ? patch.sortOrder : current.sortOrder,
    updatedAt: nowIso(),
  }
  if (!next.name) throw new DataError('NAME_REQUIRED')
  if (!isListColor(next.color)) throw new DataError('INVALID_COLOR')
  if (!isListIcon(next.icon)) throw new DataError('INVALID_ICON')
  if (!Number.isFinite(next.sortOrder)) throw new DataError('UNKNOWN')
  return next
}

export function buildTag(input: NewTag): Tag {
  const name = normalizeName(input.name)
  if (!name) throw new DataError('NAME_REQUIRED')
  const color = input.color ?? 'olive'
  if (!isListColor(color)) throw new DataError('INVALID_COLOR')
  const now = nowIso()
  return { id: createId(), name, color, createdAt: now, updatedAt: now }
}

export function mergeTag(current: Tag, patch: TagPatch): Tag {
  const next: Tag = {
    ...current,
    name: patch.name !== undefined ? normalizeName(patch.name) : current.name,
    color: patch.color !== undefined ? patch.color : current.color,
    updatedAt: nowIso(),
  }
  if (!next.name) throw new DataError('NAME_REQUIRED')
  if (!isListColor(next.color)) throw new DataError('INVALID_COLOR')
  return next
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function sameName(left: string, right: string): boolean {
  return normalizeName(left).toLocaleLowerCase('fa') === normalizeName(right).toLocaleLowerCase('fa')
}

const FOCUS_KINDS = ['focus', 'break'] as const
const FOCUS_STATUSES = ['running', 'paused', 'completed', 'cancelled'] as const

function isFocusKind(value: unknown): value is FocusKind {
  return typeof value === 'string' && (FOCUS_KINDS as readonly string[]).includes(value)
}

function isFocusStatus(value: unknown): value is FocusStatus {
  return typeof value === 'string' && (FOCUS_STATUSES as readonly string[]).includes(value)
}

export function buildFocusSession(input: NewFocusSession): FocusSession {
  const kind = input.kind ?? 'focus'
  const status = input.status ?? 'running'
  const durationMs = input.durationMs ?? 0
  if (!isFocusKind(kind) || !isFocusStatus(status)) throw new DataError('INVALID_SESSION')
  if (!Number.isInteger(durationMs) || durationMs < 0) throw new DataError('INVALID_SESSION')
  const startedAt = parseInstant(input.startedAt)
  const endedAt = input.endedAt == null ? null : parseInstant(input.endedAt)
  return {
    id: createId(),
    taskId: input.taskId ?? null,
    kind,
    status,
    startedAt,
    endedAt,
    durationMs,
  }
}

function nowSort(): number {
  return Date.now()
}
