<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import JalaliDatePicker from '@/components/JalaliDatePicker.vue'
import PageHeader from '@/components/PageHeader.vue'
import ProjectTaskRow from '@/components/ProjectTaskRow.vue'
import { listColorClass } from '@/features/lists/listStyle'
import { fa } from '@/locales/fa'
import { progressForProject, tasksForProject } from '@/services/projectQuery'
import { formatDueWithState } from '@/services/duePhrase'
import { useCatalogStore } from '@/stores/catalogStore'
import { useViewStore } from '@/stores/viewStore'
import { todayDueOn } from '@/utils/dates'
import { toPersianDigits } from '@/utils/digits'

const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()
const view = useViewStore()
const projectId = computed(() => String(route.params.id))
const project = computed(() => catalog.projects.find((item) => item.id === projectId.value))
const tasks = computed(() =>
  project.value ? tasksForProject(catalog.projectTasks, project.value.id, view.includeCompletedInProject) : [],
)
const progress = computed(() => (project.value ? progressForProject(catalog.projectTasks, project.value.id) : { done: 0, total: 0, percent: 0 }))

const taskTitle = ref('')
const taskDescription = ref('')
const addPending = ref(false)
const editDescription = ref(false)
const editTarget = ref(false)
const descriptionDraft = ref('')
const targetDraft = ref<string | null>(null)

watch(editDescription, (open) => {
  if (open && project.value) descriptionDraft.value = project.value.description
})

watch(editTarget, (open) => {
  if (open && project.value) targetDraft.value = project.value.targetOn
})

const today = todayDueOn()

async function remove(): Promise<void> {
  if (!project.value) return
  const confirmed = await catalog.requestRemoveProject(project.value.id)
  if (confirmed) await router.push({ name: 'projects' })
}

async function addTask(): Promise<void> {
  if (!project.value || addPending.value || !taskTitle.value.trim()) return
  addPending.value = true
  try {
    const task = await catalog.createProjectTask({
      projectId: project.value.id,
      title: taskTitle.value,
      description: taskDescription.value,
    })
    if (task) {
      taskTitle.value = ''
      taskDescription.value = ''
    }
  } finally {
    addPending.value = false
  }
}

async function saveDescription(): Promise<void> {
  if (!project.value) return
  await catalog.updateProject(project.value.id, { description: descriptionDraft.value })
  editDescription.value = false
}

async function saveTarget(): Promise<void> {
  if (!project.value) return
  await catalog.updateProject(project.value.id, { targetOn: targetDraft.value })
  editTarget.value = false
}
</script>

<template>
  <section>
    <RouterLink
      :to="{ name: 'projects' }"
      class="-ms-2 mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
    >
      <ChevronRight :size="20" :stroke-width="2" aria-hidden="true" />
      {{ fa.project.backToProjects }}
    </RouterLink>
    <p v-if="catalog.status === 'loading'" class="mt-4 text-sm text-muted">{{ fa.empty.loading }}</p>
    <EmptyState v-else-if="!project" :title="fa.empty.missingProject" />
    <template v-else>
      <div class="flex items-start gap-3">
        <span class="mt-2 size-3 shrink-0 rounded-full" :class="listColorClass[project.color]" aria-hidden="true" />
        <PageHeader :title="project.name" :description="project.archivedAt ? fa.task.archived : fa.sections.projects.description" />
      </div>
      <div v-if="progress.total > 0" class="mt-3">
        <div class="mb-1 flex justify-between text-xs text-muted">
          <span>{{ fa.project.progress }}</span>
          <span>{{ toPersianDigits(progress.percent) }}٪</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-surface-muted">
          <div class="h-full rounded-full bg-accent transition-[width]" :style="{ width: `${progress.percent}%` }" />
        </div>
      </div>
      <p v-if="project.targetOn && formatDueWithState(project.targetOn, today)" class="mt-2 text-sm text-muted">
        {{ fa.project.target }}: {{ formatDueWithState(project.targetOn, today) }}
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" @click="catalog.setProjectArchived(project.id, project.archivedAt === null)">
          {{ project.archivedAt ? fa.task.unarchive : fa.task.archive }}
        </button>
        <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" @click="editDescription = !editDescription">
          {{ fa.project.description }}
        </button>
        <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" @click="editTarget = !editTarget">
          {{ fa.project.target }}
        </button>
        <button type="button" class="min-h-11 rounded-xl bg-danger-soft px-3 text-sm text-danger" @click="remove">{{ fa.task.remove }}</button>
      </div>
      <div v-if="editDescription" class="mt-3 space-y-2">
        <textarea v-model="descriptionDraft" rows="3" class="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm" />
        <button type="button" class="min-h-11 rounded-xl bg-accent px-3 text-sm text-accent-ink" @click="saveDescription">{{ fa.task.save }}</button>
      </div>
      <div v-if="editTarget" class="mt-3 space-y-2">
        <JalaliDatePicker v-model="targetDraft" />
        <button type="button" class="min-h-11 rounded-xl bg-accent px-3 text-sm text-accent-ink" @click="saveTarget">{{ fa.task.save }}</button>
      </div>
      <p v-else-if="project.description" class="mt-3 whitespace-pre-wrap text-sm text-muted">{{ project.description }}</p>
      <label class="mt-3 flex min-h-11 items-center gap-2 text-sm">
        <input v-model="view.includeCompletedInProject" type="checkbox" class="size-5" />
        {{ fa.task.showCompletedInProject }}
      </label>
      <form class="mt-4 space-y-2 rounded-2xl border border-line bg-surface-muted/50 p-3" @submit.prevent="addTask">
        <input
          v-model="taskTitle"
          class="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm"
          :placeholder="fa.project.taskPlaceholder"
        />
        <textarea
          v-model="taskDescription"
          rows="2"
          class="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm"
          :placeholder="fa.project.taskDescription"
        />
        <button
          type="submit"
          class="min-h-11 w-full rounded-xl bg-accent text-sm font-medium text-accent-ink disabled:opacity-50"
          :disabled="addPending || !taskTitle.trim()"
        >
          {{ fa.project.addTask }}
        </button>
      </form>
      <EmptyState v-if="tasks.length === 0" :title="fa.empty.projectTasksTitle" :description="fa.empty.projectTasksBody" />
      <ul v-else class="mt-4 space-y-2">
        <li v-for="task in tasks" :key="task.id">
          <ProjectTaskRow
            :task="task"
            @toggle="catalog.toggleProjectTaskComplete(task.id)"
            @edit="catalog.openProjectTaskEdit(task.id)"
            @remove="catalog.requestRemoveProjectTask(task.id)"
          />
        </li>
      </ul>
    </template>
  </section>
</template>