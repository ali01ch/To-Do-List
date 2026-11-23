<script setup lang="ts">
import type { Priority } from '@/domain/types'
import TaskPriorityPicker from '@/components/TaskPriorityPicker.vue'

const model = defineModel<Priority>({ required: true })
</script>

<template>
  <TaskPriorityPicker v-model="model" />
</template>