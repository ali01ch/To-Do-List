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
  <Teleport to="body">
    <Transition name="app-sheet" :duration="{ enter: 340, leave: 280 }">
      <div
        v-if="open"
        class="fixed inset-0 z-40 flex items-end justify-center lg:items-center"
        @keydown="onKeydown"
      >
        <button
          type="button"
          class="app-sheet-backdrop absolute inset-0 bg-ink/30"
          :aria-label="title"
          @click="emit('close')"
        />
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          class="app-sheet-panel relative z-10 flex max-h-[min(92dvh,44rem)] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-[var(--shadow)] lg:w-[32rem] lg:rounded-3xl"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-sheet-enter-active .app-sheet-backdrop,
.app-sheet-leave-active .app-sheet-backdrop {
  transition: opacity 0.28s ease;
}

.app-sheet-enter-active .app-sheet-panel {
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}

.app-sheet-leave-active .app-sheet-panel {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-sheet-enter-from .app-sheet-backdrop,
.app-sheet-leave-to .app-sheet-backdrop {
  opacity: 0;
}

.app-sheet-enter-from .app-sheet-panel,
.app-sheet-leave-to .app-sheet-panel {
  transform: translateY(100%);
}
</style>
