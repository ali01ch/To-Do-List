<script setup lang="ts">
import { computed } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import QuickAdd from '@/components/QuickAdd.vue'
import TaskStack from '@/components/TaskStack.vue'
import { fa } from '@/locales/fa'
import { inboxTasks } from '@/services/taskQuery'
import { useCatalogStore } from '@/stores/catalogStore'

const catalog = useCatalogStore()
const tasks = computed(() => inboxTasks(catalog.tasks))
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.inbox.title" :description="fa.sections.inbox.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <QuickAdd :preset="{ dueOn: null }" />
      <EmptyState v-if="tasks.length === 0" :title="fa.empty.inboxTitle" :description="fa.empty.inboxBody" />
      <TaskStack v-else :tasks="tasks" reorder />
    </template>
  </section>
</template>
