<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import { onBeforeUnmount, type Component } from 'vue'
import { isThemePreference, type ThemePreference } from '@/utils/theme'

defineProps<{
  modelValue: ThemePreference
  legend: string
  options: { value: ThemePreference; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ThemePreference]
  'toggle-palette': []
}>()

const icons: Record<ThemePreference, Component> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const SECRET_HOLD_MS = 5000
let holdTimer: ReturnType<typeof setTimeout> | null = null

function clearHold(): void {
  if (holdTimer === null) return
  clearTimeout(holdTimer)
  holdTimer = null
}

function onPointerDown(value: ThemePreference, event: PointerEvent): void {
  if (value !== 'system') return
  if (event.pointerType === 'mouse' && event.button !== 0) return
  clearHold()
  const target = event.currentTarget
  if (target instanceof HTMLElement && typeof target.setPointerCapture === 'function') {
    try {
      target.setPointerCapture(event.pointerId)
    } catch {
      // Capture is best-effort; the hold still works without it.
    }
  }
  holdTimer = setTimeout(() => {
    holdTimer = null
    emit('toggle-palette')
    try {
      navigator.vibrate?.(40)
    } catch {
      // Vibration is optional feedback for the hidden gesture.
    }
  }, SECRET_HOLD_MS)
}

function onChange(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  if (!isThemePreference(value)) return
  emit('update:modelValue', value)
}

onBeforeUnmount(clearHold)
</script>

<template>
  <fieldset>
    <legend class="text-sm font-medium">{{ legend }}</legend>
    <div class="mt-3 grid grid-cols-3 gap-2">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-2 text-sm text-muted select-none has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
        @pointerdown="onPointerDown(option.value, $event)"
        @pointerup="clearHold"
        @pointerleave="clearHold"
        @pointercancel="clearHold"
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
