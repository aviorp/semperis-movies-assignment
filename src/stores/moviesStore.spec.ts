import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref, nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'

const mockQuery = ref<Record<string, string>>({})
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mockQuery.value }),
  useRouter: () => ({ push: mockPush }),
}))

const mockDiscover = vi.fn()
const mockSearch = vi.fn()
const mockGetDetails = vi.fn()
const mockGetGenres = vi.fn()

vi.mock('@/api', () => ({
  api: {
    media: {
      discover: (...args: unknown[]) => mockDiscover(...args),
      search: (...args: unknown[]) => mockSearch(...args),
      getDetails: (...args: unknown[]) => mockGetDetails(...args),
      getGenres: (...args: unknown[]) => mockGetGenres(...args),
    },
  },
}))

import { useMoviesStore } from './moviesStore'
import type { PaginatedResponse, MediaListItem } from '@/types'

const MOCK_ITEM: MediaListItem = {
  id: 272,
  title: 'Batman Begins',
  overview: 'After training with his mentor...',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  genre_ids: [28, 80],
  vote_average: 7.7,
  release_date: '2005-06-15',
}

const MOCK_RESPONSE: PaginatedResponse<MediaListItem> = {
  page: 1,
  results: [MOCK_ITEM],
  total_pages: 1,
  total_results: 1,
}

describe('moviesStore', () => {
  beforeEach(() => {
    mockQuery.value = {}
    setActivePinia(createPinia())
    mockPush.mockClear()
    mockDiscover.mockReset()
    mockSearch.mockReset()
    mockGetDetails.mockReset()
    mockGetGenres.mockReset()
    mockDiscover.mockResolvedValue(MOCK_RESPONSE)
  })

  it('triggers discover on init and search when query exists', async () => {
    useMoviesStore()
    await nextTick()
    await flushPromises()
    expect(mockDiscover).toHaveBeenCalledWith('movie', { page: 1 })

    mockSearch.mockResolvedValue(MOCK_RESPONSE)
    mockQuery.value.search = 'batman'
    await nextTick()
    await flushPromises()
    expect(mockSearch).toHaveBeenCalledWith('movie', { query: 'batman', page: 1 })
  })

  it('re-fetches when filters change', async () => {
    useMoviesStore()
    await nextTick()
    await flushPromises()

    mockDiscover.mockClear()
    mockQuery.value.genres = '28,80'
    await nextTick()
    await flushPromises()
    expect(mockDiscover).toHaveBeenCalledWith('movie', { page: 1, with_genres: '28,80' })
  })

  it('tracks loading state and handles errors', async () => {
    let resolve!: (value: PaginatedResponse<MediaListItem>) => void
    mockDiscover.mockImplementation(
      () => new Promise<PaginatedResponse<MediaListItem>>((r) => (resolve = r)),
    )
    const store = useMoviesStore()
    await nextTick()
    expect(store.loading).toBe(true)
    resolve(MOCK_RESPONSE)
    await flushPromises()
    expect(store.loading).toBe(false)
    expect(store.items).toEqual([MOCK_ITEM])
  })

  it('appends items on loadMore and preserves existing on error', async () => {
    const secondItem = { ...MOCK_ITEM, id: 999, title: 'Batman Returns' }
    mockDiscover
      .mockResolvedValueOnce({ ...MOCK_RESPONSE, total_pages: 3 })
      .mockResolvedValueOnce({
        page: 2,
        results: [secondItem],
        total_pages: 3,
        total_results: 2,
      })
    const store = useMoviesStore()
    await nextTick()
    await flushPromises()

    await store.loadMore()
    expect(store.items).toHaveLength(2)
    expect(store.currentPage).toBe(2)
  })

  it('fetches media details and sets error on failure', async () => {
    const mockDetails = {
      id: 272,
      title: 'Batman Begins',
      overview: 'After training...',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      genres: [{ id: 28, name: 'Action' }],
      vote_average: 7.7,
      vote_count: 10000,
      popularity: 50.5,
      homepage: null,
      tagline: null,
      status: 'Released',
      release_date: '2005-06-15',
      runtime: 140,
      budget: 150000000,
      revenue: 373000000,
      imdb_id: 'tt0372784',
    }
    mockGetDetails.mockResolvedValue(mockDetails)
    const store = useMoviesStore()
    await nextTick()
    await flushPromises()

    await store.fetchMediaDetails('movie', 272)
    expect(store.selectedMedia).toEqual(mockDetails)

    mockGetDetails.mockRejectedValue(new Error('Timeout'))
    await store.fetchMediaDetails('movie', 999)
    expect(store.error).toBe('Timeout')
    expect(store.selectedMedia).toBeNull()
  })
})
