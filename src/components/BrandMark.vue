<script setup lang="ts">
import { fa } from '@/locales/fa'
</script>

<template>
  <span class="flex items-center gap-3">
    <span
      aria-hidden="true"
      class="grid size-9 place-items-center rounded-xl bg-accent text-sm font-semibold text-accent-ink"
    >ر</span>
    <span>
      <span class="block text-base font-semibold leading-none">{{ fa.appName }}</span>
      <span class="mt-1 block text-xs leading-4 text-muted">{{ fa.appTagline }}</span>
    </span>
  </span>
</template>
