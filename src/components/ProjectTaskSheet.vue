<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppSheet from '@/components/AppSheet.vue'
import { fa } from '@/locales/fa'
import { useCatalogStore } from '@/stores/catalogStore'

const catalog = useCatalogStore()
const title = ref('')
const description = ref('')
const pending = ref(false)

const open = computed(() => catalog.projectTaskEditor !== null)

const editingTask = computed(() => {
  const editor = catalog.projectTaskEditor
  if (!editor) return undefined
  return catalog.projectTasks.find((task) => task.id === editor.taskId)
})

watch(
  () => catalog.projectTaskEditor,
  (editor) => {
    if (!editor) return
    const task = catalog.projectTasks.find((item) => item.id === editor.taskId)
    if (!task) return
    title.value = task.title
    description.value = task.description
  },
  { immediate: true },
)

async function save(): Promise<void> {
  const task = editingTask.value
  if (pending.value || !task || !title.value.trim()) return
  pending.value = true
  try {
    await catalog.updateProjectTask(task.id, { title: title.value, description: description.value })
    catalog.closeProjectTaskEditor()
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AppSheet :open="open" :title="fa.project.editTask" @close="catalog.closeProjectTaskEditor()">
    <header class="shrink-0 border-b border-line px-4 py-3">
      <h2 class="text-base font-semibold">{{ fa.project.editTask }}</h2>
    </header>
    <form v-if="editingTask" class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4" @submit.prevent="save">
      <label class="block text-sm" for="pt-title">{{ fa.task.title }}</label>
      <input id="pt-title" v-model="title" class="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm" />
      <label class="block text-sm" for="pt-desc">{{ fa.task.description }}</label>
      <textarea
        id="pt-desc"
        v-model="description"
        rows="4"
        class="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm"
      />
      <div class="flex gap-2 pt-2">
        <button type="submit" class="min-h-11 flex-1 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-50" :disabled="pending || !title.trim()">
          {{ fa.task.save }}
        </button>
        <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-4 text-sm" @click="catalog.closeProjectTaskEditor()">
          {{ fa.task.cancel }}
        </button>
      </div>
    </form>
  </AppSheet>
</template>