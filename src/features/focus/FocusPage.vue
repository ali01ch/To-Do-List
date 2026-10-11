<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { errorText, fa } from '@/locales/fa'
import { useCatalogStore } from '@/stores/catalogStore'
import { useFocusStore } from '@/stores/focusStore'
import { toPersianDigits } from '@/utils/digits'

const catalog = useCatalogStore()
const focus = useFocusStore()
const openTasks = computed(() => catalog.tasks.filter((task) => !task.completedAt && !task.deletedAt))

const clock = computed(() => {
  const total = Math.ceil(focus.remainingMs / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return toPersianDigits(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
})

function onFocusMinutes(event: Event): void {
  focus.setFocusMinutes(Number((event.target as HTMLInputElement).value))
}

function onBreakMinutes(event: Event): void {
  focus.setBreakMinutes(Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.focus.title" :description="fa.sections.focus.description" />
    <p class="mt-6 text-center text-5xl font-semibold tracking-tight" dir="ltr">{{ clock }}</p>
    <p class="mt-2 text-center text-sm text-muted">{{ focus.kind === 'focus' ? fa.task.focusTime : fa.task.breakTime }}</p>
    <div class="mt-6 flex justify-center gap-2">
      <button v-if="!focus.running" type="button" class="min-h-11 rounded-xl bg-accent px-5 text-sm font-medium text-accent-ink" @click="focus.start()">
        {{ focus.remainingMs < (focus.kind === 'focus' ? focus.focusMinutes : focus.breakMinutes) * 60000 ? fa.task.focusResume : fa.task.focusStart }}
      </button>
      <button v-else type="button" class="min-h-11 rounded-xl bg-surface-muted px-5 text-sm" @click="focus.pause()">{{ fa.task.focusPause }}</button>
    </div>
    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      <label class="text-sm">
        {{ fa.task.focusMinutes }}
        <input class="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3" type="number" min="1" max="180" :value="focus.focusMinutes" :disabled="focus.running" @change="onFocusMinutes" />
      </label>
      <label class="text-sm">
        {{ fa.task.breakMinutes }}
        <input class="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3" type="number" min="1" max="60" :value="focus.breakMinutes" :disabled="focus.running" @change="onBreakMinutes" />
      </label>
    </div>
    <label class="mt-3 block text-sm">
      {{ fa.task.linkedTask }}
      <select v-model="focus.taskId" class="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3">
        <option :value="null">{{ fa.task.noTask }}</option>
        <option v-for="task in openTasks" :key="task.id" :value="task.id">{{ task.title }}</option>
      </select>
    </label>
    <p class="mt-4 text-sm leading-7 text-muted">{{ fa.task.focusNote }}</p>
    <p v-if="focus.error" class="mt-3 text-sm text-danger" role="alert">{{ errorText(focus.error) }}</p>
  </section>
</template>
