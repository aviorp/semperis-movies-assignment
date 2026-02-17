import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import MovieFilters from './movie-filters.vue'

const mockQuery = ref<Record<string, string>>({})
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mockQuery.value }),
  useRouter: () => ({ push: mockPush }),
}))

import { useFiltersStore } from '@/stores/filtersStore'

const URadioGroupStub = {
  name: 'URadioGroup',
  template: '<fieldset><slot /></fieldset>',
  props: ['modelValue', 'items', 'legend', 'indicator', 'variant'],
  emits: ['update:modelValue'],
}

let pinia: ReturnType<typeof createPinia>

function mountFilters() {
  return shallowMount(MovieFilters, {
    global: {
      plugins: [pinia],
      stubs: { URadioGroup: URadioGroupStub },
    },
  })
}

describe('MovieFilters', () => {
  beforeEach(() => {
    mockQuery.value = {}
    pinia = createPinia()
    setActivePinia(pinia)
    mockPush.mockClear()
  })

  it('renders two radio groups', () => {
    const wrapper = mountFilters()
    const groups = wrapper.findAllComponents({ name: 'URadioGroup' })
    expect(groups).toHaveLength(2)
  })

  it('binds current type from store to the type radio group', () => {
    mockQuery.value.type = 'series'
    const wrapper = mountFilters()
    const groups = wrapper.findAllComponents({ name: 'URadioGroup' })
    const typeGroup = groups[0]
    if (!typeGroup) throw new Error('Type radio group not found')
    expect(typeGroup.props('modelValue')).toBe('series')
  })

  it('defaults type to movie when not in URL', () => {
    const wrapper = mountFilters()
    const groups = wrapper.findAllComponents({ name: 'URadioGroup' })
    const typeGroup = groups[0]
    if (!typeGroup) throw new Error('Type radio group not found')
    expect(typeGroup.props('modelValue')).toBe('movie')
  })

  it('calls setType when type radio emits update', async () => {
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setType')
    const wrapper = mountFilters()
    const groups = wrapper.findAllComponents({ name: 'URadioGroup' })
    const typeGroup = groups[0]
    if (!typeGroup) throw new Error('Type radio group not found')
    await typeGroup.vm.$emit('update:modelValue', 'series')
    expect(spy).toHaveBeenCalledWith('series')
  })

  it('calls setYear when year radio emits update', async () => {
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setYear')
    const wrapper = mountFilters()
    const groups = wrapper.findAllComponents({ name: 'URadioGroup' })
    const yearGroup = groups[1]
    if (!yearGroup) throw new Error('Year radio group not found')
    await yearGroup.vm.$emit('update:modelValue', '2020')
    expect(spy).toHaveBeenCalledWith('2020')
  })
})
