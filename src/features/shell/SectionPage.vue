<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import { fa } from '@/locales/fa'

const route = useRoute()
const title = computed(() => route.meta.title)
const description = computed(() => route.meta.description)
</script>

<template>
  <section>
    <PageHeader :title="title" :description="description" />
    <EmptyState :title="fa.empty.title" :description="fa.empty.body" />
  </section>
</template>
