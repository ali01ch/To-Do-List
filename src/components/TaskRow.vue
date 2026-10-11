<script setup lang="ts">
import { ArrowDown, ArrowUp, Trash2 } from '@lucide/vue'
import type { Task, TaskList } from '@/domain/types'
import { fa } from '@/locales/fa'
import { formatDueWithState } from '@/services/duePhrase'
import { todayDueOn } from '@/utils/dates'
import { toPersianDigits } from '@/utils/digits'

defineProps<{
  task: Task
  list?: TaskList
  tags: string[]
  selectable?: boolean
  selected?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  edit: []
  remove: []
  move: [direction: -1 | 1]
  select: []
}>()

const today = todayDueOn()
</script>

<template>
  <article class="flex items-start gap-2 rounded-2xl border border-line bg-surface px-3 py-3" :class="task.completedAt ? 'opacity-70' : ''">
    <label v-if="selectable" class="mt-1 flex size-11 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        class="size-5 accent-accent"
        :checked="selected"
        :aria-label="fa.task.selected"
        @change="emit('select')"
      />
    </label>
    <button
      type="button"
      role="checkbox"
      class="mt-1 grid size-11 shrink-0 place-items-center rounded-full border border-line"
      :class="task.completedAt ? 'bg-accent text-accent-ink' : 'bg-surface'"
      :aria-checked="task.completedAt ? 'true' : 'false'"
      :aria-label="task.completedAt ? fa.task.uncomplete : fa.task.complete"
      @click="emit('toggle')"
    >
      <span v-if="task.completedAt" aria-hidden="true">✓</span>
    </button>
    <button type="button" class="min-w-0 flex-1 py-1 text-start" @click="emit('edit')">
      <span class="block truncate text-sm font-medium" :class="task.completedAt ? 'line-through' : ''">{{ task.title }}</span>
      <span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span v-if="task.priority !== 'none'">{{ fa.priority[task.priority] }}</span>
        <span v-if="formatDueWithState(task.dueOn, today)" :class="task.dueOn && task.dueOn < today && !task.completedAt ? 'text-overdue' : ''">
          {{ formatDueWithState(task.dueOn, today) }}
          <span v-if="task.dueTime"> {{ toPersianDigits(task.dueTime) }}</span>
        </span>
        <span v-if="list">{{ list.name }}</span>
        <span v-for="tag in tags" :key="tag">#{{ tag }}</span>
      </span>
    </button>
    <div class="flex shrink-0">
      <button
        v-if="canMoveUp"
        type="button"
        class="grid size-11 place-items-center text-muted"
        :aria-label="fa.task.moveUp"
        @click="emit('move', -1)"
      >
        <ArrowUp :size="18" :stroke-width="1.75" aria-hidden="true" />
      </button>
      <button
        v-if="canMoveDown"
        type="button"
        class="grid size-11 place-items-center text-muted"
        :aria-label="fa.task.moveDown"
        @click="emit('move', 1)"
      >
        <ArrowDown :size="18" :stroke-width="1.75" aria-hidden="true" />
      </button>
      <button type="button" class="grid size-11 place-items-center text-muted" :aria-label="fa.task.remove" @click="emit('remove')">
        <Trash2 :size="18" :stroke-width="1.75" aria-hidden="true" />
      </button>
    </div>
  </article>
</template>
