<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import type { Component } from 'vue'
import { isThemePreference, type ThemePreference } from '@/utils/theme'

defineProps<{
  modelValue: ThemePreference
  legend: string
  options: { value: ThemePreference; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ThemePreference]
}>()

const icons: Record<ThemePreference, Component> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

function onChange(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  if (!isThemePreference(value)) return
  emit('update:modelValue', value)
}
</script>

<template>
  <fieldset>
    <legend class="text-sm font-medium">{{ legend }}</legend>
    <div class="mt-3 grid grid-cols-3 gap-2">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-2 text-sm text-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
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
