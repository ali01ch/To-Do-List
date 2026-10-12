<script setup lang="ts">
import { Download, Share } from '@lucide/vue'
import { computed, ref } from 'vue'
import { fa } from '@/locales/fa'
import { useInstallPrompt } from '@/composables/useInstallPrompt'

const { deferred, installed, promptInstall, isIosSafari } = useInstallPrompt()
const dismissed = ref(sessionStorage.getItem('rozno-install-dismissed') === '1')

const visible = computed(() => !installed.value && !dismissed.value && (deferred.value !== null || isIosSafari))

async function install(): Promise<void> {
  await promptInstall()
}

function dismiss(): void {
  dismissed.value = true
  sessionStorage.setItem('rozno-install-dismissed', '1')
}
</script>

<template>
  <aside
    v-if="visible"
    class="fixed inset-x-3 z-40 rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow)] lg:inset-x-auto lg:end-6 lg:w-[22rem]"
    :style="{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }"
    role="region"
    :aria-label="fa.install.title"
  >
    <p class="text-sm font-medium">{{ fa.install.title }}</p>
    <p class="mt-1 text-xs leading-6 text-muted">
      {{ deferred ? fa.install.androidBody : fa.install.iosBody }}
    </p>
    <div class="mt-3 flex gap-2">
      <button
        v-if="deferred"
        type="button"
        class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-3 text-sm font-medium text-accent-ink"
        @click="install"
      >
        <Download :size="18" :stroke-width="1.75" aria-hidden="true" />
        {{ fa.install.action }}
      </button>
      <p v-else class="flex min-h-11 flex-1 items-center gap-2 text-xs text-muted">
        <Share :size="16" :stroke-width="1.75" aria-hidden="true" />
        {{ fa.install.iosHint }}
      </p>
      <button type="button" class="min-h-11 rounded-xl bg-surface-muted px-3 text-sm" @click="dismiss">
        {{ fa.install.later }}
      </button>
    </div>
  </aside>
</template>
