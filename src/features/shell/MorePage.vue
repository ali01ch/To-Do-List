<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { libraryNav } from '@/app/navigation'
import PageHeader from '@/components/PageHeader.vue'
import { fa } from '@/locales/fa'
</script>

<template>
  <section>
    <PageHeader :title="fa.more.title" :description="fa.more.description" />
    <ul class="mt-6 space-y-2">
      <li v-for="item in libraryNav" :key="item.name">
        <RouterLink
          :to="{ name: item.name }"
          class="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-surface px-4 text-sm shadow-[var(--shadow)] transition-colors hover:bg-surface-muted"
        >
          <component :is="item.icon" :size="20" :stroke-width="1.75" aria-hidden="true" />
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
