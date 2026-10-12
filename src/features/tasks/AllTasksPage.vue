<script setup lang="ts">
import { computed, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import QuickAdd from '@/components/QuickAdd.vue'
import TaskStack from '@/components/TaskStack.vue'
import { PRIORITIES } from '@/domain/types'
import { fa } from '@/locales/fa'
import { filterTasks, sortTasks } from '@/services/taskQuery'
import { useCatalogStore } from '@/stores/catalogStore'
import { useViewStore } from '@/stores/viewStore'
import { todayDueOn } from '@/utils/dates'

const catalog = useCatalogStore()
const view = useViewStore()
const selecting = ref(false)
const selected = ref<string[]>([])

const visible = computed(() =>
  sortTasks(
    filterTasks(
      catalog.tasks,
      {
        search: view.search,
        status: view.status,
        priority: view.priority,
        listId: view.listId,
        tagIds: view.tagIds,
        due: view.due,
      },
      catalog.tagsByTask,
      todayDueOn(),
    ),
    view.sort,
  ),
)

function toggle(id: string): void {
  selected.value = selected.value.includes(id) ? selected.value.filter((item) => item !== id) : [...selected.value, id]
}

async function removeSelected(): Promise<void> {
  const ids = [...selected.value]
  const confirmed = await catalog.requestRemoveTasks(ids)
  if (!confirmed) return
  selected.value = []
  selecting.value = false
}

async function completeSelected(): Promise<void> {
  await catalog.completeTasks(selected.value)
  selected.value = []
}
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.tasks.title" :description="fa.sections.tasks.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <QuickAdd />
      <div class="mt-4 grid gap-2 sm:grid-cols-2">
        <input v-model="view.search" class="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm" type="search" :placeholder="fa.task.search" :aria-label="fa.task.search" />
        <select v-model="view.sort" class="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm" :aria-label="fa.task.sort">
          <option value="manual">{{ fa.task.manual }}</option>
          <option value="due">{{ fa.task.byDue }}</option>
          <option value="priority">{{ fa.task.byPriority }}</option>
          <option value="title">{{ fa.task.byTitle }}</option>
        </select>
        <select v-model="view.status" class="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm" :aria-label="fa.task.status">
          <option value="active">{{ fa.task.active }}</option>
          <option value="completed">{{ fa.task.completed }}</option>
          <option value="all">{{ fa.task.any }}</option>
        </select>
        <select v-model="view.priority" class="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm" :aria-label="fa.task.priority">
          <option value="any">{{ fa.task.any }}</option>
          <option v-for="item in PRIORITIES" :key="item" :value="item">{{ fa.priority[item] }}</option>
        </select>
        <select v-model="view.listId" class="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm" :aria-label="fa.task.list">
          <option value="any">{{ fa.task.any }}</option>
          <option v-for="list in catalog.lists" :key="list.id" :value="list.id">{{ list.name }}</option>
        </select>
        <select v-model="view.due" class="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm" :aria-label="fa.task.dueFilter">
          <option value="any">{{ fa.task.any }}</option>
          <option value="today">{{ fa.nav.today }}</option>
          <option value="upcoming">{{ fa.nav.upcoming }}</option>
          <option value="overdue">{{ fa.task.overdue }}</option>
          <option value="none">{{ fa.task.noneDate }}</option>
        </select>
      </div>
      <div v-if="catalog.tags.length" class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="tag in catalog.tags"
          :key="tag.id"
          type="button"
          class="min-h-11 rounded-full border border-line px-3 text-sm"
          :class="view.tagIds.includes(tag.id) ? 'bg-accent-soft text-accent' : ''"
          :aria-pressed="view.tagIds.includes(tag.id)"
          @click="view.toggleTag(tag.id)"
        >
          {{ tag.name }}
        </button>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" @click="selecting = !selecting">{{ fa.task.select }}</button>
        <button v-if="selecting" type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" :disabled="selected.length === 0" @click="completeSelected">
          {{ fa.task.completeSelected }}
        </button>
        <button v-if="selecting" type="button" class="min-h-11 rounded-xl bg-danger-soft px-3 text-sm text-danger" :disabled="selected.length === 0" @click="removeSelected">
          {{ fa.task.deleteSelected }}
        </button>
      </div>
      <EmptyState v-if="visible.length === 0" :title="fa.empty.tasksTitle" :description="fa.empty.tasksBody" />
      <TaskStack v-else :tasks="visible" :reorder="view.sort === 'manual'" :selectable="selecting" :selected-ids="selected" @select="toggle" />
    </template>
  </section>
</template>
