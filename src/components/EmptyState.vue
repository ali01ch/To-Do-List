<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="mt-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center shadow-[var(--shadow)]">
    <h2 class="text-base font-semibold">{{ title }}</h2>
    <p class="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">{{ description }}</p>
  </section>
</template>
