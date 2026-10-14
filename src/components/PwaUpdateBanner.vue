<script setup lang="ts">
import { fa } from '@/locales/fa'
import { usePwaUpdate } from '@/composables/usePwaUpdate'

const { needRefresh, applyUpdate } = usePwaUpdate()
</script>

<template>
  <aside
    v-if="needRefresh"
    class="fixed inset-x-3 z-50 rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow)] lg:inset-x-auto lg:start-6 lg:w-[22rem]"
    :style="{ top: 'max(0.75rem, env(safe-area-inset-top))' }"
    role="status"
  >
    <p class="text-sm font-medium">{{ fa.install.updateTitle }}</p>
    <p class="mt-1 text-xs leading-6 text-muted">{{ fa.install.updateBody }}</p>
    <button
      type="button"
      class="mt-3 min-h-11 rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink"
      @click="applyUpdate"
    >
      {{ fa.install.updateAction }}
    </button>
  </aside>
</template>
