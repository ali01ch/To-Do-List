<script setup lang="ts">
import { useId } from 'vue'
import type { Priority } from '@/domain/types'
import { PRIORITIES } from '@/domain/types'
import ProjectTaskPriorityIcon from '@/components/ProjectTaskPriorityIcon.vue'
import { fa } from '@/locales/fa'

const model = defineModel<Priority>({ required: true })
const groupName = useId()
</script>

<template>
  <div class="flex flex-wrap gap-2" role="radiogroup" :aria-label="fa.task.priority">
    <label
      v-for="item in PRIORITIES"
      :key="item"
      class="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 text-sm transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
    >
      <input v-model="model" class="sr-only" type="radio" :name="groupName" :value="item" />
      <ProjectTaskPriorityIcon v-if="item !== 'none'" :priority="item" compact />
      <span v-else class="inline-flex w-4 shrink-0 justify-center text-muted" aria-hidden="true">—</span>
      <span>{{ fa.priority[item] }}</span>
    </label>
  </div>
</template>