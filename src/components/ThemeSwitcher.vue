<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import { onBeforeUnmount, type Component } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { isThemePreference, type ThemePreference } from '@/utils/theme'

const props = defineProps<{
  modelValue: ThemePreference
  legend: string
  options: { value: ThemePreference; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ThemePreference]
}>()

const store = useAppStore()

const icons: Record<ThemePreference, Component> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const SECRET_HOLD_MS = 5000
let holdTimer: ReturnType<typeof setTimeout> | null = null
let holdPointerId: number | null = null

function clearHoldTimer(): void {
  if (holdTimer === null) return
  clearTimeout(holdTimer)
  holdTimer = null
}

function cancelHold(pointerId?: number): void {
  if (pointerId !== undefined && holdPointerId !== null && pointerId !== holdPointerId) return
  holdPointerId = null
  clearHoldTimer()
}

function onSystemPointerDown(event: PointerEvent): void {
  if (event.pointerType === 'mouse' && event.button !== 0) return

  // Prevent the browser long-press menu from aborting the gesture on touch.
  if (event.pointerType !== 'mouse') event.preventDefault()

  if (props.modelValue !== 'system') emit('update:modelValue', 'system')

  holdPointerId = event.pointerId
  clearHoldTimer()
  holdTimer = setTimeout(() => {
    holdTimer = null
    holdPointerId = null
    void store.togglePalette()
    try {
      navigator.vibrate?.(40)
    } catch {
      // Vibration is optional feedback for the hidden gesture.
    }
  }, SECRET_HOLD_MS)
}

function onSystemPointerUp(event: PointerEvent): void {
  cancelHold(event.pointerId)
}

function onChange(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  if (!isThemePreference(value)) return
  emit('update:modelValue', value)
}

onBeforeUnmount(() => {
  cancelHold()
})
</script>

<template>
  <fieldset>
    <legend class="text-sm font-medium">{{ legend }}</legend>
    <div class="mt-3 grid grid-cols-3 gap-2">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-2 text-sm text-muted select-none has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
        :class="option.value === 'system' ? 'touch-none [-webkit-touch-callout:none]' : ''"
        @pointerdown="option.value === 'system' ? onSystemPointerDown($event) : undefined"
        @pointerup="option.value === 'system' ? onSystemPointerUp($event) : undefined"
        @contextmenu.prevent
      >
        <input
          class="sr-only"
          type="radio"
          name="theme"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="onChange"
        />
        <component :is="icons[option.value]" :size="18" :stroke-width="1.75" aria-hidden="true" />
        <span>{{ option.label }}</span>
      </label>
    </div>
  </fieldset>
</template>
