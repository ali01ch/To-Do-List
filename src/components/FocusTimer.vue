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

/** Single hand: full at top (۰), sweeps clockwise as time elapses across a 60-minute dial. */
const handAngle = computed(() => (1 - progress.value) * 360)

const size = 260
const center = size / 2
const dialRadius = 112
const numberRadius = 86
const handLength = 78
const tickOuter = dialRadius
const tickInnerMajor = dialRadius - 14
const tickInnerMinor = dialRadius - 8

/** Minute marks every 5 minutes on a 60-minute face: 0, 5, …, 55 */
const minuteMarks = Array.from({ length: 12 }, (_, index) => {
  const minute = index * 5
  const angle = (index / 12) * Math.PI * 2 - Math.PI / 2
  return {
    minute,
    label: toPersianDigits(minute),
    x: center + Math.cos(angle) * numberRadius,
    y: center + Math.sin(angle) * numberRadius,
    tick: {
      x1: center + Math.cos(angle) * tickInnerMajor,
      y1: center + Math.sin(angle) * tickInnerMajor,
      x2: center + Math.cos(angle) * tickOuter,
      y2: center + Math.sin(angle) * tickOuter,
    },
  }
})

const minorTicks = Array.from({ length: 60 }, (_, index) => {
  if (index % 5 === 0) return null
  const angle = (index / 60) * Math.PI * 2 - Math.PI / 2
  return {
    x1: center + Math.cos(angle) * tickInnerMinor,
    y1: center + Math.sin(angle) * tickInnerMinor,
    x2: center + Math.cos(angle) * tickOuter,
    y2: center + Math.sin(angle) * tickOuter,
  }
}).filter((tick): tick is NonNullable<typeof tick> => tick !== null)

const hand = computed(() => {
  const angle = (handAngle.value / 360) * Math.PI * 2 - Math.PI / 2
  return {
    x2: center + Math.cos(angle) * handLength,
    y2: center + Math.sin(angle) * handLength,
  }
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div v-if="styleKind === 'digital'" class="py-4 text-center">
      <p class="text-5xl font-semibold tracking-tight tabular-nums" dir="ltr">{{ clock }}</p>
      <p class="mt-2 text-sm text-muted">{{ label }}</p>
    </div>

    <div v-else class="flex flex-col items-center">
      <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
        <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" role="img" :aria-label="`${label} ${clock}`">
          <circle class="fill-surface stroke-line" :cx="center" :cy="center" :r="dialRadius" stroke-width="2" />
          <line
            v-for="(tick, index) in minorTicks"
            :key="`m-${index}`"
            class="stroke-muted/45"
            :x1="tick.x1"
            :y1="tick.y1"
            :x2="tick.x2"
            :y2="tick.y2"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <line
            v-for="mark in minuteMarks"
            :key="`h-${mark.minute}`"
            class="stroke-ink"
            :x1="mark.tick.x1"
            :y1="mark.tick.y1"
            :x2="mark.tick.x2"
            :y2="mark.tick.y2"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <text
            v-for="mark in minuteMarks"
            :key="`n-${mark.minute}`"
            class="fill-ink"
            :x="mark.x"
            :y="mark.y"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="15"
            font-weight="600"
          >
            {{ mark.label }}
          </text>
          <line
            class="stroke-accent"
            :x1="center"
            :y1="center"
            :x2="hand.x2"
            :y2="hand.y2"
            stroke-width="4"
            stroke-linecap="round"
          />
          <circle class="fill-accent" :cx="center" :cy="center" r="7" />
          <circle class="fill-accent-ink" :cx="center" :cy="center" r="2.5" />
        </svg>
      </div>
      <p class="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-ink" dir="ltr">{{ clock }}</p>
      <p class="mt-1 text-sm text-muted">{{ label }}</p>
    </div>
  </div>
</template>
