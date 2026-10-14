/**
 * @vitest-environment jsdom
 */
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const options = [
  { value: 'system' as const, label: 'دستگاه' },
  { value: 'light' as const, label: 'روشن' },
  { value: 'dark' as const, label: 'تاریک' },
]

describe('ThemeSwitcher', () => {
  afterEach(() => {
    vi.useRealTimers()
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
    const wrapper = mount(ThemeSwitcher, {
      props: {
        modelValue: 'system',
        legend: 'ظاهر',
        options,
      },
    })

    const device = wrapper.get('label')
    await device.trigger('pointerdown', { pointerType: 'touch' })
    expect(wrapper.emitted('toggle-palette')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(4999)
    expect(wrapper.emitted('toggle-palette')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.emitted('toggle-palette')).toHaveLength(1)
  })

  it('cancels the hidden palette gesture when the hold ends early', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ThemeSwitcher, {
      props: {
        modelValue: 'system',
        legend: 'ظاهر',
        options,
      },
    })

    const device = wrapper.get('label')
    await device.trigger('pointerdown', { pointerType: 'touch' })
    await vi.advanceTimersByTimeAsync(2000)
    await device.trigger('pointerup')
    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.emitted('toggle-palette')).toBeUndefined()
  })
})
