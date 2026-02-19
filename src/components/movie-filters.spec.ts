import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'

const mockQuery = ref<Record<string, string>>({})
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mockQuery.value }),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/api', () => ({
  api: {
    media: {
      discover: vi.fn().mockResolvedValue({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      search: vi.fn(),
      getDetails: vi.fn(),
      getGenres: vi.fn().mockResolvedValue({ genres: [] }),
    },
  },
}))

import MovieFilters from './movie-filters.vue'

const stubs = {
  UTabs: { template: '<div />', props: ['items', 'modelValue'] },
  UCheckboxGroup: { template: '<div />', props: ['items', 'modelValue'] },
  UBadge: { template: '<span @click="$emit(\'click\')">{{ label }}</span>', props: ['label', 'color', 'variant'] },
  UButton: { template: '<button @click="$emit(\'click\')">{{ label }}</button>', props: ['label'] },
}

describe('MovieFilters', () => {
  beforeEach(() => {
    mockQuery.value = {}
    mockPush.mockClear()
    setActivePinia(createPinia())
  })

  it('renders filter sections when not searching', () => {
    const wrapper = shallowMount(MovieFilters, { global: { stubs } })
    expect(wrapper.text()).toContain('Catalog Type')
    expect(wrapper.text()).toContain('Genres')
    expect(wrapper.text()).toContain('Release Era')
    expect(wrapper.text()).toContain('Min. Rating')
  })

  it('hides genre/era/rating filters during search', () => {
    mockQuery.value = { search: 'batman' }
    const wrapper = shallowMount(MovieFilters, { global: { stubs } })
    expect(wrapper.text()).toContain('Catalog Type')
    expect(wrapper.text()).not.toContain('Genres')
    expect(wrapper.text()).toContain('Filters are not available during search')
  })

  it('shows clear button only when filters are active', () => {
    const wrapper = shallowMount(MovieFilters, { global: { stubs } })
    expect(wrapper.text()).not.toContain('Clear all filters')

    mockQuery.value = { genres: '28' }
    const active = shallowMount(MovieFilters, { global: { stubs } })
    expect(active.text()).toContain('Clear all filters')
  })
})
