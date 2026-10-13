<script setup lang="ts">
import { ref } from 'vue'
import type { CreatePreset } from '@/stores/catalogStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { fa } from '@/locales/fa'

const props = defineProps<{
  preset?: CreatePreset
}>()

const catalog = useCatalogStore()
const title = ref('')
const pending = ref(false)

async function submit(): Promise<void> {
  const value = title.value.trim()
  if (!value || pending.value) return
  pending.value = true
  try {
    const task = await catalog.createTask({
      title: value,
      dueOn: props.preset?.dueOn,
      listId: props.preset?.listId,
    })
    if (task) title.value = ''
  } finally {
    pending.value = false
  }
}

</script>

<template>
  <form class="mt-5 flex items-center gap-2" name="quick-add" @submit.prevent="submit">
    <label class="sr-only" for="quick-title">{{ fa.task.title }}</label>
    <input
      id="quick-title"
      v-model="title"
      name="quick-title"
      class="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-sm outline-none"
      :placeholder="fa.task.placeholder"
      autocomplete="off"
      enterkeyhint="done"
    />
    <button
      type="submit"
      class="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-50"
      :disabled="pending || title.trim().length === 0"
    >
      {{ fa.task.add }}
    </button>
  </form>
</template>
