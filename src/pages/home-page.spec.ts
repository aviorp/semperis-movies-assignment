import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, nextTick } from 'vue'
import HomePage from './home-page.vue'

const mockQuery = ref<Record<string, string>>({})
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mockQuery.value }),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/api', () => ({
  api: {
    media: {
      discover: vi
        .fn()
        .mockResolvedValue({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      search: vi
        .fn()
        .mockResolvedValue({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      getDetails: vi.fn(),
      getGenres: vi.fn().mockResolvedValue({ genres: [] }),
    },
  },
}))

const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  observe = mockObserve
  unobserve = vi.fn()
  disconnect = mockDisconnect
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {}
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

import { useMoviesStore } from '@/stores/moviesStore'

let pinia: ReturnType<typeof createPinia>

function mountPage() {
  return shallowMount(HomePage, {
    global: {
      plugins: [pinia],
      stubs: {
        UAlert: { template: '<div class="alert"><slot />{{ title }}</div>', props: ['title'] },
        USkeleton: { template: '<div class="skeleton" />' },
        UEmpty: {
          template: '<div class="empty">{{ title }}</div>',
          props: ['title', 'description', 'icon'],
        },
        UIcon: { template: '<span class="icon" />' },
        MovieCard: { template: '<div class="movie-card" />', props: ['movie', 'mediaType'] },
      },
    },
  })
}

const MOCK_ITEM = {
  id: 272,
  title: 'Batman Begins',
  overview: 'After training...',
  poster_path: '/poster.jpg',
  backdrop_path: null,
  genre_ids: [28],
  vote_average: 7.7,
  release_date: '2005-06-15',
}

describe('HomePage', () => {
  beforeEach(() => {
    mockQuery.value = {}
    pinia = createPinia()
    setActivePinia(pinia)
    mockPush.mockClear()
    mockObserve.mockClear()
    mockDisconnect.mockClear()
  })

  it('shows error alert when store has an error', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const store = useMoviesStore()
    store.error = 'Something went wrong'
    await nextTick()
    const alert = wrapper.find('.alert')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Something went wrong')
  })

  it('shows loading skeletons when loading with no results', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const store = useMoviesStore()
    store.loading = true
    store.items = []
    await nextTick()
    const skeletons = wrapper.findAll('.skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows movie cards when results exist', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const store = useMoviesStore()
    store.items = [MOCK_ITEM]
    await nextTick()
    expect(wrapper.findAll('.movie-card')).toHaveLength(1)
  })

  it('shows "No results found" when no results and not loading', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const store = useMoviesStore()
    store.error = null
    store.loading = false
    store.items = []
    await nextTick()
    const empties = wrapper.findAll('.empty')
    const noResults = empties.find((el) => el.text().includes('No results found'))
    expect(noResults).toBeDefined()
  })

  it('shows loader when more results are available', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const store = useMoviesStore()
    store.items = [MOCK_ITEM]
    store.totalPages = 3
    store.currentPage = 1
    await nextTick()
    const loader = wrapper.find('.icon')
    expect(loader.exists()).toBe(true)
  })

  it('hides loader when all results are loaded', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const store = useMoviesStore()
    store.items = [MOCK_ITEM]
    store.totalPages = 1
    store.currentPage = 1
    await nextTick()
    const loader = wrapper.find('.icon')
    expect(loader.exists()).toBe(false)
  })
})
