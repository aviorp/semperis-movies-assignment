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
    movies: {
      searchMovies: vi.fn().mockResolvedValue({ Response: 'False', Error: 'Too many results.' }),
      getByIdOrTitle: vi.fn(),
    },
  },
}))

import { useFiltersStore } from '@/stores/filtersStore'

const UInputStub = {
  name: 'UInput',
  template:
    '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keydown="$emit(\'keydown\', $event)" />',
  props: ['modelValue', 'placeholder', 'icon', 'size', 'loading'],
  emits: ['update:modelValue', 'keydown'],
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

  it('initializes search input as empty when no query', () => {
    const wrapper = mountLayout()
    const input = wrapper.findComponent({ name: 'UInput' })
    expect(input.props('modelValue')).toBe('')
  })

  it('syncs search input when store search changes (browser back/forward)', async () => {
    const wrapper = mountLayout()
    mockQuery.value.search = 'inception'
    await nextTick()
    const input = wrapper.findComponent({ name: 'UInput' })
    expect(input.props('modelValue')).toBe('inception')
  })

  it('calls setSearch on Enter key via handleSearchSubmit', async () => {
    const wrapper = mountLayout()
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setSearch')

    const vm = wrapper.vm as unknown as { searchInput: string }
    vm.searchInput = 'dark knight'
    await nextTick()

    const handler = wrapper.vm as unknown as { handleSearchSubmit: () => void }
    handler.handleSearchSubmit()

    expect(spy).toHaveBeenCalledWith('dark knight')
  })

  it('handleDebouncedSearch calls setSearch for 3+ char input', () => {
    const wrapper = mountLayout()
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setSearch')

    const handler = wrapper.vm as unknown as {
      handleDebouncedSearch: (value: string) => void
    }
    handler.handleDebouncedSearch('batman')

    expect(spy).toHaveBeenCalledWith('batman')
  })

  it('handleDebouncedSearch calls setSearch for empty input (clears)', () => {
    mockQuery.value.search = 'batman'
    const wrapper = mountLayout()
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setSearch')

    const handler = wrapper.vm as unknown as {
      handleDebouncedSearch: (value: string) => void
    }
    handler.handleDebouncedSearch('')

    expect(spy).toHaveBeenCalledWith('')
  })

  it('handleDebouncedSearch skips setSearch for 1-2 char input', () => {
    const wrapper = mountLayout()
    const store = useFiltersStore()
    const spy = vi.spyOn(store, 'setSearch')

    const handler = wrapper.vm as unknown as {
      handleDebouncedSearch: (value: string) => void
    }
    handler.handleDebouncedSearch('ab')

    expect(spy).not.toHaveBeenCalled()
  })
})
