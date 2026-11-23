<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppButton from '@/components/AppButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import ProjectCreateSheet from '@/components/ProjectCreateSheet.vue'
import { listColorClass, listIconComponent } from '@/features/lists/listStyle'
import { fa } from '@/locales/fa'
import { progressForProject } from '@/services/projectQuery'
import { useCatalogStore } from '@/stores/catalogStore'
import { useViewStore } from '@/stores/viewStore'
import { toPersianDigits } from '@/utils/digits'

const catalog = useCatalogStore()
const view = useViewStore()
const createOpen = ref(false)

const visible = computed(() => {
  const rows = catalog.projects.filter((project) => view.showArchivedProjects || project.archivedAt === null)
  if (!view.showArchivedProjects) return rows
  return [...rows].sort((left, right) => {
    const leftArchived = left.archivedAt !== null ? 0 : 1
    const rightArchived = right.archivedAt !== null ? 0 : 1
    if (leftArchived !== rightArchived) return leftArchived - rightArchived
    return left.sortOrder - right.sortOrder || left.createdAt.localeCompare(right.createdAt)
  })
})

function progress(projectId: string) {
  return progressForProject(catalog.projectTasks, projectId)
}
</script>

<template>
  <section>
    <PageHeader :title="fa.sections.projects.title" :description="fa.sections.projects.description" />
    <p v-if="catalog.status === 'loading'" class="mt-6 text-sm text-muted">{{ fa.empty.loading }}</p>
    <template v-else>
      <div class="mt-5 flex flex-wrap items-center gap-3">
        <AppButton type="button" @click="createOpen = true">
          <Plus :size="18" :stroke-width="2" aria-hidden="true" />
          {{ fa.project.new }}
        </AppButton>
        <label class="flex min-h-11 items-center gap-2 text-sm">
          <input v-model="view.showArchivedProjects" type="checkbox" class="size-5" />
          {{ fa.project.showArchived }}
        </label>
      </div>

      <EmptyState v-if="visible.length === 0" :title="fa.empty.projectsTitle" :description="fa.empty.projectsBody">
        <AppButton type="button" class="mt-4" @click="createOpen = true">{{ fa.project.new }}</AppButton>
      </EmptyState>
      <ul v-else class="mt-4 space-y-2">
        <li v-for="project in visible" :key="project.id">
          <RouterLink
            :to="{ name: 'project', params: { id: project.id } }"
            class="block rounded-2xl border border-line bg-surface px-4 py-3 transition-colors hover:bg-surface-muted"
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

      <ProjectCreateSheet v-model="createOpen" />
    </template>
  </section>
</template>