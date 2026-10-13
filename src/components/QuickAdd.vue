<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CreatePreset } from '@/stores/catalogStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { fa } from '@/locales/fa'
import { addDays, todayDueOn } from '@/utils/dates'

type DueMode = 'none' | 'today' | 'tomorrow'

const props = withDefaults(
  defineProps<{
    preset?: CreatePreset
    showDueChoices?: boolean
  }>(),
  {
    showDueChoices: true,
  },
)

const catalog = useCatalogStore()
const title = ref('')
const pending = ref(false)
const dueMode = ref<DueMode>('none')

function dueModeFromPreset(preset?: CreatePreset): DueMode {
  if (!preset || preset.dueOn === undefined || preset.dueOn === null) return 'none'
  const today = todayDueOn()
  if (preset.dueOn === today) return 'today'
  if (preset.dueOn === addDays(today, 1)) return 'tomorrow'
  return 'today'
}

watch(
  () => props.preset,
  (preset) => {
    dueMode.value = dueModeFromPreset(preset)
  },
  { immediate: true, deep: true },
)

const dueOn = computed(() => {
  if (dueMode.value === 'today') return todayDueOn()
  if (dueMode.value === 'tomorrow') return addDays(todayDueOn(), 1)
  return null
})

const dueChoices: { id: DueMode; label: string }[] = [
  { id: 'none', label: fa.task.noDate },
  { id: 'today', label: fa.nav.today },
  { id: 'tomorrow', label: fa.task.tomorrow },
]

async function submit(): Promise<void> {
  const value = title.value.trim()
  if (!value || pending.value) return
  pending.value = true
  try {
    const task = await catalog.createTask({
      title: value,
      dueOn: dueOn.value,
      dueTime: null,
      listId: props.preset?.listId,
    })
    if (task) title.value = ''
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="mt-5">
    <form class="flex items-center gap-2" name="quick-add" @submit.prevent="submit">
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
    <div
      v-if="showDueChoices"
      class="mt-2 flex flex-wrap gap-2"
      role="group"
      :aria-label="fa.task.due"
    >
      <button
        v-for="choice in dueChoices"
        :key="choice.id"
        type="button"
        class="min-h-9 rounded-full border border-line px-3 text-xs transition-colors"
        :class="dueMode === choice.id ? 'border-accent bg-accent-soft text-accent' : 'bg-surface text-muted'"
        :aria-pressed="dueMode === choice.id"
        @click="dueMode = choice.id"
      >
        {{ choice.label }}
      </button>
    </div>
  </div>
</template>
