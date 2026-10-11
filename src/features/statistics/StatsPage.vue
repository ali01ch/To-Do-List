<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { fa } from '@/locales/fa'
import { formatDuePhrase } from '@/services/duePhrase'
import { summarize } from '@/services/stats'
import { useCatalogStore } from '@/stores/catalogStore'
import { todayDueOn } from '@/utils/dates'
import { toPersianDigits } from '@/utils/digits'

const catalog = useCatalogStore()
const summary = computed(() => summarize(catalog.tasks, catalog.sessions, todayDueOn()))
const peak = computed(() => Math.max(1, ...summary.value.days.map((day) => day.completed)))
const today = todayDueOn()
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.stats.title" :description="fa.sections.stats.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <dl class="mt-5 grid grid-cols-2 gap-2">
        <div class="rounded-2xl border border-line bg-surface p-3">
          <dt class="text-xs text-muted">{{ fa.task.completedCount }}</dt>
          <dd class="mt-1 text-2xl font-semibold">{{ toPersianDigits(summary.completedTotal) }}</dd>
        </div>
        <div class="rounded-2xl border border-line bg-surface p-3">
          <dt class="text-xs text-muted">{{ fa.task.openToday }}</dt>
          <dd class="mt-1 text-2xl font-semibold">{{ toPersianDigits(summary.openToday) }}</dd>
        </div>
        <div class="rounded-2xl border border-line bg-surface p-3">
          <dt class="text-xs text-muted">{{ fa.task.overdue }}</dt>
          <dd class="mt-1 text-2xl font-semibold">{{ toPersianDigits(summary.overdue) }}</dd>
        </div>
        <div class="rounded-2xl border border-line bg-surface p-3">
          <dt class="text-xs text-muted">{{ fa.task.weekCompleted }}</dt>
          <dd class="mt-1 text-2xl font-semibold">{{ toPersianDigits(summary.completedWeek) }}</dd>
        </div>
        <div class="rounded-2xl border border-line bg-surface p-3">
          <dt class="text-xs text-muted">{{ fa.task.focusToday }}</dt>
          <dd class="mt-1 text-2xl font-semibold">{{ toPersianDigits(summary.focusMinutesToday) }} <span class="text-sm font-normal text-muted">{{ fa.task.minutes }}</span></dd>
        </div>
        <div class="rounded-2xl border border-line bg-surface p-3">
          <dt class="text-xs text-muted">{{ fa.task.focusWeek }}</dt>
          <dd class="mt-1 text-2xl font-semibold">{{ toPersianDigits(summary.focusMinutesWeek) }} <span class="text-sm font-normal text-muted">{{ fa.task.minutes }}</span></dd>
        </div>
      </dl>
      <h2 class="mt-6 text-sm text-muted">{{ fa.task.weekCompleted }}</h2>
      <p v-if="summary.completedWeek === 0" class="mt-2 text-sm leading-7 text-muted">{{ fa.task.noStats }}</p>
      <ul class="mt-3 space-y-2">
        <li v-for="day in summary.days" :key="day.dueOn" class="flex items-center gap-3">
          <span class="w-16 shrink-0 text-xs text-muted">{{ formatDuePhrase(day.dueOn, today) }}</span>
          <span class="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <span class="block h-full bg-accent" :style="{ width: `${(day.completed / peak) * 100}%` }" />
          </span>
          <span class="w-6 text-xs">{{ toPersianDigits(day.completed) }}</span>
        </li>
      </ul>
    </template>
  </section>
</template>
