<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { isMoreSection, libraryNav, moreNav, primaryNav } from '@/app/navigation'
import AppButton from '@/components/AppButton.vue'
import BrandMark from '@/components/BrandMark.vue'
import ActionToast from '@/components/ActionToast.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import InstallBanner from '@/components/InstallBanner.vue'
import PwaUpdateBanner from '@/components/PwaUpdateBanner.vue'
import TaskSheet from '@/components/TaskSheet.vue'
import { errorText, fa } from '@/locales/fa'
import { useAppStore } from '@/stores/appStore'
import {
  NOTICE_DURATION_MS,
  UNDO_DURATION_MS,
  useCatalogStore,
  type CreatePreset,
} from '@/stores/catalogStore'
import { useViewStore } from '@/stores/viewStore'
import { todayDueOn } from '@/utils/dates'

const route = useRoute()
const store = useAppStore()
const catalog = useCatalogStore()
const view = useViewStore()
const moreActive = computed(() => isMoreSection(route.name))
const errorMessage = computed(() => (store.dbError ? errorText(store.dbError) : fa.errors.UNKNOWN))
const showFab = computed(
  () =>
    ['work', 'inbox', 'tasks', 'calendar', 'list'].includes(String(route.name)) &&
    catalog.editor === null &&
    !catalog.pendingDelete &&
    !catalog.undoEntry &&
    !catalog.notice,
)

watch(
  () => store.dbStatus,
  (status) => {
    if (status === 'ready' && catalog.status === 'idle') void catalog.load()
  },
  { immediate: true },
)

function isCurrent(name: string): boolean {
  if (name === 'lists' && (route.name === 'lists' || route.name === 'list')) return true
  return route.name === name
}

function createPreset(): CreatePreset {
  if (route.name === 'work') return { dueOn: null }
  if (route.name === 'inbox') return { dueOn: null }
  if (route.name === 'calendar') return { dueOn: view.calendarDueOn ?? todayDueOn() }
  if (route.name === 'list') return { listId: String(route.params.id) }
  return {}
}

function onKeydown(event: KeyboardEvent): void {
  const target = event.target
  if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]')) return
  if (event.key.toLowerCase() !== 'n' || event.metaKey || event.ctrlKey || event.altKey) return
  event.preventDefault()
  catalog.openCreate(createPreset())
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="min-h-dvh bg-canvas text-ink">
    <a class="skip-link" href="#main">{{ fa.skipToContent }}</a>
    <div class="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside class="sticky top-0 hidden h-dvh flex-col border-e border-line bg-surface lg:flex">
        <div class="px-5 py-6">
          <BrandMark />
        </div>
        <nav class="flex-1 space-y-6 overflow-y-auto px-3 pb-4" :aria-label="fa.nav.sections">
          <div>
            <p class="px-3 pb-2 text-xs text-muted">{{ fa.nav.main }}</p>
            <ul class="space-y-1">
              <li v-for="item in primaryNav" :key="item.name">
                <RouterLink
                  :to="{ name: item.name }"
                  class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors"
                  :class="
                    isCurrent(item.name)
                      ? 'bg-accent-soft font-semibold text-accent ring-1 ring-accent/25'
                      : 'text-muted hover:bg-surface-muted hover:text-ink'
                  "
                  :aria-current="isCurrent(item.name) ? 'page' : undefined"
                >
                  <component
                    :is="item.icon"
                    :size="20"
                    :stroke-width="isCurrent(item.name) ? 2.25 : 1.75"
                    aria-hidden="true"
                  />
                  {{ item.label }}
                </RouterLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="px-3 pb-2 text-xs text-muted">{{ fa.nav.library }}</p>
            <ul class="space-y-1">
              <li v-for="item in libraryNav" :key="item.name">
                <RouterLink
                  :to="{ name: item.name }"
                  class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors"
                  :class="
                    isCurrent(item.name)
                      ? 'bg-accent-soft font-semibold text-accent ring-1 ring-accent/25'
                      : 'text-muted hover:bg-surface-muted hover:text-ink'
                  "
                  :aria-current="isCurrent(item.name) ? 'page' : undefined"
                >
                  <component
                    :is="item.icon"
                    :size="20"
                    :stroke-width="isCurrent(item.name) ? 2.25 : 1.75"
                    aria-hidden="true"
                  />
                  {{ item.label }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <div class="min-w-0">
        <header
          class="sticky top-0 z-20 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden"
          :style="{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }"
        >
          <BrandMark />
        </header>
        <main
          id="main"
          class="mx-auto w-full max-w-[40rem] px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:px-8 lg:pt-10 lg:pb-16"
        >
          <div
            v-if="store.dbStatus === 'error'"
            role="alert"
            class="mb-6 rounded-2xl border border-line bg-danger-soft px-4 py-3 text-sm leading-7"
          >
            <p>{{ errorMessage }}</p>
            <AppButton class="mt-3" variant="quiet" @click="store.retry()">{{ fa.retry }}</AppButton>
          </div>
          <div v-else-if="catalog.actionError" role="alert" class="mb-4 rounded-2xl border border-line bg-danger-soft px-4 py-3 text-sm">
            {{ errorText(catalog.actionError) }}
          </div>
          <RouterView />
        </main>
      </div>
    </div>

    <nav
      class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
      :aria-label="fa.nav.primary"
    >
      <ul class="grid grid-cols-5 gap-1 px-1.5 pt-1.5">
        <li v-for="item in primaryNav" :key="item.name">
          <RouterLink
            :to="{ name: item.name }"
            class="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.7rem] leading-4 transition-colors"
            :class="
              isCurrent(item.name)
                ? 'bg-accent-soft font-semibold text-accent'
                : 'text-muted hover:bg-surface-muted'
            "
            :aria-current="isCurrent(item.name) ? 'page' : undefined"
          >
            <span
              v-if="isCurrent(item.name)"
              class="absolute inset-x-4 top-0 h-0.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            <component
              :is="item.icon"
              :size="22"
              :stroke-width="isCurrent(item.name) ? 2.35 : 1.75"
              aria-hidden="true"
            />
            {{ item.label }}
          </RouterLink>
        </li>
        <li>
          <RouterLink
            :to="{ name: moreNav.name }"
            class="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.7rem] leading-4 transition-colors"
            :class="moreActive ? 'bg-accent-soft font-semibold text-accent' : 'text-muted hover:bg-surface-muted'"
            :aria-current="moreActive ? 'page' : undefined"
          >
            <span
              v-if="moreActive"
              class="absolute inset-x-4 top-0 h-0.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            <component
              :is="moreNav.icon"
              :size="22"
              :stroke-width="moreActive ? 2.35 : 1.75"
              aria-hidden="true"
            />
            {{ moreNav.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
    <button
      v-if="showFab"
      type="button"
      class="fixed end-4 z-20 grid size-14 place-items-center rounded-full bg-accent text-accent-ink shadow-[var(--shadow)] lg:hidden"
      :style="{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom))' }"
      :aria-label="fa.task.new"
      @click="catalog.openCreate(createPreset())"
    >
      <Plus :size="24" :stroke-width="1.75" aria-hidden="true" />
    </button>
    <ActionToast
      v-if="catalog.undoEntry"
      :key="`undo-${catalog.undoEntry.message}`"
      :message="catalog.undoEntry.message"
      :duration-ms="UNDO_DURATION_MS"
      :action-label="fa.task.undo"
      @action="catalog.undo()"
    />
    <ActionToast
      v-else-if="catalog.notice"
      :key="`notice-${catalog.notice}`"
      :message="catalog.notice"
      :duration-ms="NOTICE_DURATION_MS"
    />
    <TaskSheet />
    <InstallBanner />
    <PwaUpdateBanner />
    <ConfirmDialog
      :open="catalog.deleteDialog !== null"
      :title="catalog.deleteDialog?.title ?? ''"
      :body="catalog.deleteDialog?.body ?? ''"
      :confirm-label="fa.task.remove"
      :busy="catalog.deleteBusy"
      @cancel="catalog.cancelPendingDelete()"
      @confirm="catalog.confirmPendingDelete()"
    />
  </div>
</template>
