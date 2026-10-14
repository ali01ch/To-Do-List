<script setup lang="ts">
import { computed, ref } from 'vue'
import { APP_VERSION, SCHEMA_VERSION } from '@/app/version'
import AppButton from '@/components/AppButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { toDataError } from '@/domain/errors'
import { errorText, fa } from '@/locales/fa'
import {
  clearAllData,
  downloadJson,
  exportBackup,
  importBackup,
  parseBackup,
  summarizeBackup,
  type BackupSummary,
  type RoznoBackup,
} from '@/services/backup'
import { useAppStore } from '@/stores/appStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { formatBytes } from '@/utils/bytes'
import { toPersianDigits } from '@/utils/digits'
import type { ThemePreference } from '@/utils/theme'

const store = useAppStore()
const catalog = useCatalogStore()
const fileInput = ref<HTMLInputElement | null>(null)
const pendingImport = ref<RoznoBackup | null>(null)
const confirmClear = ref(false)
const busy = ref(false)
const message = ref<string | null>(null)
const summary = ref<BackupSummary | null>(null)

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

const importBody = computed(() => {
  if (!summary.value) return fa.settings.importConfirmBody
  return `${fa.settings.importConfirmBody}\n${toPersianDigits(summary.value.tasks)} کار · ${toPersianDigits(summary.value.lists)} فهرست · ${toPersianDigits(summary.value.tags)} برچسب`
})

function onTheme(value: ThemePreference): void {
  void store.setTheme(value)
}

function onTogglePalette(): void {
  void store.togglePalette()
}

async function onExport(): Promise<void> {
  busy.value = true
  message.value = null
  try {
    const backup = await exportBackup()
    downloadJson(`rozno-backup-${backup.exportedAt.slice(0, 10)}.json`, backup)
    message.value = fa.settings.exportDone
  } catch (error) {
    message.value = errorText(toDataError(error).code)
  } finally {
    busy.value = false
  }
}

function pickImport(): void {
  fileInput.value?.click()
}

async function onFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  message.value = null
  try {
    const text = await file.text()
    const parsed = parseBackup(JSON.parse(text) as unknown)
    pendingImport.value = parsed
    summary.value = summarizeBackup(parsed)
  } catch {
    message.value = fa.settings.invalidBackup
    pendingImport.value = null
    summary.value = null
  }
}

async function confirmImport(): Promise<void> {
  if (!pendingImport.value || busy.value) return
  busy.value = true
  const backup = pendingImport.value
  try {
    // vue-tsc can recurse through Dexie EntityTable when checking this call.
    // @ts-expect-error TS2589
    await importBackup(backup)
    pendingImport.value = null
    summary.value = null
    await catalog.load()
    await store.refreshStorage()
    message.value = fa.settings.importDone
  } catch (error) {
    message.value = errorText(toDataError(error).code)
  } finally {
    busy.value = false
  }
}

async function onClear(): Promise<void> {
  if (busy.value) return
  busy.value = true
  confirmClear.value = false
  try {
    await clearAllData()
    await catalog.load()
    await store.refreshStorage()
    message.value = fa.settings.clearDone
  } catch (error) {
    message.value = errorText(toDataError(error).code)
  } finally {
    busy.value = false
  }
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
        @toggle-palette="onTogglePalette"
      />
      <p class="mt-3 text-xs leading-6 text-muted">{{ fa.settings.themeHint }}</p>
    </article>

    <article class="rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow)]">
      <h2 class="text-sm font-medium">{{ fa.settings.backup }}</h2>
      <p class="mt-2 text-sm leading-7 text-muted">{{ fa.settings.backupHint }}</p>
      <p class="mt-1 text-xs leading-6 text-muted">{{ fa.settings.privacyNote }}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <AppButton :disabled="busy || store.dbStatus !== 'ready'" @click="onExport">{{ fa.settings.export }}</AppButton>
        <AppButton variant="quiet" :disabled="busy || store.dbStatus !== 'ready'" @click="pickImport">{{ fa.settings.import }}</AppButton>
        <AppButton variant="quiet" :disabled="busy || store.dbStatus !== 'ready'" @click="confirmClear = true">{{ fa.settings.clearAll }}</AppButton>
      </div>
      <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" @change="onFile" />
      <p v-if="message" class="mt-3 text-sm text-muted" role="status">{{ message }}</p>
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

    <ConfirmDialog
      :open="pendingImport !== null"
      :title="fa.settings.importConfirm"
      :body="importBody"
      :confirm-label="fa.settings.import"
      :busy="busy"
      @cancel="pendingImport = null; summary = null"
      @confirm="confirmImport"
    />
    <ConfirmDialog
      :open="confirmClear"
      :title="fa.settings.clearConfirm"
      :body="fa.settings.clearConfirmBody"
      :confirm-label="fa.settings.clearAll"
      :busy="busy"
      @cancel="confirmClear = false"
      @confirm="onClear"
    />
  </section>
</template>
