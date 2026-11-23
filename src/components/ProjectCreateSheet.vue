<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppSheet from '@/components/AppSheet.vue'
import JalaliDatePicker from '@/components/JalaliDatePicker.vue'
import { LIST_COLORS, LIST_ICONS } from '@/domain/types'
import type { ListColor, ListIcon } from '@/domain/types'
import { listColorClass, listIconComponent } from '@/features/lists/listStyle'
import { fa } from '@/locales/fa'
import { useCatalogStore } from '@/stores/catalogStore'

const open = defineModel<boolean>({ default: false })

const catalog = useCatalogStore()
const router = useRouter()
const name = ref('')
const description = ref('')
const targetOn = ref<string | null>(null)
const color = ref<ListColor>('iris')
const icon = ref<ListIcon>('briefcase')
const pending = ref(false)

function resetForm(): void {
  name.value = ''
  description.value = ''
  targetOn.value = null
  color.value = 'iris'
  icon.value = 'briefcase'
}

watch(open, (value) => {
  if (value) resetForm()
})

function close(): void {
  open.value = false
}

async function create(): Promise<void> {
  if (pending.value || !name.value.trim()) return
  pending.value = true
  try {
    const project = await catalog.createProject({
      name: name.value,
      description: description.value,
      color: color.value,
      icon: icon.value,
      targetOn: targetOn.value,
    })
    if (project) {
      close()
      await router.push({ name: 'project', params: { id: project.id } })
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <AppSheet :open="open" :title="fa.project.new" @close="close">
    <header class="shrink-0 border-b border-line px-4 py-3">
      <h2 class="text-base font-semibold">{{ fa.project.new }}</h2>
    </header>
    <form class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4" @submit.prevent="create">
      <label class="block text-sm" for="project-create-name">{{ fa.project.name }}</label>
      <input id="project-create-name" v-model="name" class="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm" />
      <label class="block text-sm" for="project-create-desc">{{ fa.project.description }}</label>
      <textarea
        id="project-create-desc"
        v-model="description"
        rows="2"
        class="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm"
      />
      <label class="block text-sm">{{ fa.project.target }}</label>
      <JalaliDatePicker v-model="targetOn" />
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in LIST_COLORS"
          :key="item"
          type="button"
          class="size-10 rounded-full border-2"
          :class="[listColorClass[item], color === item ? 'border-ink' : 'border-transparent']"
          :aria-label="item"
          :aria-pressed="color === item"
          @click="color = item"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in LIST_ICONS"
          :key="item"
          type="button"
          class="grid size-10 place-items-center rounded-xl border border-line"
          :class="icon === item ? 'bg-accent-soft text-accent' : ''"
          :aria-pressed="icon === item"
          @click="icon = item"
        >
          <component :is="listIconComponent[item]" :size="17" aria-hidden="true" />
        </button>
      </div>
      <div class="flex gap-2 pt-2">
        <button type="submit" class="min-h-11 flex-1 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-50" :disabled="pending || !name.trim()">
          {{ fa.project.create }}
        </button>
        <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-4 text-sm" @click="close">
          {{ fa.task.cancel }}
        </button>
      </div>
    </form>
  </AppSheet>
</template>