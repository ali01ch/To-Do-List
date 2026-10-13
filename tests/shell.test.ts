/**
 * @vitest-environment jsdom
 */
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import App from '@/App.vue'
import { router } from '@/app/router'
import { useAppStore } from '@/stores/appStore'
import { useCatalogStore } from '@/stores/catalogStore'

describe('app shell', () => {
  it('renders the Persian shell and opens the local database', async () => {
    const pinia = createPinia()
    await router.push('/work')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [pinia, router] } })
    const store = useAppStore(pinia)
    await store.init()
    await flushPromises()

    expect(wrapper.text()).toContain('روزنو')
    expect(wrapper.text()).toContain('کارها')
    expect(wrapper.text()).not.toContain('هنوز به داده‌ها وصل نشده')
    expect(wrapper.text()).toContain('کاری در این بازه نیست')
    const input = wrapper.get('input[name="quick-title"]')
    await input.setValue('خرید نان')
    expect(wrapper.get('form[name="quick-add"] button[type="submit"]').attributes('disabled')).toBeUndefined()
    await wrapper.get('form[name="quick-add"]').trigger('submit')
    const catalog = useCatalogStore(pinia)
    await vi.waitFor(() => {
      expect(catalog.tasks.map((task) => task.title)).toContain('خرید نان')
    })
    expect(catalog.actionError).toBeNull()
    expect(wrapper.text()).toContain('خرید نان')
    expect(store.dbStatus).toBe('ready')
    expect(document.title).toContain('کارها')
  })
})
