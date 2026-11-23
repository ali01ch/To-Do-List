<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import JalaliDatePicker from '@/components/JalaliDatePicker.vue'
import PageHeader from '@/components/PageHeader.vue'
import { LIST_COLORS, LIST_ICONS } from '@/domain/types'
import type { ListColor, ListIcon } from '@/domain/types'
import { listColorClass, listIconComponent } from '@/features/lists/listStyle'
import { fa } from '@/locales/fa'
import { progressForProject } from '@/services/projectQuery'
import { useCatalogStore } from '@/stores/catalogStore'
import { useViewStore } from '@/stores/viewStore'
import { toPersianDigits } from '@/utils/digits'

const catalog = useCatalogStore()
const view = useViewStore()
const name = ref('')
const description = ref('')
const targetOn = ref<string | null>(null)
const color = ref<ListColor>('iris')
const icon = ref<ListIcon>('briefcase')
const pending = ref(false)

const visible = computed(() =>
  catalog.projects.filter((project) => view.showArchivedProjects || project.archivedAt === null),
)

function progress(projectId: string) {
  return progressForProject(catalog.projectTasks, projectId)
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
      name.value = ''
      description.value = ''
      targetOn.value = null
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.projects.title" :description="fa.sections.projects.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <form class="mt-5 space-y-3" @submit.prevent="create">
        <label class="block text-sm" for="project-name">{{ fa.project.name }}</label>
        <input id="project-name" v-model="name" class="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm" />
        <label class="block text-sm" for="project-desc">{{ fa.project.description }}</label>
        <textarea
          id="project-desc"
          v-model="description"
          rows="2"
          class="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm"
          :placeholder="fa.task.description"
        />
        <label class="block text-sm">{{ fa.project.target }}</label>
        <JalaliDatePicker v-model="targetOn" />
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
          {{ fa.project.create }}
        </button>
      </form>
      <label class="mt-4 flex min-h-11 items-center gap-2 text-sm">
        <input v-model="view.showArchivedProjects" type="checkbox" class="size-5" />
        {{ fa.project.showArchived }}
      </label>
      <EmptyState v-if="visible.length === 0" :title="fa.empty.projectsTitle" :description="fa.empty.projectsBody" />
      <ul v-else class="mt-4 space-y-2">
        <li v-for="project in visible" :key="project.id">
          <RouterLink
            :to="{ name: 'project', params: { id: project.id } }"
            class="block rounded-2xl border border-line bg-surface px-4 py-3"
          >
            <div class="flex min-h-12 items-center gap-3">
              <span class="grid size-9 place-items-center rounded-xl text-white" :class="listColorClass[project.color]">
                <component :is="listIconComponent[project.icon]" :size="16" aria-hidden="true" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium">{{ project.name }}</span>
                <span v-if="project.archivedAt" class="text-xs text-muted">{{ fa.task.archived }}</span>
                <span v-else-if="project.description" class="mt-0.5 block truncate text-xs text-muted">{{ project.description }}</span>
              </span>
              <span class="text-xs text-muted">
                {{ toPersianDigits(progress(project.id).done) }}/{{ toPersianDigits(progress(project.id).total) }}
              </span>
            </div>
            <div v-if="progress(project.id).total > 0" class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div class="h-full rounded-full bg-accent transition-[width]" :style="{ width: `${progress(project.id).percent}%` }" />
            </div>
          </RouterLink>
        </li>
      </ul>
    </template>
  </section>
</template>