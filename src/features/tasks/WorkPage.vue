<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Priority } from '@/domain/types'
import { PRIORITIES } from '@/domain/types'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import QuickAdd from '@/components/QuickAdd.vue'
import TaskStack from '@/components/TaskStack.vue'
import { fa } from '@/locales/fa'
import { formatDuePhrase } from '@/services/duePhrase'
import { groupByDueOn, inboxTasks, todayBuckets, upcomingTasks } from '@/services/taskQuery'
import { useCatalogStore } from '@/stores/catalogStore'
import { addDays, todayDueOn } from '@/utils/dates'
import { toPersianDigits } from '@/utils/digits'

type WorkScope = 'all' | 'today' | 'upcoming' | 'overdue' | 'undated'
type UpcomingHorizon = 'all' | 'week' | 'month'

const catalog = useCatalogStore()
const scope = ref<WorkScope>('all')
const priority = ref<Priority | 'any'>('any')
const listId = ref<string | 'any'>('any')
const horizon = ref<UpcomingHorizon>('all')
const showCompletedToday = ref(true)

const today = computed(() => todayDueOn())

function matchesExtras(task: { priority: Priority; listId: string | null }): boolean {
  if (priority.value !== 'any' && task.priority !== priority.value) return false
  if (listId.value !== 'any' && task.listId !== listId.value) return false
  return true
}

const buckets = computed(() => {
  const raw = todayBuckets(catalog.tasks, today.value)
  return {
    overdue: raw.overdue.filter(matchesExtras),
    today: raw.today.filter(matchesExtras),
    completedToday: raw.completedToday.filter(matchesExtras),
  }
})

const undated = computed(() => inboxTasks(catalog.tasks).filter(matchesExtras))

const upcomingGroups = computed(() => {
  let tasks = upcomingTasks(catalog.tasks, today.value).filter(matchesExtras)
  if (horizon.value === 'week') {
    const end = addDays(today.value, 7)
    tasks = tasks.filter((task) => task.dueOn !== null && task.dueOn <= end)
  } else if (horizon.value === 'month') {
    const end = addDays(today.value, 30)
    tasks = tasks.filter((task) => task.dueOn !== null && task.dueOn <= end)
  }
  return groupByDueOn(tasks)
})

const showOverdue = computed(() => scope.value === 'all' || scope.value === 'overdue' || scope.value === 'today')
const showToday = computed(() => scope.value === 'all' || scope.value === 'today')
const showUpcoming = computed(() => scope.value === 'all' || scope.value === 'upcoming')
const showUndated = computed(() => scope.value === 'all' || scope.value === 'undated')

const progress = computed(() => {
  const done = buckets.value.completedToday.length
  const total = done + buckets.value.today.length
  return { done, total, ratio: total === 0 ? 0 : done / total }
})

const isEmpty = computed(() => {
  const overdue = showOverdue.value ? buckets.value.overdue.length : 0
  const todayCount = showToday.value ? buckets.value.today.length : 0
  const done = showToday.value && showCompletedToday.value ? buckets.value.completedToday.length : 0
  const upcoming = showUpcoming.value ? upcomingGroups.value.reduce((sum, group) => sum + group.tasks.length, 0) : 0
  const free = showUndated.value ? undated.value.length : 0
  return overdue + todayCount + done + upcoming + free === 0
})

const addPreset = computed(() => {
  if (scope.value === 'upcoming') return { dueOn: addDays(today.value, 1) }
  if (scope.value === 'today' || scope.value === 'overdue') return { dueOn: today.value }
  return { dueOn: null }
})

const scopes: { id: WorkScope; label: string }[] = [
  { id: 'all', label: fa.task.workScopeAll },
  { id: 'today', label: fa.nav.today },
  { id: 'upcoming', label: fa.nav.upcoming },
  { id: 'overdue', label: fa.task.overdue },
  { id: 'undated', label: fa.task.noDate },
]

const horizons: { id: UpcomingHorizon; label: string }[] = [
  { id: 'all', label: fa.task.horizonAll },
  { id: 'week', label: fa.task.horizonWeek },
  { id: 'month', label: fa.task.horizonMonth },
]
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.work.title" :description="fa.sections.work.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <QuickAdd :preset="addPreset" />

      <div class="mt-4 flex flex-wrap gap-2" role="group" :aria-label="fa.task.workScope">
        <button
          v-for="item in scopes"
          :key="item.id"
          type="button"
          class="min-h-11 rounded-full border border-line px-3 text-sm transition-colors"
          :class="scope === item.id ? 'border-accent bg-accent-soft text-accent' : 'bg-surface text-muted'"
          :aria-pressed="scope === item.id"
          @click="scope = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="mt-3 grid gap-2 sm:grid-cols-2">
        <select v-model="priority" class="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm" :aria-label="fa.task.priority">
          <option value="any">{{ fa.task.anyPriority }}</option>
          <option v-for="item in PRIORITIES" :key="item" :value="item">{{ fa.priority[item] }}</option>
        </select>
        <select v-model="listId" class="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm" :aria-label="fa.task.list">
          <option value="any">{{ fa.task.anyList }}</option>
          <option v-for="list in catalog.activeLists" :key="list.id" :value="list.id">{{ list.name }}</option>
        </select>
      </div>

      <div
        v-if="showUpcoming"
        class="mt-3 flex flex-wrap gap-2"
        role="group"
        :aria-label="fa.task.horizon"
      >
        <button
          v-for="item in horizons"
          :key="item.id"
          type="button"
          class="min-h-11 rounded-full border border-line px-3 text-sm transition-colors"
          :class="horizon === item.id ? 'border-accent bg-accent-soft text-accent' : 'bg-surface text-muted'"
          :aria-pressed="horizon === item.id"
          @click="horizon = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <label v-if="showToday" class="mt-3 flex min-h-11 items-center gap-2 text-sm text-muted">
        <input v-model="showCompletedToday" type="checkbox" class="size-4 accent-accent" />
        {{ fa.task.showDoneToday }}
      </label>

      <div v-if="showToday && progress.total > 0" class="mt-4">
        <div class="flex items-center justify-between text-xs text-muted">
          <span>{{ fa.task.progress }}</span>
          <span>{{ toPersianDigits(progress.done) }} / {{ toPersianDigits(progress.total) }}</span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div class="h-full bg-accent" :style="{ width: `${progress.ratio * 100}%` }" />
        </div>
      </div>

      <EmptyState v-if="isEmpty" :title="fa.empty.workTitle" :description="fa.empty.workBody" />
      <template v-else>
        <template v-if="showUndated && undated.length">
          <h2 class="mt-6 text-sm font-medium text-muted">{{ fa.task.noDate }}</h2>
          <TaskStack :tasks="undated" reorder />
        </template>

        <template v-if="showOverdue && buckets.overdue.length">
          <h2 class="mt-6 text-sm font-medium text-overdue">{{ fa.task.overdue }}</h2>
          <TaskStack :tasks="buckets.overdue" reorder />
        </template>

        <template v-if="showToday && buckets.today.length">
          <h2 class="mt-6 text-sm font-medium text-muted">{{ fa.nav.today }}</h2>
          <TaskStack :tasks="buckets.today" reorder />
        </template>

        <template v-if="showToday && showCompletedToday && buckets.completedToday.length">
          <h2 class="mt-6 text-sm font-medium text-muted">{{ fa.task.doneToday }}</h2>
          <TaskStack :tasks="buckets.completedToday" />
        </template>

        <template v-if="showUpcoming && upcomingGroups.length">
          <h2 class="mt-8 text-base font-semibold tracking-tight">{{ fa.nav.upcoming }}</h2>
          <section v-for="group in upcomingGroups" :key="group.dueOn" class="mt-4">
            <h3 class="text-sm text-muted">{{ formatDuePhrase(group.dueOn, today) }}</h3>
            <TaskStack :tasks="group.tasks" reorder />
          </section>
        </template>
      </template>
    </template>
  </section>
</template>
