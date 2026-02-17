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
    movies: {
      searchMovies: vi.fn().mockResolvedValue({ Response: 'False', Error: 'Too many results.' }),
      getByIdOrTitle: vi.fn(),
    },
  },
}))

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
        UButton: {
          template: '<button @click="$emit(\'click\')">{{ label }}</button>',
          props: ['label', 'loading'],
          emits: ['click'],
        },
        MovieCard: { template: '<div class="movie-card" />', props: ['movie'] },
      },
    },
  })
}

describe('HomePage', () => {
  beforeEach(() => {
    mockQuery.value = {}
    pinia = createPinia()
    setActivePinia(pinia)
    mockPush.mockClear()
  })

  it('shows "Search for movies" empty state when no search query', async () => {
    const wrapper = mountPage()
    await nextTick()
    const empties = wrapper.findAll('.empty')
    const searchEmpty = empties.find((el) => el.text().includes('Search for movies'))
    expect(searchEmpty).toBeDefined()
  })

  it('shows error alert when store has an error', async () => {
    const wrapper = mountPage()
    const store = useMoviesStore()
    store.error = 'Something went wrong'
    await nextTick()
    const alert = wrapper.find('.alert')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Something went wrong')
  })

  it('shows loading skeletons when loading with no results', async () => {
    const wrapper = mountPage()
    const store = useMoviesStore()
    store.loading = true
    await nextTick()
    const skeletons = wrapper.findAll('.skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows movie cards when results exist', async () => {
    const wrapper = mountPage()
    const store = useMoviesStore()
    store.movies = [
      {
        Title: 'Batman',
        Year: '1989',
        imdbID: 'tt0096895',
        Type: 'movie',
        Poster: 'https://example.com/poster.jpg',
      },
    ]
    store.totalResults = 1
    await nextTick()
    expect(wrapper.findAll('.movie-card')).toHaveLength(1)
  })

  it('shows "No results found" when search exists but no results', async () => {
    mockQuery.value.search = 'xyznonexistent'
    const wrapper = mountPage()
    const store = useMoviesStore()
    await flushPromises()
    store.error = null
    store.loading = false
    await nextTick()
    const empties = wrapper.findAll('.empty')
    const noResults = empties.find((el) => el.text().includes('No results found'))
    expect(noResults).toBeDefined()
  })

  it('shows load more button when more results are available', async () => {
    const wrapper = mountPage()
    const store = useMoviesStore()
    store.movies = [
      {
        Title: 'Batman',
        Year: '1989',
        imdbID: 'tt0096895',
        Type: 'movie',
        Poster: 'https://example.com/poster.jpg',
      },
    ]
    store.totalResults = 20
    await nextTick()
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Load more')
  })

  it('hides load more button when all results are loaded', async () => {
    const wrapper = mountPage()
    const store = useMoviesStore()
    store.movies = [
      {
        Title: 'Batman',
        Year: '1989',
        imdbID: 'tt0096895',
        Type: 'movie',
        Poster: 'https://example.com/poster.jpg',
      },
    ]
    store.totalResults = 1
    await nextTick()
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
