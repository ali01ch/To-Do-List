<script setup lang="ts">
import { computed } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import TaskStack from '@/components/TaskStack.vue'
import { fa } from '@/locales/fa'
import { completedInRange } from '@/services/taskQuery'
import { useCatalogStore } from '@/stores/catalogStore'
import { useViewStore } from '@/stores/viewStore'
import { todayDueOn } from '@/utils/dates'

const catalog = useCatalogStore()
const view = useViewStore()
const tasks = computed(() => completedInRange(catalog.tasks, view.completedRange, todayDueOn()))
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.completed.title" :description="fa.sections.completed.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <div class="mt-4" role="group" :aria-label="fa.task.range">
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="range in ['today', 'week', 'month', 'all'] as const"
            :key="range"
            type="button"
            class="min-h-11 rounded-xl border border-line text-sm"
            :class="view.completedRange === range ? 'bg-accent-soft text-accent' : 'bg-surface'"
            :aria-pressed="view.completedRange === range"
            @click="view.completedRange = range"
          >
            {{ range === 'today' ? fa.nav.today : range === 'week' ? fa.task.week : range === 'month' ? fa.task.month : fa.task.any }}
          </button>
        </div>
      </div>
      <EmptyState v-if="tasks.length === 0" :title="fa.empty.completedTitle" :description="fa.empty.completedBody" />
      <TaskStack v-else :tasks="tasks" />
    </template>
  </section>
</template>
