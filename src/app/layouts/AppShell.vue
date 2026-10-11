<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { isMoreSection, libraryNav, moreNav, primaryNav } from '@/app/navigation'
import BrandMark from '@/components/BrandMark.vue'
import AppButton from '@/components/AppButton.vue'
import { errorText, fa } from '@/locales/fa'
import { useAppStore } from '@/stores/appStore'

const route = useRoute()
const store = useAppStore()
const moreActive = computed(() => isMoreSection(route.name))
const errorMessage = computed(() => (store.dbError ? errorText(store.dbError) : fa.errors.UNKNOWN))

function isCurrent(name: string): boolean {
  return route.name === name
}
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
                  class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-ink"
                  :class="isCurrent(item.name) ? 'bg-accent-soft font-medium text-accent' : ''"
                  :aria-current="isCurrent(item.name) ? 'page' : undefined"
                >
                  <component :is="item.icon" :size="20" :stroke-width="1.75" aria-hidden="true" />
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
                  class="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-ink"
                  :class="isCurrent(item.name) ? 'bg-accent-soft font-medium text-accent' : ''"
                  :aria-current="isCurrent(item.name) ? 'page' : undefined"
                >
                  <component :is="item.icon" :size="20" :stroke-width="1.75" aria-hidden="true" />
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
          <RouterView />
        </main>
      </div>
    </div>

    <nav
      class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
      :aria-label="fa.nav.primary"
    >
      <ul class="grid grid-cols-5">
        <li v-for="item in primaryNav" :key="item.name">
          <RouterLink
            :to="{ name: item.name }"
            class="flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[0.7rem] leading-4 text-muted"
            :class="isCurrent(item.name) ? 'text-accent' : ''"
            :aria-current="isCurrent(item.name) ? 'page' : undefined"
          >
            <component :is="item.icon" :size="22" :stroke-width="1.75" aria-hidden="true" />
            {{ item.label }}
          </RouterLink>
        </li>
        <li>
          <RouterLink
            :to="{ name: moreNav.name }"
            class="flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[0.7rem] leading-4 text-muted"
            :class="moreActive ? 'text-accent' : ''"
            :aria-current="moreActive ? 'page' : undefined"
          >
            <component :is="moreNav.icon" :size="22" :stroke-width="1.75" aria-hidden="true" />
            {{ moreNav.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
