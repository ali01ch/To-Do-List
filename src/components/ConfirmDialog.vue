<script setup lang="ts">
import { fa } from '@/locales/fa'

defineProps<{
  open: boolean
  title: string
  body: string
  confirmLabel: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center px-4">
    <button type="button" class="absolute inset-0 bg-ink/30" :aria-label="fa.task.cancel" @click="emit('cancel')" />
    <div role="alertdialog" aria-modal="true" :aria-label="title" class="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow)]">
      <h2 class="text-base font-semibold">{{ title }}</h2>
      <p class="mt-2 text-sm leading-7 text-muted">{{ body }}</p>
      <div class="mt-4 flex gap-2">
        <button type="button" class="min-h-11 flex-1 rounded-xl bg-danger-soft px-3 text-sm" @click="emit('confirm')">
          {{ confirmLabel }}
        </button>
        <button type="button" class="min-h-11 flex-1 rounded-xl bg-surface-muted px-3 text-sm" @click="emit('cancel')">
          {{ fa.task.cancel }}
        </button>
      </div>
    </div>
  </div>
</template>
