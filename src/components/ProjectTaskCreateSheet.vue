<script setup lang="ts">
import { ref, watch } from 'vue'
import AppSheet from '@/components/AppSheet.vue'
import ProjectTaskPriorityPicker from '@/components/ProjectTaskPriorityPicker.vue'
import type { Priority } from '@/domain/types'
import { fa } from '@/locales/fa'
import { useCatalogStore } from '@/stores/catalogStore'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  projectId: string
}>()

const catalog = useCatalogStore()
const title = ref('')
const description = ref('')
const priority = ref<Priority>('none')
const pending = ref(false)

function resetForm(): void {
  title.value = ''
  description.value = ''
  priority.value = 'none'
}

watch(open, (value) => {
  if (value) resetForm()
})

function close(): void {
  open.value = false
}

async function create(): Promise<void> {
  if (pending.value || !title.value.trim()) return
  pending.value = true
  try {
    const task = await catalog.createProjectTask({
      projectId: props.projectId,
      title: title.value,
      description: description.value,
      priority: priority.value,
    })
    if (task) close()
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AppSheet :open="open" :title="fa.project.newTask" @close="close">
    <header class="shrink-0 border-b border-line px-4 py-3">
      <h2 class="text-base font-semibold">{{ fa.project.newTask }}</h2>
    </header>
    <form class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4" @submit.prevent="create">
      <label class="block text-sm" for="new-pt-title">{{ fa.task.title }}</label>
      <input
        id="new-pt-title"
        v-model="title"
        class="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm"
        :placeholder="fa.project.taskPlaceholder"
      />
      <label class="block text-sm" for="new-pt-desc">{{ fa.task.description }}</label>
      <textarea
        id="new-pt-desc"
        v-model="description"
        rows="3"
        class="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        :placeholder="fa.project.taskDescription"
      />
      <p class="text-sm">{{ fa.task.priority }}</p>
      <ProjectTaskPriorityPicker v-model="priority" />
      <div class="flex gap-2 pt-2">
        <button
          type="submit"
          class="min-h-11 flex-1 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-50"
          :disabled="pending || !title.trim()"
        >
          {{ fa.project.addTask }}
        </button>
        <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-4 text-sm" @click="close">
          {{ fa.task.cancel }}
        </button>
      </div>
    </form>
  </AppSheet>
</template>