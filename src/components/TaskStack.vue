<script setup lang="ts">
import type { Task } from '@/domain/types'
import TaskRow from '@/components/TaskRow.vue'
import { useCatalogStore } from '@/stores/catalogStore'

const props = defineProps<{
  tasks: Task[]
  selectable?: boolean
  selectedIds?: string[]
  reorder?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const catalog = useCatalogStore()

function tagNames(task: Task): string[] {
  return (catalog.tagsByTask.get(task.id) ?? [])
    .map((tagId) => catalog.tags.find((tag) => tag.id === tagId)?.name)
    .filter((name): name is string => Boolean(name))
}

function listOf(task: Task) {
  return catalog.lists.find((list) => list.id === task.listId)
}
</script>

<template>
  <ul class="mt-3 space-y-2">
    <li v-for="(task, index) in tasks" :key="task.id">
      <TaskRow
        :task="task"
        :list="listOf(task)"
        :tags="tagNames(task)"
        :selectable="selectable"
        :selected="selectedIds?.includes(task.id)"
        :can-move-up="reorder && index > 0"
        :can-move-down="reorder && index < tasks.length - 1"
        @toggle="catalog.toggleComplete(task.id)"
        @edit="catalog.openEdit(task.id)"
        @remove="catalog.requestRemoveTask(task.id)"
        @move="catalog.moveTask(task.id, $event, tasks.map((item) => item.id))"
        @select="emit('select', task.id)"
      />
    </li>
  </ul>
</template>
