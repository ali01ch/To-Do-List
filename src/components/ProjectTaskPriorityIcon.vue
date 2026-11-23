<script setup lang="ts">
import { ChevronDown, ChevronUp, Equal } from '@lucide/vue'
import { computed } from 'vue'
import type { Priority } from '@/domain/types'
import { fa } from '@/locales/fa'

const props = withDefaults(
  defineProps<{
    priority: Priority | undefined
    compact?: boolean
  }>(),
  { compact: false },
)

const level = computed(() => props.priority ?? 'none')
const label = computed(() => fa.priority[level.value])
const iconSize = computed(() => (props.compact ? 16 : 20))
</script>

<template>
  <span
    v-if="level !== 'none'"
    class="shrink-0 place-items-center"
    :class="compact ? 'inline-flex' : 'grid size-11'"
    :title="label"
    :aria-label="label"
    role="img"
  >
    <ChevronUp
      v-if="level === 'high'"
      :size="iconSize"
      :stroke-width="2.75"
      class="text-orange-500"
      aria-hidden="true"
    />
    <Equal
      v-else-if="level === 'medium'"
      :size="iconSize"
      :stroke-width="2.75"
      class="text-yellow-500"
      aria-hidden="true"
    />
    <ChevronDown
      v-else-if="level === 'low'"
      :size="iconSize"
      :stroke-width="2.75"
      class="text-blue-500"
      aria-hidden="true"
    />
  </span>
</template>