<script setup lang="ts">
import { computed } from 'vue'
import type { FocusTimerStyle } from '@/domain/types'
import { toPersianDigits } from '@/utils/digits'

const props = defineProps<{
  styleKind: FocusTimerStyle
  remainingMs: number
  totalMs: number
  label: string
}>()

const clock = computed(() => {
  const total = Math.max(0, Math.ceil(props.remainingMs / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return toPersianDigits(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
})

const progress = computed(() => {
  if (props.totalMs <= 0) return 0
  return Math.min(1, Math.max(0, props.remainingMs / props.totalMs))
})

const size = 240
const stroke = 10
const radius = (size - stroke) / 2
const circumference = 2 * Math.PI * radius
const dashOffset = computed(() => circumference * (1 - progress.value))
</script>

<template>
  <div class="flex flex-col items-center">
    <div v-if="styleKind === 'digital'" class="py-4 text-center">
      <p class="text-5xl font-semibold tracking-tight tabular-nums" dir="ltr">{{ clock }}</p>
      <p class="mt-2 text-sm text-muted">{{ label }}</p>
    </div>

    <div v-else class="relative grid place-items-center" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg
        class="absolute inset-0 -rotate-90"
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        aria-hidden="true"
      >
        <circle
          class="fill-none stroke-line"
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          :stroke-width="stroke"
        />
        <circle
          class="fill-none stroke-accent transition-[stroke-dashoffset] duration-200 ease-linear"
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          :stroke-width="stroke"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="relative z-10 text-center">
        <p class="text-4xl font-semibold tracking-tight tabular-nums" dir="ltr">{{ clock }}</p>
        <p class="mt-1 text-sm text-muted">{{ label }}</p>
      </div>
    </div>
  </div>
</template>
