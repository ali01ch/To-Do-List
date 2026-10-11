<script setup lang="ts">
import { computed } from 'vue'
import { APP_VERSION, SCHEMA_VERSION } from '@/app/version'
import AppButton from '@/components/AppButton.vue'
import PageHeader from '@/components/PageHeader.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { errorText, fa } from '@/locales/fa'
import { useAppStore } from '@/stores/appStore'
import { formatBytes } from '@/utils/bytes'
import { toPersianDigits } from '@/utils/digits'
import type { ThemePreference } from '@/utils/theme'

const store = useAppStore()

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: fa.settings.system },
  { value: 'light', label: fa.settings.light },
  { value: 'dark', label: fa.settings.dark },
]

const statusText = computed(() => {
  if (store.dbStatus === 'ready') return fa.settings.ready
  if (store.dbStatus === 'error') return store.dbError ? errorText(store.dbError) : fa.settings.failed
  return fa.settings.opening
})

function onTheme(value: ThemePreference): void {
  void store.setTheme(value)
}
</script>

<template>
  <section class="space-y-4">
    <PageHeader :title="fa.settings.title" :description="fa.settings.description" />

    <article class="rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow)]">
      <ThemeSwitcher
        :model-value="store.theme"
        :legend="fa.settings.theme"
        :options="themeOptions"
        @update:model-value="onTheme"
      />
      <p class="mt-3 text-xs leading-6 text-muted">{{ fa.settings.themeHint }}</p>
    </article>

    <article class="rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow)]">
      <h2 class="text-sm font-medium">{{ fa.settings.storage }}</h2>
      <p class="mt-2 text-sm leading-7 text-muted">{{ statusText }}</p>
      <dl class="mt-4 space-y-3 text-sm">
        <div class="flex items-center justify-between gap-4">
          <dt class="text-muted">{{ fa.settings.appVersion }}</dt>
          <dd>{{ toPersianDigits(APP_VERSION) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4">
          <dt class="text-muted">{{ fa.settings.schemaVersion }}</dt>
          <dd>{{ toPersianDigits(SCHEMA_VERSION) }}</dd>
        </div>
        <template v-if="store.storage">
          <div class="flex items-center justify-between gap-4">
            <dt class="text-muted">{{ fa.settings.usage }}</dt>
            <dd>{{ formatBytes(store.storage.usage) }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-muted">{{ fa.settings.quota }}</dt>
            <dd>{{ formatBytes(store.storage.quota) }}</dd>
          </div>
        </template>
      </dl>
      <p v-if="store.dbStatus === 'ready' && !store.storage" class="mt-4 text-xs leading-6 text-muted">
        {{ fa.settings.estimateUnavailable }}
      </p>
      <AppButton v-if="store.dbStatus === 'error'" class="mt-4" variant="quiet" @click="store.retry()">
        {{ fa.retry }}
      </AppButton>
    </article>
  </section>
</template>
