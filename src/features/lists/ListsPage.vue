<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import { LIST_COLORS, LIST_ICONS } from '@/domain/types'
import type { ListColor, ListIcon } from '@/domain/types'
import { listColorClass, listIconComponent } from '@/features/lists/listStyle'
import { fa } from '@/locales/fa'
import { useCatalogStore } from '@/stores/catalogStore'
import { useViewStore } from '@/stores/viewStore'
import { toPersianDigits } from '@/utils/digits'

const catalog = useCatalogStore()
const view = useViewStore()
const name = ref('')
const color = ref<ListColor>('teal')
const icon = ref<ListIcon>('folder')
const pending = ref(false)

const visible = computed(() => catalog.lists.filter((list) => view.showArchivedLists || list.archivedAt === null))

function count(listId: string): number {
  return catalog.tasks.filter((task) => task.listId === listId && task.completedAt === null && task.deletedAt === null).length
}

async function create(): Promise<void> {
  if (pending.value || !name.value.trim()) return
  pending.value = true
  try {
    const list = await catalog.createList({ name: name.value, color: color.value, icon: icon.value })
    if (list) name.value = ''
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.lists.title" :description="fa.sections.lists.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <form class="mt-5 space-y-3" @submit.prevent="create">
        <label class="block text-sm" for="list-name">{{ fa.task.listName }}</label>
        <input id="list-name" v-model="name" class="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm" />
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in LIST_COLORS"
            :key="item"
            type="button"
            class="size-11 rounded-full border-2"
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
            class="grid size-11 place-items-center rounded-xl border border-line"
            :class="icon === item ? 'bg-accent-soft text-accent' : ''"
            :aria-pressed="icon === item"
            @click="icon = item"
          >
            <component :is="listIconComponent[item]" :size="18" aria-hidden="true" />
          </button>
        </div>
        <button type="submit" class="min-h-11 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-50" :disabled="pending || !name.trim()">
          {{ fa.task.createList }}
        </button>
      </form>
      <label class="mt-4 flex min-h-11 items-center gap-2 text-sm">
        <input v-model="view.showArchivedLists" type="checkbox" class="size-5" />
        {{ fa.task.showArchived }}
      </label>
      <EmptyState v-if="visible.length === 0" :title="fa.empty.listsTitle" :description="fa.empty.listsBody" />
      <ul v-else class="mt-4 space-y-2">
        <li v-for="list in visible" :key="list.id">
          <RouterLink :to="{ name: 'list', params: { id: list.id } }" class="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-surface px-4">
            <span class="grid size-9 place-items-center rounded-xl text-white" :class="listColorClass[list.color]">
              <component :is="listIconComponent[list.icon]" :size="16" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium">{{ list.name }}</span>
              <span v-if="list.archivedAt" class="text-xs text-muted">{{ fa.task.archived }}</span>
            </span>
            <span class="text-sm text-muted">{{ toPersianDigits(count(list.id)) }}</span>
          </RouterLink>
        </li>
      </ul>
    </template>
  </section>
</template>
