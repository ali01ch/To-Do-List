<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="mt-6 rounded-2xl border border-dashed border-line bg-surface px-6 py-8 text-center">
    <h2 class="text-base font-semibold">{{ title }}</h2>
    <p v-if="description" class="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </section>
</template>
