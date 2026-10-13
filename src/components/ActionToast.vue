<script setup lang="ts">
defineProps<{
  message: string
  durationMs: number
  actionLabel?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div
    role="status"
    class="fixed inset-x-4 z-30 overflow-hidden rounded-2xl border border-line bg-surface text-sm shadow-[var(--shadow)] lg:inset-x-auto lg:end-6 lg:w-96"
    :style="{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom))' }"
  >
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <p class="min-w-0 flex-1 leading-6">{{ message }}</p>
      <button
        v-if="actionLabel"
        type="button"
        class="min-h-11 shrink-0 rounded-xl px-3 font-medium text-accent"
        @click="emit('action')"
      >
        {{ actionLabel }}
      </button>
    </div>
    <div class="h-1 bg-line/70" aria-hidden="true">
      <div
        class="toast-progress h-full bg-accent"
        :style="{ animationDuration: `${durationMs}ms` }"
      />
    </div>
  </div>
</template>

<style scoped>
.toast-progress {
  width: 100%;
  transform-origin: inline-start;
  animation-name: toast-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-progress {
    animation: none;
    transform: scaleX(0.35);
  }
}
</style>
