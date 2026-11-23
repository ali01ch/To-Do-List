<script setup lang="ts">
import TaskPriorityIcon from '@/components/TaskPriorityIcon.vue'
import type { Priority } from '@/domain/types'

defineProps<{
  priority: Priority | undefined
  compact?: boolean
}>()
</script>

<template>
  <TaskPriorityIcon :priority="priority" :compact="compact" />
</template>