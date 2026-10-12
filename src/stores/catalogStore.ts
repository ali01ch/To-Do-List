import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toDataError, type DataErrorCode } from '@/domain/errors'
import type { FocusSession, NewTask, NewTaskList, Tag, Task, TaskList, TaskPatch, TaskTag } from '@/domain/types'
import { fa } from '@/locales/fa'
import { focusRepository, listRepository, tagRepository, taskRepository } from '@/repositories/container'
import { nextWeeklyDueOn } from '@/services/recurrence'
import { nowIso } from '@/utils/dates'
import { toPersianDigits } from '@/utils/digits'

export interface CreatePreset {
  title?: string
  dueOn?: string | null
  listId?: string | null
}

export type EditorState = { mode: 'create'; title: string; dueOn: string | null; listId: string | null } | { mode: 'edit'; taskId: string }

export type PendingDelete =
  | { kind: 'task'; id: string; label: string }
  | { kind: 'tasks'; ids: string[]; count: number }
  | { kind: 'list'; id: string; label: string }
  | { kind: 'tag'; id: string; label: string }

interface UndoEntry {
  message: string
  undo: () => Promise<void>
}

export const useCatalogStore = defineStore('catalog', () => {
  const tasks = ref<Task[]>([])
  const lists = ref<TaskList[]>([])
  const tags = ref<Tag[]>([])
  const links = ref<TaskTag[]>([])
  const sessions = ref<FocusSession[]>([])
  const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const actionError = ref<DataErrorCode | null>(null)
  const editor = ref<EditorState | null>(null)
  const undoEntry = ref<UndoEntry | null>(null)
  const notice = ref<string | null>(null)
  const pendingDelete = ref<PendingDelete | null>(null)
  const deleteBusy = ref(false)
  let createLock = false
  let undoTimer = 0
  let noticeTimer = 0
  let resolvePendingDelete: ((confirmed: boolean) => void) | null = null

  const deleteDialog = computed(() => {
    const pending = pendingDelete.value
    if (!pending) return null
    if (pending.kind === 'task') {
      return {
        title: fa.task.confirmTaskNamed.replace('{title}', pending.label),
        body: fa.task.confirmTaskBody,
      }
    }
    if (pending.kind === 'tasks') {
      return {
        title: fa.task.confirmTasks,
        body: `${toPersianDigits(pending.count)} کار انتخاب شده است.\n${fa.task.confirmTasksBody}`,
      }
    }
    if (pending.kind === 'list') {
      return {
        title: fa.task.confirmListNamed.replace('{title}', pending.label),
        body: fa.task.confirmListBody,
      }
    }
    return {
      title: fa.task.confirmTagNamed.replace('{title}', pending.label),
      body: fa.task.confirmTagBody,
    }
  })

  const tagsByTask = computed(() => {
    const map = new Map<string, string[]>()
    for (const link of links.value) {
      const current = map.get(link.taskId) ?? []
      current.push(link.tagId)
      map.set(link.taskId, current)
    }
    return map
  })

  const activeLists = computed(() => lists.value.filter((list) => list.archivedAt === null))

  function replaceTask(task: Task): void {
    const index = tasks.value.findIndex((item) => item.id === task.id)
    if (index === -1) tasks.value.push(task)
    else tasks.value.splice(index, 1, task)
  }

  function showNotice(message: string): void {
    notice.value = message
    window.clearTimeout(noticeTimer)
    noticeTimer = window.setTimeout(() => {
      notice.value = null
    }, 4000)
  }

  function showUndo(entry: UndoEntry): void {
    undoEntry.value = entry
    window.clearTimeout(undoTimer)
    undoTimer = window.setTimeout(() => {
      undoEntry.value = null
    }, 6000)
  }

  async function undo(): Promise<void> {
    const entry = undoEntry.value
    undoEntry.value = null
    window.clearTimeout(undoTimer)
    if (!entry) return
    try {
      await entry.undo()
    } catch (error) {
      actionError.value = toDataError(error).code
    }
  }

  async function load(): Promise<void> {
    status.value = 'loading'
    actionError.value = null
    try {
      const [taskRows, listRows, tagRows, linkRows, sessionRows] = await Promise.all([
        taskRepository.list(),
        listRepository.list(),
        tagRepository.list(),
        taskRepository.listLinks(),
        focusRepository.list(),
      ])
      tasks.value = taskRows
      lists.value = listRows
      tags.value = tagRows
      links.value = linkRows
      sessions.value = sessionRows
      status.value = 'ready'
    } catch (error) {
      status.value = 'error'
      actionError.value = toDataError(error).code
    }
  }

  function openCreate(preset: CreatePreset = {}): void {
    editor.value = {
      mode: 'create',
      title: preset.title?.trim() ?? '',
      dueOn: preset.dueOn === undefined ? null : preset.dueOn,
      listId: preset.listId ?? null,
    }
  }

  function openEdit(taskId: string): void {
    editor.value = { mode: 'edit', taskId }
  }

  function closeEditor(): void {
    editor.value = null
  }

  async function createTask(input: NewTask, tagIds: string[] = []): Promise<Task | undefined> {
    if (createLock) return undefined
    createLock = true
    actionError.value = null
    try {
      const task = await taskRepository.create(input)
      if (tagIds.length > 0) await taskRepository.setTags(task.id, tagIds)
      replaceTask(task)
      links.value = links.value.filter((link) => link.taskId !== task.id).concat(tagIds.map((tagId) => ({ taskId: task.id, tagId })))
      showNotice('کار ثبت شد')
      return task
    } catch (error) {
      actionError.value = toDataError(error).code
      return undefined
    } finally {
      createLock = false
    }
  }

  async function updateTask(id: string, patch: TaskPatch, tagIds?: string[]): Promise<void> {
    actionError.value = null
    try {
      const task = await taskRepository.update(id, patch)
      if (tagIds) await taskRepository.setTags(id, tagIds)
      replaceTask(task)
      if (tagIds) {
        links.value = links.value.filter((link) => link.taskId !== id).concat(tagIds.map((tagId) => ({ taskId: id, tagId })))
      }
    } catch (error) {
      actionError.value = toDataError(error).code
    }
  }

  async function spawnNextOccurrence(source: Task): Promise<void> {
    if (!source.recurrence || !source.dueOn || source.recurrence.frequency !== 'weekly') return
    const nextDue = nextWeeklyDueOn(source.dueOn, source.recurrence)
    if (!nextDue) return
    const next = await taskRepository.create({
      title: source.title,
      description: source.description,
      notes: source.notes,
      dueOn: nextDue,
      dueTime: source.dueTime,
      priority: source.priority,
      listId: source.listId,
      recurrence: {
        ...source.recurrence,
        generatedCount: source.recurrence.generatedCount + 1,
      },
    })
    const sourceTags = tagsByTask.value.get(source.id) ?? []
    if (sourceTags.length > 0) {
      await taskRepository.setTags(next.id, sourceTags)
      links.value = links.value.concat(sourceTags.map((tagId) => ({ taskId: next.id, tagId })))
    }
    replaceTask(next)
  }

  async function toggleComplete(id: string): Promise<void> {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return
    const previous = task.completedAt
    const shouldSpawn = !previous && task.recurrence !== null
    task.completedAt = previous ? null : nowIso()
    try {
      const saved = previous ? await taskRepository.uncomplete(id) : await taskRepository.complete(id)
      replaceTask(saved)
      if (shouldSpawn) await spawnNextOccurrence(saved)
    } catch (error) {
      task.completedAt = previous
      actionError.value = toDataError(error).code
    }
  }

  function askDelete(pending: PendingDelete): Promise<boolean> {
    if (resolvePendingDelete) resolvePendingDelete(false)
    pendingDelete.value = pending
    return new Promise((resolve) => {
      resolvePendingDelete = resolve
    })
  }

  function cancelPendingDelete(): void {
    if (deleteBusy.value) return
    pendingDelete.value = null
    resolvePendingDelete?.(false)
    resolvePendingDelete = null
  }

  async function confirmPendingDelete(): Promise<void> {
    const pending = pendingDelete.value
    const resolve = resolvePendingDelete
    if (!pending || deleteBusy.value) {
      if (!pending) {
        resolvePendingDelete = null
        resolve?.(false)
      }
      return
    }
    deleteBusy.value = true
    try {
      if (pending.kind === 'task') await removeTask(pending.id)
      else if (pending.kind === 'tasks') await removeTasks(pending.ids)
      else if (pending.kind === 'list') await removeList(pending.id)
      else await removeTag(pending.id)
      pendingDelete.value = null
      resolvePendingDelete = null
      resolve?.(actionError.value === null)
    } finally {
      deleteBusy.value = false
    }
  }

  async function requestRemoveTask(id: string): Promise<boolean> {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return false
    return askDelete({ kind: 'task', id, label: task.title })
  }

  async function requestRemoveTasks(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return false
    return askDelete({ kind: 'tasks', ids: [...ids], count: ids.length })
  }

  async function requestRemoveList(id: string): Promise<boolean> {
    const list = lists.value.find((item) => item.id === id)
    if (!list) return false
    return askDelete({ kind: 'list', id, label: list.name })
  }

  async function requestRemoveTag(id: string): Promise<boolean> {
    const tag = tags.value.find((item) => item.id === id)
    if (!tag) return false
    return askDelete({ kind: 'tag', id, label: tag.name })
  }

  async function removeTask(id: string): Promise<void> {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return
    actionError.value = null
    try {
      await taskRepository.softDelete(id)
      tasks.value = tasks.value.filter((item) => item.id !== id)
      if (editor.value?.mode === 'edit' && editor.value.taskId === id) editor.value = null
      showUndo({
        message: `«${task.title}» حذف شد`,
        undo: async () => {
          const restored = await taskRepository.restore(id)
          replaceTask(restored)
        },
      })
    } catch (error) {
      actionError.value = toDataError(error).code
    }
  }

  async function removeTasks(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const snapshot = tasks.value.filter((task) => ids.includes(task.id))
    actionError.value = null
    try {
      for (const id of ids) await taskRepository.softDelete(id)
      const idSet = new Set(ids)
      tasks.value = tasks.value.filter((task) => !idSet.has(task.id))
      showUndo({
        message: 'کارهای انتخاب‌شده حذف شدند',
        undo: async () => {
          for (const task of snapshot) replaceTask(await taskRepository.restore(task.id))
        },
      })
    } catch (error) {
      actionError.value = toDataError(error).code
      await load()
    }
  }

  async function completeTasks(ids: string[]): Promise<void> {
    actionError.value = null
    try {
      for (const id of ids) {
        const task = tasks.value.find((item) => item.id === id)
        if (!task || task.completedAt) continue
        replaceTask(await taskRepository.complete(id))
      }
    } catch (error) {
      actionError.value = toDataError(error).code
      await load()
    }
  }

  async function duplicateTask(id: string): Promise<void> {
    actionError.value = null
    try {
      const copy = await taskRepository.duplicate(id)
      const tagIds = await taskRepository.tagIds(copy.id)
      replaceTask(copy)
      links.value.push(...tagIds.map((tagId) => ({ taskId: copy.id, tagId })))
      showNotice('یک کپی ساخته شد')
    } catch (error) {
      actionError.value = toDataError(error).code
    }
  }

  async function moveTask(id: string, direction: -1 | 1, orderedIds: string[]): Promise<void> {
    const index = orderedIds.indexOf(id)
    const otherId = orderedIds[index + direction]
    if (!otherId) return
    const current = tasks.value.find((task) => task.id === id)
    const other = tasks.value.find((task) => task.id === otherId)
    if (!current || !other) return
    const currentOrder = current.sortOrder
    const otherOrder = other.sortOrder === currentOrder ? currentOrder + direction : other.sortOrder
    actionError.value = null
    try {
      const [savedCurrent, savedOther] = await Promise.all([
        taskRepository.update(current.id, { sortOrder: otherOrder }),
        taskRepository.update(other.id, { sortOrder: currentOrder }),
      ])
      replaceTask(savedCurrent)
      replaceTask(savedOther)
    } catch (error) {
      actionError.value = toDataError(error).code
    }
  }

  async function createList(input: NewTaskList): Promise<TaskList | undefined> {
    actionError.value = null
    try {
      const list = await listRepository.create(input)
      lists.value.push(list)
      lists.value.sort((left, right) => left.sortOrder - right.sortOrder)
      return list
    } catch (error) {
      actionError.value = toDataError(error).code
      return undefined
    }
  }

  async function updateList(id: string, patch: Partial<Pick<TaskList, 'name' | 'color' | 'icon'>>): Promise<void> {
    actionError.value = null
    try {
      const list = await listRepository.update(id, patch)
      const index = lists.value.findIndex((item) => item.id === id)
      if (index >= 0) lists.value.splice(index, 1, list)
    } catch (error) {
      actionError.value = toDataError(error).code
    }
  }

  async function setListArchived(id: string, archived: boolean): Promise<void> {
    actionError.value = null
    try {
      const list = await listRepository.setArchived(id, archived)
      const index = lists.value.findIndex((item) => item.id === id)
      if (index >= 0) lists.value.splice(index, 1, list)
    } catch (error) {
      actionError.value = toDataError(error).code
    }
  }

  async function removeList(id: string): Promise<void> {
    actionError.value = null
    try {
      await listRepository.remove(id)
      lists.value = lists.value.filter((list) => list.id !== id)
      const now = nowIso()
      tasks.value = tasks.value.map((task) => (task.listId === id ? { ...task, listId: null, updatedAt: now } : task))
    } catch (error) {
      actionError.value = toDataError(error).code
    }
  }

  async function createTag(name: string): Promise<Tag | undefined> {
    actionError.value = null
    try {
      const tag = await tagRepository.create({ name })
      tags.value.push(tag)
      tags.value.sort((left, right) => left.name.localeCompare(right.name, 'fa'))
      return tag
    } catch (error) {
      actionError.value = toDataError(error).code
      return undefined
    }
  }

  async function removeTag(id: string): Promise<void> {
    actionError.value = null
    try {
      await tagRepository.remove(id)
      tags.value = tags.value.filter((tag) => tag.id !== id)
      links.value = links.value.filter((link) => link.tagId !== id)
    } catch (error) {
      actionError.value = toDataError(error).code
    }
  }

  function rememberSession(session: FocusSession): void {
    sessions.value = [session, ...sessions.value.filter((item) => item.id !== session.id)]
  }

  return {
    tasks,
    lists,
    tags,
    links,
    sessions,
    status,
    actionError,
    editor,
    undoEntry,
    notice,
    pendingDelete,
    deleteBusy,
    deleteDialog,
    tagsByTask,
    activeLists,
    load,
    openCreate,
    openEdit,
    closeEditor,
    createTask,
    updateTask,
    toggleComplete,
    requestRemoveTask,
    requestRemoveTasks,
    requestRemoveList,
    requestRemoveTag,
    cancelPendingDelete,
    confirmPendingDelete,
    completeTasks,
    duplicateTask,
    moveTask,
    createList,
    updateList,
    setListArchived,
    createTag,
    rememberSession,
    undo,
    showNotice,
  }
})
