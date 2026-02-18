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

vi.mock('@/api', () => ({
  api: {
    media: {
      discover: vi.fn().mockResolvedValue({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      search: vi.fn().mockResolvedValue({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      getDetails: vi.fn(),
      getGenres: vi.fn().mockResolvedValue({ genres: [] }),
    },
  },
}))

import { useFiltersStore } from '@/stores/filtersStore'

const UButtonStub = {
  name: 'UButton',
  template: '<button @click="$emit(\'click\')">{{ label }}</button>',
  props: ['label', 'color', 'variant', 'icon', 'block'],
  emits: ['click'],
}

const UTabsStub = {
  name: 'UTabs',
  template: '<div class="tabs" />',
  props: ['items', 'modelValue', 'content', 'variant'],
  emits: ['update:modelValue'],
}

const UBadgeStub = {
  name: 'UBadge',
  template: '<span @click="$emit(\'click\')">{{ label }}</span>',
  props: ['label', 'color', 'variant', 'size'],
  emits: ['click'],
}

const UCheckboxGroupStub = {
  name: 'UCheckboxGroup',
  template: '<fieldset><slot /></fieldset>',
  props: ['modelValue', 'items', 'legend'],
  emits: ['update:modelValue'],
}

const UIconStub = {
  name: 'UIcon',
  template: '<i />',
  props: ['name'],
}

let pinia: ReturnType<typeof createPinia>

function mountFilters() {
  return shallowMount(MovieFilters, {
    global: {
      plugins: [pinia],
      stubs: {
        UButton: UButtonStub,
        UTabs: UTabsStub,
        UBadge: UBadgeStub,
        UCheckboxGroup: UCheckboxGroupStub,
        UIcon: UIconStub,
      },
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

  it('renders tabs for catalog type with correct items', () => {
    const wrapper = mountFilters()
    const tabs = wrapper.findComponent({ name: 'UTabs' })
    expect(tabs.exists()).toBe(true)
    expect(tabs.props('items')).toEqual([
      { label: 'Movies', value: 'movie' },
      { label: 'TV Shows', value: 'tv' },
    ])
  })

  it('passes active media type as model-value to tabs', () => {
    mockQuery.value.mediaType = 'tv'
    const wrapper = mountFilters()
    const tabs = wrapper.findComponent({ name: 'UTabs' })
    expect(tabs.props('modelValue')).toBe('tv')
  })

  it('calls setMediaType when tabs emits update', async () => {
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setMediaType')
    const wrapper = mountFilters()
    const tabs = wrapper.findComponent({ name: 'UTabs' })
    await tabs.vm.$emit('update:modelValue', 'tv')
    expect(spy).toHaveBeenCalledWith('tv')
  })

  it('renders a checkbox group for genres with a label', () => {
    const wrapper = mountFilters()
    const group = wrapper.findComponent({ name: 'UCheckboxGroup' })
    expect(group.exists()).toBe(true)
    expect(wrapper.text()).toContain('Genres')
  })

  it('passes selected genre IDs as model-value to checkbox group', () => {
    mockQuery.value.genres = '28,12'
    const wrapper = mountFilters()
    const group = wrapper.findComponent({ name: 'UCheckboxGroup' })
    expect(group.props('modelValue')).toEqual(['28', '12'])
  })

  it('calls setGenres when checkbox group emits update', async () => {
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setGenres')
    const wrapper = mountFilters()
    const group = wrapper.findComponent({ name: 'UCheckboxGroup' })
    await group.vm.$emit('update:modelValue', ['28', '80'])
    expect(spy).toHaveBeenCalledWith([28, 80])
  })

  it('shows filters disabled message during search', () => {
    mockQuery.value.search = 'batman'
    const wrapper = mountFilters()
    expect(wrapper.text()).toContain('Filters are not available during search')
  })

  it('renders clear all as a UButton when filters are active', () => {
    mockQuery.value.mediaType = 'tv'
    const wrapper = mountFilters()
    const buttons = wrapper.findAllComponents({ name: 'UButton' })
    const clearButton = buttons.find((b) => b.props('label') === 'Clear all filters')
    expect(clearButton).toBeDefined()
    expect(clearButton?.props('variant')).toBe('subtle')
    expect(clearButton?.props('icon')).toBe('i-lucide-x')
  })

  it('does not show clear all button when no filters are active', () => {
    const wrapper = mountFilters()
    const buttons = wrapper.findAllComponents({ name: 'UButton' })
    const clearButton = buttons.find((b) => b.props('label') === 'Clear all filters')
    expect(clearButton).toBeUndefined()
  })

  it('calls clearAll when clear button is clicked', async () => {
    mockQuery.value.era = '2020s'
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'clearAll')
    const wrapper = mountFilters()
    const buttons = wrapper.findAllComponents({ name: 'UButton' })
    const clearButton = buttons.find((b) => b.props('label') === 'Clear all filters')
    await clearButton?.trigger('click')
    expect(spy).toHaveBeenCalled()
  })
})
