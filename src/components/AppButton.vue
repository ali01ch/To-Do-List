<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit'
    variant?: 'primary' | 'quiet'
    disabled?: boolean
  }>(),
  { type: 'button', variant: 'primary', disabled: false },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="
      variant === 'primary'
        ? 'bg-accent text-accent-ink hover:opacity-90'
        : 'bg-surface-muted text-ink hover:bg-line'
    "
  >
    <slot />
  </button>
</template>
