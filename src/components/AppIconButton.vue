<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex size-11 items-center justify-center rounded-xl text-ink transition-colors hover:bg-surface-muted"
    :aria-label="label"
  >
    <slot />
  </button>
</template>
