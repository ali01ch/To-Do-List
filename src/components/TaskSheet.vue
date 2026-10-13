<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Priority, RecurrenceRule } from '@/domain/types'
import { PRIORITIES } from '@/domain/types'
import AppSheet from '@/components/AppSheet.vue'
import JalaliDatePicker from '@/components/JalaliDatePicker.vue'
import { fa } from '@/locales/fa'
import { buildWeeklyRecurrence, firstMatchingDueOn } from '@/services/recurrence'
import { useCatalogStore } from '@/stores/catalogStore'
import { formatJalaliDate, todayDueOn } from '@/utils/dates'
import { WEEKDAY_JS_ORDER, formatWeekdayLabels, weekdayLabel, weekdayShortLabel } from '@/utils/weekdays'

const catalog = useCatalogStore()
const title = ref('')
const description = ref('')
const notes = ref('')
const dueOn = ref<string | null>(null)
const dueTime = ref('')
const priority = ref<Priority>('none')
const listId = ref('')
const tagIds = ref<string[]>([])
const tagName = ref('')
const weekdays = ref<number[]>([])
const formError = ref('')
const pending = ref(false)

const editingTask = computed(() => {
  const editor = catalog.editor
  if (!editor || editor.mode !== 'edit') return undefined
  return catalog.tasks.find((task) => task.id === editor.taskId)
})

watch(
  () => catalog.editor,
  (editor) => {
    formError.value = ''
    tagName.value = ''
    if (!editor) return
    if (editor.mode === 'create') {
      title.value = editor.title
      description.value = ''
      notes.value = ''
      dueOn.value = editor.dueOn
      dueTime.value = ''
      priority.value = 'none'
      listId.value = editor.listId ?? ''
      tagIds.value = []
      weekdays.value = []
      return
    }
    const task = catalog.tasks.find((item) => item.id === editor.taskId)
    if (!task) return
    title.value = task.title
    description.value = task.description
    notes.value = task.notes
    dueOn.value = task.dueOn
    dueTime.value = task.dueTime ?? ''
    priority.value = task.priority
    listId.value = task.listId ?? ''
    tagIds.value = [...(catalog.tagsByTask.get(task.id) ?? [])]
    weekdays.value =
      task.recurrence?.frequency === 'weekly' && task.recurrence.weekdays
        ? [...task.recurrence.weekdays]
        : []
  },
  { immediate: true },
)

watch(dueOn, (value) => {
  if (!value) dueTime.value = ''
})

function toggleTag(id: string): void {
  tagIds.value = tagIds.value.includes(id) ? tagIds.value.filter((tagId) => tagId !== id) : [...tagIds.value, id]
}

function toggleWeekday(day: number): void {
  weekdays.value = weekdays.value.includes(day)
    ? weekdays.value.filter((item) => item !== day)
    : [...weekdays.value, day]
}

async function addTag(): Promise<void> {
  const tag = await catalog.createTag(tagName.value)
  if (!tag) return
  if (!tagIds.value.includes(tag.id)) tagIds.value.push(tag.id)
  tagName.value = ''
}

function readDue(): { dueOn: string | null; dueTime: string | null } | undefined {
  if (!dueOn.value) return { dueOn: null, dueTime: null }
  if (dueTime.value && !/^(\d{2}):(\d{2})$/.test(dueTime.value)) {
    formError.value = fa.errors.INVALID_TIME
    return undefined
  }
  return { dueOn: dueOn.value, dueTime: dueTime.value || null }
}

function readRecurrence(dueOn: string | null): { dueOn: string | null; recurrence: RecurrenceRule | null } {
  if (weekdays.value.length === 0) return { dueOn, recurrence: null }
  const recurrence = buildWeeklyRecurrence(weekdays.value)
  if (dueOn) return { dueOn: firstMatchingDueOn(dueOn, weekdays.value), recurrence }
  return { dueOn: firstMatchingDueOn(todayDueOn(), weekdays.value), recurrence }
}

async function save(): Promise<void> {
  if (pending.value) return
  const due = readDue()
  if (!due) return
  if (!title.value.trim()) {
    formError.value = fa.errors.TITLE_REQUIRED
    return
  }
  const schedule = readRecurrence(due.dueOn)
  pending.value = true
  formError.value = ''
  try {
    const editor = catalog.editor
    if (!editor) return
    const payload = {
      title: title.value,
      description: description.value,
      notes: notes.value,
      dueOn: schedule.dueOn,
      dueTime: schedule.dueOn ? due.dueTime : null,
      priority: priority.value,
      listId: listId.value || null,
      recurrence: schedule.recurrence,
    }
    if (editor.mode === 'create') {
      const task = await catalog.createTask(payload, tagIds.value)
      if (task) catalog.closeEditor()
      else if (catalog.actionError) formError.value = fa.errors[catalog.actionError]
      return
    }
    await catalog.updateTask(editor.taskId, payload, tagIds.value)
    if (!catalog.actionError) catalog.closeEditor()
    else formError.value = fa.errors[catalog.actionError]
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AppSheet :open="catalog.editor !== null" :title="catalog.editor?.mode === 'edit' ? fa.task.edit : fa.task.new" @close="catalog.closeEditor()">
    <form
      v-if="catalog.editor"
      class="flex min-h-0 flex-1 flex-col overflow-hidden"
      @submit.prevent="save"
    >
      <div class="min-h-0 flex-1 overflow-y-auto p-4">
        <h2 class="text-base font-semibold">{{ catalog.editor.mode === 'edit' ? fa.task.edit : fa.task.new }}</h2>
        <label class="mt-4 block text-sm" for="task-title">{{ fa.task.title }}</label>
        <input id="task-title" v-model="title" class="mt-1 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm" required />

        <label class="mt-3 block text-sm" for="task-description">{{ fa.task.description }}</label>
        <textarea id="task-description" v-model="description" rows="2" class="mt-1 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm" />

        <label class="mt-3 block text-sm" for="task-notes">{{ fa.task.notes }}</label>
        <textarea id="task-notes" v-model="notes" rows="2" class="mt-1 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm" />

        <div class="mt-3">
          <label class="block text-sm" for="task-due">{{ fa.task.due }}</label>
          <JalaliDatePicker v-model="dueOn" />
        </div>
        <div class="mt-3 max-w-xs">
          <label class="block text-sm" for="task-time">{{ fa.task.time }}</label>
          <input
            id="task-time"
            v-model="dueTime"
            type="time"
            dir="ltr"
            class="mt-1 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm disabled:opacity-50"
            :disabled="!dueOn"
          />
        </div>

        <fieldset class="mt-4">
          <legend class="text-sm font-medium">{{ fa.task.weekdays }}</legend>
          <p class="mt-1 text-xs leading-6 text-muted">{{ fa.task.weekdaysHint }}</p>
          <div class="mt-3 grid grid-cols-7 gap-1.5">
            <button
              v-for="day in WEEKDAY_JS_ORDER"
              :key="day"
              type="button"
              class="flex min-h-11 flex-col items-center justify-center rounded-xl border border-line px-1 text-[0.7rem] leading-4 transition-colors"
              :class="weekdays.includes(day) ? 'border-accent bg-accent-soft text-accent' : 'bg-canvas text-muted'"
              :aria-pressed="weekdays.includes(day)"
              :aria-label="weekdayLabel(day)"
              @click="toggleWeekday(day)"
            >
              <span class="text-sm font-medium">{{ weekdayShortLabel(day) }}</span>
            </button>
          </div>
          <p v-if="weekdays.length" class="mt-2 text-xs text-muted">
            {{ fa.task.routine }}:
            {{ formatWeekdayLabels(weekdays) }}
          </p>
        </fieldset>

        <fieldset class="mt-3">
          <legend class="text-sm">{{ fa.task.priority }}</legend>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <label v-for="item in PRIORITIES" :key="item" class="flex min-h-11 items-center justify-center rounded-xl border border-line text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
              <input v-model="priority" class="sr-only" type="radio" name="priority" :value="item" />
              {{ fa.priority[item] }}
            </label>
          </div>
        </fieldset>

        <label class="mt-3 block text-sm" for="task-list">{{ fa.task.list }}</label>
        <select id="task-list" v-model="listId" class="mt-1 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm">
          <option value="">{{ fa.task.noList }}</option>
          <option v-for="list in catalog.activeLists" :key="list.id" :value="list.id">{{ list.name }}</option>
        </select>

        <fieldset class="mt-3">
          <legend class="text-sm">{{ fa.task.tags }}</legend>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="tag in catalog.tags"
              :key="tag.id"
              type="button"
              class="min-h-11 rounded-full border border-line px-3 text-sm"
              :class="tagIds.includes(tag.id) ? 'bg-accent-soft text-accent' : ''"
              :aria-pressed="tagIds.includes(tag.id)"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </button>
          </div>
          <div class="mt-2 flex gap-2">
            <input v-model="tagName" class="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 text-sm" :placeholder="fa.task.newTag" />
            <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" @click="addTag">{{ fa.task.addTag }}</button>
          </div>
        </fieldset>

        <p v-if="formError" class="mt-3 text-sm text-danger" role="alert">{{ formError }}</p>
        <p v-if="editingTask?.dueOn" class="mt-2 text-xs text-muted">{{ formatJalaliDate(editingTask.dueOn) }}</p>
      </div>

      <div
        class="shrink-0 border-t border-line bg-surface px-4 pt-3"
        :style="{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }"
      >
        <div class="flex flex-wrap gap-2">
          <button
            type="submit"
            class="min-h-11 flex-1 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-50 sm:flex-none"
            :disabled="pending"
          >
            {{ fa.task.save }}
          </button>
          <button
            type="button"
            class="min-h-11 flex-1 rounded-xl bg-surface-muted px-4 text-sm sm:flex-none"
            @click="catalog.closeEditor()"
          >
            {{ fa.task.cancel }}
          </button>
          <button
            v-if="catalog.editor.mode === 'edit'"
            type="button"
            class="min-h-11 rounded-xl px-3 text-sm text-muted"
            @click="catalog.duplicateTask(catalog.editor.taskId)"
          >
            {{ fa.task.copy }}
          </button>
          <button
            v-if="catalog.editor.mode === 'edit'"
            type="button"
            class="min-h-11 rounded-xl px-3 text-sm text-danger"
            @click="catalog.requestRemoveTask(catalog.editor.taskId)"
          >
            {{ fa.task.remove }}
          </button>
        </div>
      </div>
    </form>
  </AppSheet>
</template>
