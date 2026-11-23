<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import type { ProjectTask } from '@/domain/types'
import { fa } from '@/locales/fa'

defineProps<{
  task: ProjectTask
}>()

const emit = defineEmits<{
  toggle: []
  edit: []
  remove: []
}>()
</script>

<template>
  <article
    class="flex cursor-pointer items-start gap-2 rounded-2xl border border-line bg-surface px-3 py-3"
    :class="task.completedAt ? 'opacity-70' : ''"
    @click="emit('toggle')"
  >
    <button
      type="button"
      role="checkbox"
      class="mt-1 grid size-11 shrink-0 place-items-center rounded-full border border-line"
      :class="task.completedAt ? 'bg-accent text-accent-ink' : 'bg-surface'"
      :aria-checked="task.completedAt ? 'true' : 'false'"
      :aria-label="task.completedAt ? fa.task.uncomplete : fa.task.complete"
      @click.stop="emit('toggle')"
    >
      <span v-if="task.completedAt" aria-hidden="true">✓</span>
    </button>
    <div class="min-w-0 flex-1 py-1 text-start">
      <span class="block text-sm font-medium" :class="task.completedAt ? 'line-through' : ''">{{ task.title }}</span>
      <p v-if="task.description" class="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-muted">{{ task.description }}</p>
    </div>
    <div class="flex shrink-0" dir="ltr" @click.stop>
      <button type="button" class="grid size-11 place-items-center text-muted" :aria-label="fa.task.remove" @click="emit('remove')">
        <Trash2 :size="18" :stroke-width="1.75" aria-hidden="true" />
      </button>
      <button type="button" class="grid size-11 place-items-center text-muted" :aria-label="fa.task.edit" @click="emit('edit')">
        <Pencil :size="18" :stroke-width="1.75" aria-hidden="true" />
      </button>
    </div>
  </article>
</template>