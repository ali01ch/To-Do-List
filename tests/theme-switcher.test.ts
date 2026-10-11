/**
 * @vitest-environment jsdom
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

describe('ThemeSwitcher', () => {
  it('shows the Persian choices and emits the selected theme', async () => {
    const wrapper = mount(ThemeSwitcher, {
      props: {
        modelValue: 'system',
        legend: 'ظاهر',
        options: [
          { value: 'system', label: 'دستگاه' },
          { value: 'light', label: 'روشن' },
          { value: 'dark', label: 'تاریک' },
        ],
      },
    })

    expect(wrapper.text()).toContain('دستگاه')
    expect(wrapper.text()).toContain('روشن')
    await wrapper.get('input[value="dark"]').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['dark'])
  })
})
