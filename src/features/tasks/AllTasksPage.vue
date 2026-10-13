<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
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
import { toPersianDigits } from '@/utils/digits'

const catalog = useCatalogStore()
const view = useViewStore()
const filtersOpen = ref(false)
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

const activeFilterCount = computed(() => {
  let count = 0
  if (view.search.trim()) count += 1
  if (view.sort !== 'manual') count += 1
  if (view.status !== 'active') count += 1
  if (view.priority !== 'any') count += 1
  if (view.listId !== 'any') count += 1
  if (view.due !== 'any') count += 1
  if (view.tagIds.length > 0) count += 1
  return count
})

const filterSummary = computed(() => {
  if (activeFilterCount.value === 0) return fa.task.filtersShow
  return `${toPersianDigits(activeFilterCount.value)} ${fa.task.filtersActive}`
})

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

      <div class="mt-5 overflow-hidden rounded-2xl border border-line bg-surface">
        <button
          type="button"
          class="flex min-h-12 w-full items-center justify-between gap-3 px-3 py-3 text-start sm:px-4"
          :aria-expanded="filtersOpen"
          aria-controls="tasks-filters-panel"
          @click="filtersOpen = !filtersOpen"
        >
          <span class="min-w-0">
            <span class="block text-sm font-medium text-ink">{{ fa.task.filters }}</span>
            <span class="mt-0.5 block text-xs text-muted">{{ filterSummary }}</span>
          </span>
          <ChevronDown
            class="size-5 shrink-0 text-muted transition-transform duration-200"
            :class="filtersOpen ? 'rotate-180' : ''"
            :stroke-width="1.75"
            aria-hidden="true"
          />
        </button>

        <div
          v-show="filtersOpen"
          id="tasks-filters-panel"
          class="space-y-4 border-t border-line px-3 py-4 sm:px-4"
        >
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-ink" for="tasks-search">{{ fa.task.filterSearch }}</label>
              <input
                id="tasks-search"
                v-model="view.search"
                class="mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm"
                type="search"
                :placeholder="fa.task.search"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink" for="tasks-sort">{{ fa.task.sort }}</label>
              <select id="tasks-sort" v-model="view.sort" class="mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm">
                <option value="manual">{{ fa.task.manual }}</option>
                <option value="due">{{ fa.task.byDue }}</option>
                <option value="priority">{{ fa.task.byPriority }}</option>
                <option value="title">{{ fa.task.byTitle }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-ink" for="tasks-status">{{ fa.task.filterStatus }}</label>
              <select id="tasks-status" v-model="view.status" class="mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm">
                <option value="active">{{ fa.task.active }}</option>
                <option value="completed">{{ fa.task.completed }}</option>
                <option value="all">{{ fa.task.any }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-ink" for="tasks-priority">{{ fa.task.filterPriority }}</label>
              <select id="tasks-priority" v-model="view.priority" class="mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm">
                <option value="any">{{ fa.task.anyPriority }}</option>
                <option v-for="item in PRIORITIES" :key="item" :value="item">{{ fa.priority[item] }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-ink" for="tasks-list">{{ fa.task.filterList }}</label>
              <select id="tasks-list" v-model="view.listId" class="mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm">
                <option value="any">{{ fa.task.anyList }}</option>
                <option v-for="list in catalog.lists" :key="list.id" :value="list.id">{{ list.name }}</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-ink" for="tasks-due">{{ fa.task.dueFilter }}</label>
              <select id="tasks-due" v-model="view.due" class="mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm">
                <option value="any">{{ fa.task.any }}</option>
                <option value="today">{{ fa.nav.today }}</option>
                <option value="upcoming">{{ fa.nav.upcoming }}</option>
                <option value="overdue">{{ fa.task.overdue }}</option>
                <option value="none">{{ fa.task.noneDate }}</option>
              </select>
            </div>
          </div>

          <div v-if="catalog.tags.length">
            <p id="tasks-tags-label" class="text-sm font-medium text-ink">{{ fa.task.filterTags }}</p>
            <p class="mt-0.5 text-xs text-muted">{{ fa.task.filterTagsHint }}</p>
            <div class="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="tasks-tags-label">
              <button
                v-for="tag in catalog.tags"
                :key="tag.id"
                type="button"
                class="min-h-11 rounded-full border border-line px-3 text-sm"
                :class="view.tagIds.includes(tag.id) ? 'border-accent bg-accent-soft text-accent' : 'bg-canvas text-muted'"
                :aria-pressed="view.tagIds.includes(tag.id)"
                @click="view.toggleTag(tag.id)"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <p class="text-sm font-medium text-ink">{{ fa.task.bulkActions }}</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" @click="selecting = !selecting">
            {{ fa.task.select }}
          </button>
          <button
            v-if="selecting"
            type="button"
            class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm"
            :disabled="selected.length === 0"
            @click="completeSelected"
          >
            {{ fa.task.completeSelected }}
          </button>
          <button
            v-if="selecting"
            type="button"
            class="min-h-11 rounded-xl bg-danger-soft px-3 text-sm text-danger"
            :disabled="selected.length === 0"
            @click="removeSelected"
          >
            {{ fa.task.deleteSelected }}
          </button>
        </div>
      </div>

      <EmptyState v-if="visible.length === 0" :title="fa.empty.tasksTitle" :description="fa.empty.tasksBody" />
      <TaskStack v-else :tasks="visible" :reorder="view.sort === 'manual'" :selectable="selecting" :selected-ids="selected" @select="toggle" />
    </template>
  </section>
</template>
