<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.open) emit('close')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40" @keydown="onKeydown">
    <button type="button" class="absolute inset-0 bg-ink/30" :aria-label="title" @click="emit('close')" />
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      class="absolute inset-x-0 bottom-0 max-h-[min(92dvh,44rem)] overflow-y-auto rounded-t-3xl border border-line bg-surface p-4 shadow-[var(--shadow)] lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:w-[32rem] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-3xl"
      :style="{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }"
    >
      <slot />
    </div>
  </div>
</template>
