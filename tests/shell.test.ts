/**
 * @vitest-environment jsdom
 */
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import App from '@/App.vue'
import { router } from '@/app/router'
import { useAppStore } from '@/stores/appStore'

describe('app shell', () => {
  it('renders the Persian shell and opens the local database', async () => {
    const pinia = createPinia()
    await router.push('/today')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [pinia, router] } })
    const store = useAppStore(pinia)
    await store.init()
    await flushPromises()

    expect(wrapper.text()).toContain('روزنو')
    expect(wrapper.text()).toContain('امروز')
    expect(wrapper.text()).toContain('هنوز به داده‌ها وصل نشده')
    expect(store.dbStatus).toBe('ready')
    expect(document.title).toContain('امروز')
  })
})
