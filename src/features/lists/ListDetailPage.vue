<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
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
const confirm = ref(false)
const listId = computed(() => String(route.params.id))
const list = computed(() => catalog.lists.find((item) => item.id === listId.value))
const tasks = computed(() => (list.value ? tasksForList(catalog.tasks, list.value.id, view.includeCompletedInList) : []))

async function remove(): Promise<void> {
  if (!list.value) return
  await catalog.removeList(list.value.id)
  confirm.value = false
  await router.push({ name: 'lists' })
}
</script>

<template>
  <section>
    <RouterLink :to="{ name: 'lists' }" class="text-sm text-muted">{{ fa.task.back }}</RouterLink>
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <EmptyState v-else-if="!list" :title="fa.empty.missingList" />
    <template v-else>
      <PageHeader :title="list.name" :description="list.archivedAt ? fa.task.archived : fa.sections.lists.description" />
      <span class="mt-3 inline-block size-3 rounded-full" :class="listColorClass[list.color]" />
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" @click="catalog.setListArchived(list.id, list.archivedAt === null)">
          {{ list.archivedAt ? fa.task.unarchive : fa.task.archive }}
        </button>
        <button type="button" class="min-h-11 rounded-xl bg-danger-soft px-3 text-sm" @click="confirm = true">{{ fa.task.remove }}</button>
      </div>
      <label class="mt-3 flex min-h-11 items-center gap-2 text-sm">
        <input v-model="view.includeCompletedInList" type="checkbox" class="size-5" />
        {{ fa.task.showCompleted }}
      </label>
      <QuickAdd :preset="{ listId: list.id }" />
      <EmptyState v-if="tasks.length === 0" :title="fa.empty.tasksTitle" :description="fa.empty.tasksBody" />
      <TaskStack v-else :tasks="tasks" reorder />
      <ConfirmDialog
        :open="confirm"
        :title="fa.task.confirmList"
        :body="fa.task.confirmListBody"
        :confirm-label="fa.task.remove"
        @cancel="confirm = false"
        @confirm="remove"
      />
    </template>
  </section>
</template>
