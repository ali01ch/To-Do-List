/**
 * @vitest-environment jsdom
 */
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAppStore } from '@/stores/appStore'
import { useCatalogStore } from '@/stores/catalogStore'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('delete confirmation', () => {
  it('shows the themed dialog and keeps the task when cancelled', async () => {
    const pinia = createPinia()
    const app = useAppStore(pinia)
    const catalog = useCatalogStore(pinia)
    await app.init()
    await catalog.load()
    const task = await catalog.createTask({ title: 'کار آزمایشی', dueOn: '2026-10-11' })
    expect(task).toBeTruthy()

    const pending = catalog.requestRemoveTask(task!.id)
    await flushPromises()
    expect(catalog.deleteDialog?.title).toContain('کار آزمایشی')

    mount(ConfirmDialog, {
      attachTo: document.body,
      props: {
        open: true,
        title: catalog.deleteDialog!.title,
        body: catalog.deleteDialog!.body,
        confirmLabel: 'حذف',
      },
    })
    expect(document.body.textContent).toContain('انصراف')
    expect(document.body.textContent).toContain('حذف')

    catalog.cancelPendingDelete()
    await expect(pending).resolves.toBe(false)
    expect(catalog.tasks.some((item) => item.id === task!.id)).toBe(true)
  })

  it('removes the task only after confirm', async () => {
    const pinia = createPinia()
    const app = useAppStore(pinia)
    const catalog = useCatalogStore(pinia)
    await app.init()
    await catalog.load()
    const task = await catalog.createTask({ title: 'حذف با تأیید', dueOn: '2026-10-11' })
    const pending = catalog.requestRemoveTask(task!.id)
    await catalog.confirmPendingDelete()
    await expect(pending).resolves.toBe(true)
    await vi.waitFor(() => {
      expect(catalog.tasks.some((item) => item.id === task!.id)).toBe(false)
    })
  })
})
