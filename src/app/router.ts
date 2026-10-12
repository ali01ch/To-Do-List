import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/app/layouts/AppShell.vue'
import CalendarPage from '@/features/calendar/CalendarPage.vue'
import FocusPage from '@/features/focus/FocusPage.vue'
import ListDetailPage from '@/features/lists/ListDetailPage.vue'
import ListsPage from '@/features/lists/ListsPage.vue'
import SettingsPage from '@/features/settings/SettingsPage.vue'
import MorePage from '@/features/shell/MorePage.vue'
import StatsPage from '@/features/statistics/StatsPage.vue'
import AllTasksPage from '@/features/tasks/AllTasksPage.vue'
import CompletedPage from '@/features/tasks/CompletedPage.vue'
import InboxPage from '@/features/tasks/InboxPage.vue'
import TodayPage from '@/features/tasks/TodayPage.vue'
import UpcomingPage from '@/features/tasks/UpcomingPage.vue'
import { fa } from '@/locales/fa'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    description: string
  }
}

function page(path: string, name: string, component: object, copy: { title: string; description: string }) {
  return { path, name, component, meta: { title: copy.title, description: copy.description } }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', redirect: { name: 'today' } },
        page('today', 'today', TodayPage, fa.sections.today),
        page('upcoming', 'upcoming', UpcomingPage, fa.sections.upcoming),
        page('inbox', 'inbox', InboxPage, fa.sections.inbox),
        page('calendar', 'calendar', CalendarPage, fa.sections.calendar),
        page('tasks', 'tasks', AllTasksPage, fa.sections.tasks),
        page('completed', 'completed', CompletedPage, fa.sections.completed),
        page('lists', 'lists', ListsPage, fa.sections.lists),
        page('lists/:id', 'list', ListDetailPage, fa.sections.lists),
        page('focus', 'focus', FocusPage, fa.sections.focus),
        page('stats', 'stats', StatsPage, fa.sections.stats),
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
