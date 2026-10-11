<script setup lang="ts">
import { computed } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import QuickAdd from '@/components/QuickAdd.vue'
import TaskStack from '@/components/TaskStack.vue'
import { fa } from '@/locales/fa'
import { formatDuePhrase } from '@/services/duePhrase'
import { groupByDueOn, todayBuckets, upcomingTasks } from '@/services/taskQuery'
import { useCatalogStore } from '@/stores/catalogStore'
import { addDays, todayDueOn } from '@/utils/dates'

const catalog = useCatalogStore()
const today = computed(() => todayDueOn())
const groups = computed(() => groupByDueOn(upcomingTasks(catalog.tasks, today.value)))
const overdue = computed(() => todayBuckets(catalog.tasks, today.value).overdue)
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.upcoming.title" :description="fa.sections.upcoming.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <QuickAdd :preset="{ dueOn: addDays(today, 1) }" />
      <h2 v-if="overdue.length" class="mt-6 text-sm text-overdue">{{ fa.task.overdue }}</h2>
      <TaskStack v-if="overdue.length" :tasks="overdue" />
      <EmptyState v-if="groups.length === 0" :title="fa.empty.upcomingTitle" :description="fa.empty.upcomingBody" />
      <section v-for="group in groups" :key="group.dueOn" class="mt-6">
        <h2 class="text-sm text-muted">{{ formatDuePhrase(group.dueOn, today) }}</h2>
        <TaskStack :tasks="group.tasks" reorder />
      </section>
    </template>
  </section>
</template>
