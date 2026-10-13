<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import QuickAdd from '@/components/QuickAdd.vue'
import TaskStack from '@/components/TaskStack.vue'
import { listColorClass } from '@/features/lists/listStyle'
import { fa } from '@/locales/fa'
import { tasksForList } from '@/services/taskQuery'
import { useCatalogStore } from '@/stores/catalogStore'
import { useViewStore } from '@/stores/viewStore'

const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()
const view = useViewStore()
const listId = computed(() => String(route.params.id))
const list = computed(() => catalog.lists.find((item) => item.id === listId.value))
const tasks = computed(() => (list.value ? tasksForList(catalog.tasks, list.value.id, view.includeCompletedInList) : []))

async function remove(): Promise<void> {
  if (!list.value) return
  const confirmed = await catalog.requestRemoveList(list.value.id)
  if (confirmed) await router.push({ name: 'lists' })
}
</script>

<template>
  <section>
    <RouterLink
      :to="{ name: 'lists' }"
      class="-ms-2 mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
    >
      <ChevronRight :size="20" :stroke-width="2" aria-hidden="true" />
      {{ fa.task.backToLists }}
    </RouterLink>
    <p v-if="catalog.status === 'loading'" class="mt-4 text-sm text-muted">{{ fa.empty.loading }}</p>
    <EmptyState v-else-if="!list" :title="fa.empty.missingList" />
    <template v-else>
      <div class="flex items-start gap-3">
        <span class="mt-2 size-3 shrink-0 rounded-full" :class="listColorClass[list.color]" aria-hidden="true" />
        <PageHeader :title="list.name" :description="list.archivedAt ? fa.task.archived : fa.sections.lists.description" />
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" @click="catalog.setListArchived(list.id, list.archivedAt === null)">
          {{ list.archivedAt ? fa.task.unarchive : fa.task.archive }}
        </button>
        <button type="button" class="min-h-11 rounded-xl bg-danger-soft px-3 text-sm text-danger" @click="remove">{{ fa.task.remove }}</button>
      </div>
      <label class="mt-3 flex min-h-11 items-center gap-2 text-sm">
        <input v-model="view.includeCompletedInList" type="checkbox" class="size-5" />
        {{ fa.task.showCompleted }}
      </label>
      <QuickAdd :preset="{ listId: list.id }" />
      <EmptyState v-if="tasks.length === 0" :title="fa.empty.tasksTitle" :description="fa.empty.tasksBody" />
      <TaskStack v-else :tasks="tasks" reorder />
    </template>
  </section>
</template>
