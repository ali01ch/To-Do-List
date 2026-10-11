<script setup lang="ts">
import { computed } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import QuickAdd from '@/components/QuickAdd.vue'
import TaskStack from '@/components/TaskStack.vue'
import { fa } from '@/locales/fa'
import { todayBuckets } from '@/services/taskQuery'
import { useCatalogStore } from '@/stores/catalogStore'
import { todayDueOn } from '@/utils/dates'
import { toPersianDigits } from '@/utils/digits'

const catalog = useCatalogStore()
const buckets = computed(() => todayBuckets(catalog.tasks, todayDueOn()))
const progress = computed(() => {
  const done = buckets.value.completedToday.length
  const total = done + buckets.value.today.length
  return { done, total, ratio: total === 0 ? 0 : done / total }
})
const isEmpty = computed(
  () => buckets.value.overdue.length + buckets.value.today.length + buckets.value.completedToday.length === 0,
)
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.today.title" :description="fa.sections.today.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <QuickAdd :preset="{ dueOn: todayDueOn() }" />
      <div v-if="progress.total > 0" class="mt-4">
        <div class="flex items-center justify-between text-xs text-muted">
          <span>{{ fa.task.progress }}</span>
          <span>{{ toPersianDigits(progress.done) }} / {{ toPersianDigits(progress.total) }}</span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div class="h-full bg-accent" :style="{ width: `${progress.ratio * 100}%` }" />
        </div>
      </div>
      <EmptyState v-if="isEmpty" :title="fa.empty.todayTitle" :description="fa.empty.todayBody" />
      <template v-else>
        <h2 v-if="buckets.overdue.length" class="mt-6 text-sm text-overdue">{{ fa.task.overdue }}</h2>
        <TaskStack v-if="buckets.overdue.length" :tasks="buckets.overdue" reorder />
        <h2 v-if="buckets.today.length" class="mt-6 text-sm text-muted">{{ fa.sections.today.title }}</h2>
        <TaskStack v-if="buckets.today.length" :tasks="buckets.today" reorder />
        <h2 v-if="buckets.completedToday.length" class="mt-6 text-sm text-muted">{{ fa.task.doneToday }}</h2>
        <TaskStack v-if="buckets.completedToday.length" :tasks="buckets.completedToday" />
      </template>
    </template>
  </section>
</template>
