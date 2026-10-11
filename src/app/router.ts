import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/app/layouts/AppShell.vue'
import { fa } from '@/locales/fa'
import MorePage from '@/features/shell/MorePage.vue'
import SectionPage from '@/features/shell/SectionPage.vue'
import SettingsPage from '@/features/settings/SettingsPage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    description: string
  }
}

function section(path: string, name: string, copy: { title: string; description: string }) {
  return {
    path,
    name,
    component: SectionPage,
    meta: { title: copy.title, description: copy.description },
  }
}

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', redirect: { name: 'today' } },
        section('today', 'today', fa.sections.today),
        section('upcoming', 'upcoming', fa.sections.upcoming),
        section('inbox', 'inbox', fa.sections.inbox),
        section('calendar', 'calendar', fa.sections.calendar),
        section('tasks', 'tasks', fa.sections.tasks),
        section('completed', 'completed', fa.sections.completed),
        section('lists', 'lists', fa.sections.lists),
        section('focus', 'focus', fa.sections.focus),
        section('stats', 'stats', fa.sections.stats),
        {
          path: 'more',
          name: 'more',
          component: MorePage,
          meta: { title: fa.more.title, description: fa.more.description },
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsPage,
          meta: { title: fa.settings.title, description: fa.settings.description },
        },
      ],
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${fa.appName}` : fa.appName
})
