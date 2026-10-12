<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'
import { fa } from '@/locales/fa'

const props = defineProps<{
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  busy?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const cancelButton = ref<HTMLButtonElement | null>(null)
const titleId = useId()
const bodyId = useId()

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    cancelButton.value?.focus()
  },
)

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.open && !props.busy) {
    event.preventDefault()
    emit('cancel')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] grid place-items-center px-4"
      role="presentation"
      @keydown="onKeydown"
    >
      <button
        type="button"
        class="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
        :aria-label="fa.task.cancel"
        :disabled="busy"
        @click="emit('cancel')"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="bodyId"
        class="relative w-full max-w-sm rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)]"
      >
        <h2 :id="titleId" class="text-base font-semibold leading-7 text-ink">{{ title }}</h2>
        <p :id="bodyId" class="mt-2 whitespace-pre-line text-sm leading-7 text-muted">{{ body }}</p>
        <div class="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-xl bg-danger-soft px-3 text-sm font-medium text-danger transition-opacity disabled:opacity-50"
            :disabled="busy"
            @click="emit('confirm')"
          >
            {{ confirmLabel ?? fa.task.remove }}
          </button>
          <button
            ref="cancelButton"
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface-muted px-3 text-sm font-medium text-ink transition-colors hover:bg-line disabled:opacity-50"
            :disabled="busy"
            @click="emit('cancel')"
          >
            {{ fa.task.cancel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
