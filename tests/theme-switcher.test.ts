/**
 * @vitest-environment jsdom
 */
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useAppStore } from '@/stores/appStore'

const options = [
  { value: 'system' as const, label: 'دستگاه' },
  { value: 'light' as const, label: 'روشن' },
  { value: 'dark' as const, label: 'تاریک' },
]

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.classList.remove('palette-rose', 'dark')
  })

  afterEach(() => {
    vi.useRealTimers()
    document.documentElement.classList.remove('palette-rose', 'dark')
  })

  it('shows the Persian choices and emits the selected theme', async () => {
    const wrapper = mount(ThemeSwitcher, {
      props: {
        modelValue: 'system',
        legend: 'ظاهر',
        options,
      },
    })

    expect(wrapper.text()).toContain('دستگاه')
    expect(wrapper.text()).toContain('روشن')
    await wrapper.get('input[value="dark"]').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['dark'])
  })

  it('toggles the hidden palette after holding the device option for five seconds', async () => {
    vi.useFakeTimers()
    const store = useAppStore()
    const wrapper = mount(ThemeSwitcher, {
      props: {
        modelValue: 'system',
        legend: 'ظاهر',
        options,
      },
    })

    const device = wrapper.get('label')
    await device.trigger('pointerdown', { pointerType: 'touch', pointerId: 1 })
    expect(store.palette).toBe('green')
    expect(document.documentElement.classList.contains('palette-rose')).toBe(false)

    await vi.advanceTimersByTimeAsync(4999)
    expect(store.palette).toBe('green')

    await vi.advanceTimersByTimeAsync(1)
    expect(store.palette).toBe('rose')
    expect(document.documentElement.classList.contains('palette-rose')).toBe(true)
  })

  it('cancels the hidden palette gesture when the hold ends early', async () => {
    vi.useFakeTimers()
    const store = useAppStore()
    const wrapper = mount(ThemeSwitcher, {
      props: {
        modelValue: 'system',
        legend: 'ظاهر',
        options,
      },
    })

    const device = wrapper.get('label')
    await device.trigger('pointerdown', { pointerType: 'touch', pointerId: 1 })
    await vi.advanceTimersByTimeAsync(2000)
    await device.trigger('pointerup', { pointerType: 'touch', pointerId: 1 })
    await vi.advanceTimersByTimeAsync(5000)
    expect(store.palette).toBe('green')
    expect(document.documentElement.classList.contains('palette-rose')).toBe(false)
  })
})
