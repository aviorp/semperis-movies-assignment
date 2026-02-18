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

  describe('watcher auto-fetch', () => {
    it('triggers discover on init when no search query', async () => {
      useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(mockDiscover).toHaveBeenCalledWith('movie', { page: 1 })
    })

    it('triggers search when search query exists', async () => {
      mockSearch.mockResolvedValue(MOCK_RESPONSE)
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(mockSearch).toHaveBeenCalledWith('movie', { query: 'batman', page: 1 })
      expect(store.items).toEqual([MOCK_ITEM])
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

    it('passes date range params for era filter (movie)', async () => {
      useMoviesStore()
      await nextTick()
      await flushPromises()

      mockDiscover.mockClear()
      mockQuery.value.era = '2020s'
      await nextTick()
      await flushPromises()
      expect(mockDiscover).toHaveBeenCalledWith('movie', {
        page: 1,
        'primary_release_date.gte': '2020-01-01',
        'primary_release_date.lte': '2029-12-31',
      })
    })

    it('uses first_air_date params for TV era filter', async () => {
      mockQuery.value.mediaType = 'tv'
      useMoviesStore()
      await nextTick()
      await flushPromises()

      mockDiscover.mockClear()
      mockQuery.value.era = '2010s'
      await nextTick()
      await flushPromises()
      expect(mockDiscover).toHaveBeenCalledWith('tv', {
        page: 1,
        'first_air_date.gte': '2010-01-01',
        'first_air_date.lte': '2019-12-31',
      })
    })

    it('passes vote_average.gte for minRating filter', async () => {
      useMoviesStore()
      await nextTick()
      await flushPromises()

      mockDiscover.mockClear()
      mockQuery.value.minRating = '8'
      await nextTick()
      await flushPromises()
      expect(mockDiscover).toHaveBeenCalledWith('movie', {
        page: 1,
        'vote_average.gte': 8,
      })
    })
  })

  describe('fetchItems', () => {
    it('replaces items on page 1 and tracks loading state', async () => {
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

    it('handles errors with default message for non-Error values', async () => {
      mockDiscover.mockRejectedValue('something broke')
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(store.error).toBe('Something went wrong')
      expect(store.items).toEqual([])
    })
  })

  describe('loadMore', () => {
    it('appends items from next page', async () => {
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

    it('does not clear existing items on page 2 error', async () => {
      mockDiscover
        .mockResolvedValueOnce({ ...MOCK_RESPONSE, total_pages: 3 })
        .mockRejectedValueOnce(new Error('Network error'))
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()

      await store.loadMore()
      expect(store.items).toHaveLength(1)
      expect(store.error).toBe('Network error')
    })
  })

  describe('fetchMediaDetails', () => {
    it('populates selectedMedia on success', async () => {
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
    })

    it('sets error on failure and clears selectedMedia', async () => {
      mockGetDetails.mockRejectedValue(new Error('Timeout'))
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()

      await store.fetchMediaDetails('movie', 272)
      expect(store.error).toBe('Timeout')
      expect(store.selectedMedia).toBeNull()
    })
  })
})
