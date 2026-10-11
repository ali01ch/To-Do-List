<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header>
    <h1 class="text-[1.65rem] font-semibold leading-10 tracking-tight">{{ title }}</h1>
    <p v-if="description" class="mt-2 max-w-prose text-sm leading-7 text-muted">{{ description }}</p>
  </header>
</template>
