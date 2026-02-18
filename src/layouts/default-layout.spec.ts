import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, nextTick } from 'vue'
import DefaultLayout from './default-layout.vue'

const mockQuery = ref<Record<string, string>>({})
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: mockQuery.value,
    meta: { title: 'Catalogue - Semperis Movies' },
  }),
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

const UInputStub = {
  name: 'UInput',
  template: '<input :value="modelValue" />',
  props: ['modelValue', 'placeholder', 'icon', 'size'],
}

let pinia: ReturnType<typeof createPinia>

function mountLayout() {
  return shallowMount(DefaultLayout, {
    global: {
      plugins: [pinia],
      stubs: {
        UDashboardGroup: { template: '<div><slot /></div>' },
        UDashboardSidebar: { template: '<div><slot /></div>' },
        UDashboardPanel: {
          template: '<div><slot name="header" /><slot name="body" /></div>',
        },
        UDashboardNavbar: {
          template: '<nav><slot name="leading" /><slot /><slot name="right" /></nav>',
          props: ['title'],
        },
        UDashboardSidebarCollapse: true,
        UColorModeButton: true,
        UInput: UInputStub,
        MovieFilters: true,
        RouterView: true,
      },
      directives: { debounce: () => {} },
    },
  })
}

describe('DefaultLayout', () => {
  beforeEach(() => {
    mockQuery.value = {}
    pinia = createPinia()
    setActivePinia(pinia)
    mockPush.mockClear()
  })

  it('initializes search input from URL query', () => {
    mockQuery.value.search = 'batman'
    const wrapper = mountLayout()
    const input = wrapper.findComponent({ name: 'UInput' })
    expect(input.props('modelValue')).toBe('batman')
  })

  it('syncs search input when store search changes', async () => {
    const wrapper = mountLayout()
    mockQuery.value.search = 'inception'
    await nextTick()
    const input = wrapper.findComponent({ name: 'UInput' })
    expect(input.props('modelValue')).toBe('inception')
  })

  it('calls setSearch on handleSearchSubmit', async () => {
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setSearch')
    const wrapper = mountLayout()

    // @ts-expect-error accessing internal method for testing
    wrapper.vm.searchInput = 'dark knight'
    await nextTick()
    // @ts-expect-error accessing internal method for testing
    wrapper.vm.handleSearchSubmit()

    expect(spy).toHaveBeenCalledWith('dark knight')
  })

  it('trims whitespace via handleDebouncedSearch', () => {
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setSearch')
    const wrapper = mountLayout()

    // @ts-expect-error accessing internal method for testing
    wrapper.vm.handleDebouncedSearch('  batman  ')

    expect(spy).toHaveBeenCalledWith('batman')
  })
})
