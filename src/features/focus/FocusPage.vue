<script setup lang="ts">
import { computed, onMounted } from 'vue'
import FocusTimer from '@/components/FocusTimer.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { FocusTimerStyle } from '@/domain/types'
import { errorText, fa } from '@/locales/fa'
import { useCatalogStore } from '@/stores/catalogStore'
import { useFocusStore } from '@/stores/focusStore'

const catalog = useCatalogStore()
const focus = useFocusStore()
const openTasks = computed(() => catalog.tasks.filter((task) => !task.completedAt && !task.deletedAt))
const kindLabel = computed(() => (focus.kind === 'focus' ? fa.task.focusTime : fa.task.breakTime))

const styleOptions: { id: FocusTimerStyle; label: string }[] = [
  { id: 'digital', label: fa.task.focusTimerDigital },
  { id: 'ring', label: fa.task.focusTimerRing },
]

onMounted(() => {
  void focus.hydrateTimerStyle()
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

    <div class="mt-6">
      <p id="focus-timer-style" class="text-sm font-medium text-ink">{{ fa.task.focusTimerStyle }}</p>
      <div class="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="focus-timer-style">
        <button
          v-for="option in styleOptions"
          :key="option.id"
          type="button"
          class="min-h-11 rounded-full border border-line px-4 text-sm transition-colors"
          :class="
            focus.timerStyle === option.id
              ? 'border-accent bg-accent-soft font-medium text-accent'
              : 'bg-surface text-muted'
          "
          :aria-pressed="focus.timerStyle === option.id"
          @click="focus.setTimerStyle(option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="mt-8 flex justify-center">
      <FocusTimer
        :style-kind="focus.timerStyle"
        :remaining-ms="focus.remainingMs"
        :total-ms="focus.totalMs"
        :label="kindLabel"
      />
    </div>

    <div class="mt-6 flex flex-wrap justify-center gap-2">
      <button
        v-if="!focus.running"
        type="button"
        class="min-h-11 rounded-xl bg-accent px-5 text-sm font-medium text-accent-ink"
        @click="focus.start()"
      >
        {{
          focus.remainingMs < focus.totalMs ? fa.task.focusResume : fa.task.focusStart
        }}
      </button>
      <button
        v-else
        type="button"
        class="min-h-11 rounded-xl bg-surface-muted px-5 text-sm"
        @click="focus.pause()"
      >
        {{ fa.task.focusPause }}
      </button>
      <button
        type="button"
        class="min-h-11 rounded-xl border border-line bg-surface px-5 text-sm text-muted"
        :disabled="!focus.running && focus.remainingMs >= focus.totalMs"
        @click="focus.reset()"
      >
        {{ fa.task.focusReset }}
      </button>
    </div>

    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      <label class="text-sm">
        {{ fa.task.focusMinutes }}
        <input
          class="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
          type="number"
          min="1"
          max="180"
          :value="focus.focusMinutes"
          :disabled="focus.running"
          @change="onFocusMinutes"
        />
      </label>
      <label class="text-sm">
        {{ fa.task.breakMinutes }}
        <input
          class="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
          type="number"
          min="1"
          max="60"
          :value="focus.breakMinutes"
          :disabled="focus.running"
          @change="onBreakMinutes"
        />
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
