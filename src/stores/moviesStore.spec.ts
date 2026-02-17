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

const mockSearchMovies = vi.fn()
const mockGetByIdOrTitle = vi.fn()

vi.mock('@/api', () => ({
  api: {
    movies: {
      searchMovies: (...args: unknown[]) => mockSearchMovies(...args),
      getByIdOrTitle: (...args: unknown[]) => mockGetByIdOrTitle(...args),
    },
  },
}))

import { useMoviesStore } from './moviesStore'
import type { SearchMoviesResponse } from '@/types'

const MOCK_MOVIE = {
  Title: 'Batman Begins',
  Year: '2005',
  imdbID: 'tt0372784',
  Type: 'movie' as const,
  Poster: 'https://example.com/poster.jpg',
}

const MOCK_SEARCH_RESPONSE = {
  Response: 'True' as const,
  Search: [MOCK_MOVIE],
  totalResults: '1',
}

const MOCK_ERROR_RESPONSE = {
  Response: 'False' as const,
  Error: 'Movie not found!',
}

describe('moviesStore', () => {
  beforeEach(() => {
    mockQuery.value = {}
    setActivePinia(createPinia())
    mockPush.mockClear()
    mockSearchMovies.mockReset()
    mockGetByIdOrTitle.mockReset()
  })

  describe('watcher auto-fetch', () => {
    it('clears state when search is shorter than 3 characters', async () => {
      mockQuery.value.search = 'ab'
      const store = useMoviesStore()
      await nextTick()
      expect(store.movies).toEqual([])
      expect(store.totalResults).toBe(0)
      expect(store.error).toBeNull()
      expect(mockSearchMovies).not.toHaveBeenCalled()
    })

    it('triggers searchMovies when search has 3+ characters', async () => {
      mockSearchMovies.mockResolvedValue(MOCK_SEARCH_RESPONSE)
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(mockSearchMovies).toHaveBeenCalledWith(
        expect.objectContaining({ s: 'batman', page: 1 }),
      )
      expect(store.movies).toEqual([MOCK_MOVIE])
    })

    it('re-fetches when type filter changes', async () => {
      mockSearchMovies.mockResolvedValue(MOCK_SEARCH_RESPONSE)
      mockQuery.value.search = 'batman'
      useMoviesStore()
      await nextTick()
      await flushPromises()

      mockSearchMovies.mockClear()
      mockQuery.value.type = 'series'
      await nextTick()
      await flushPromises()
      expect(mockSearchMovies).toHaveBeenCalledWith(
        expect.objectContaining({ s: 'batman', type: 'series', page: 1 }),
      )
    })

    it('re-fetches when year filter changes', async () => {
      mockSearchMovies.mockResolvedValue(MOCK_SEARCH_RESPONSE)
      mockQuery.value.search = 'batman'
      useMoviesStore()
      await nextTick()
      await flushPromises()

      mockSearchMovies.mockClear()
      mockQuery.value.year = '2020'
      await nextTick()
      await flushPromises()
      expect(mockSearchMovies).toHaveBeenCalledWith(
        expect.objectContaining({ s: 'batman', y: '2020', page: 1 }),
      )
    })

    it('clears movies when search drops below 3 characters', async () => {
      mockSearchMovies.mockResolvedValue(MOCK_SEARCH_RESPONSE)
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(store.movies).toHaveLength(1)

      mockQuery.value.search = 'ba'
      await nextTick()
      expect(store.movies).toEqual([])
      expect(store.totalResults).toBe(0)
      expect(store.currentPage).toBe(1)
    })
  })

  describe('searchMovies', () => {
    it('sets loading to true during request', async () => {
      let resolve!: (value: SearchMoviesResponse) => void
      mockSearchMovies.mockImplementation(
        () => new Promise<SearchMoviesResponse>((r) => (resolve = r)),
      )
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      expect(store.loading).toBe(true)
      resolve(MOCK_SEARCH_RESPONSE)
      await flushPromises()
      expect(store.loading).toBe(false)
    })

    it('replaces movies on page 1', async () => {
      mockSearchMovies.mockResolvedValue(MOCK_SEARCH_RESPONSE)
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(store.movies).toEqual([MOCK_MOVIE])
      expect(store.currentPage).toBe(1)
    })

    it('handles API error response', async () => {
      mockSearchMovies.mockResolvedValue(MOCK_ERROR_RESPONSE)
      mockQuery.value.search = 'xyznonexistent'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(store.error).toBe('Movie not found!')
      expect(store.movies).toEqual([])
    })

    it('handles network error', async () => {
      mockSearchMovies.mockRejectedValue(new Error('Network error'))
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(store.error).toBe('Network error')
      expect(store.movies).toEqual([])
    })

    it('handles non-Error thrown values', async () => {
      mockSearchMovies.mockRejectedValue('something broke')
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(store.error).toBe('Failed to fetch movies')
    })
  })

  describe('loadMore', () => {
    it('appends movies from next page', async () => {
      const secondMovie = { ...MOCK_MOVIE, imdbID: 'tt9999999', Title: 'Batman Returns' }
      mockSearchMovies
        .mockResolvedValueOnce({ ...MOCK_SEARCH_RESPONSE, totalResults: '20' })
        .mockResolvedValueOnce({
          Response: 'True' as const,
          Search: [secondMovie],
          totalResults: '20',
        })
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(store.movies).toHaveLength(1)
      expect(store.currentPage).toBe(1)

      await store.loadMore()
      expect(store.movies).toHaveLength(2)
      expect(store.movies[1]).toEqual(secondMovie)
      expect(store.currentPage).toBe(2)
    })

    it('does not clear existing movies on page 2 error', async () => {
      mockSearchMovies
        .mockResolvedValueOnce({ ...MOCK_SEARCH_RESPONSE, totalResults: '20' })
        .mockResolvedValueOnce(MOCK_ERROR_RESPONSE)
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()

      await store.loadMore()
      expect(store.movies).toHaveLength(1)
      expect(store.error).toBe('Movie not found!')
    })
  })

  describe('hasMore', () => {
    it('returns true when loaded movies are fewer than totalResults', async () => {
      mockSearchMovies.mockResolvedValue({ ...MOCK_SEARCH_RESPONSE, totalResults: '20' })
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(store.hasMore).toBe(true)
    })

    it('returns false when all results are loaded', async () => {
      mockSearchMovies.mockResolvedValue(MOCK_SEARCH_RESPONSE)
      mockQuery.value.search = 'batman'
      const store = useMoviesStore()
      await nextTick()
      await flushPromises()
      expect(store.hasMore).toBe(false)
    })
  })

  describe('fetchMovieDetails', () => {
    it('populates selectedMovie on success', async () => {
      const mockDetails = {
        ...MOCK_MOVIE,
        Response: 'True' as const,
        Rated: 'PG-13',
        Released: '15 Jun 2005',
        Runtime: '140 min',
        Genre: 'Action',
        Director: 'Christopher Nolan',
        Writer: 'Bob Kane',
        Actors: 'Christian Bale',
        Plot: 'After training with his mentor...',
        Language: 'English',
        Country: 'USA',
        Awards: 'Nominated for 1 Oscar',
        Ratings: [],
        Metascore: '70',
        imdbRating: '8.2',
        imdbVotes: '1000000',
        DVD: 'N/A',
        BoxOffice: '$206M',
        Production: 'N/A',
        Website: 'N/A',
      }
      mockGetByIdOrTitle.mockResolvedValue(mockDetails)
      const store = useMoviesStore()
      await nextTick()

      await store.fetchMovieDetails('tt0372784')
      expect(store.selectedMovie).toEqual(mockDetails)
      expect(store.loading).toBe(false)
    })

    it('sets error on API error response', async () => {
      mockGetByIdOrTitle.mockResolvedValue(MOCK_ERROR_RESPONSE)
      const store = useMoviesStore()
      await nextTick()

      await store.fetchMovieDetails('tt0000000')
      expect(store.error).toBe('Movie not found!')
      expect(store.selectedMovie).toBeNull()
    })

    it('sets error on network failure', async () => {
      mockGetByIdOrTitle.mockRejectedValue(new Error('Timeout'))
      const store = useMoviesStore()
      await nextTick()

      await store.fetchMovieDetails('tt0372784')
      expect(store.error).toBe('Timeout')
      expect(store.selectedMovie).toBeNull()
    })
  })

  describe('clearSelectedMovie', () => {
    it('resets selectedMovie to null', async () => {
      mockGetByIdOrTitle.mockResolvedValue({
        ...MOCK_MOVIE,
        Response: 'True' as const,
        Rated: 'PG-13',
        Released: '',
        Runtime: '',
        Genre: '',
        Director: '',
        Writer: '',
        Actors: '',
        Plot: '',
        Language: '',
        Country: '',
        Awards: '',
        Ratings: [],
        Metascore: '',
        imdbRating: '',
        imdbVotes: '',
        DVD: '',
        BoxOffice: '',
        Production: '',
        Website: '',
      })
      const store = useMoviesStore()
      await nextTick()

      await store.fetchMovieDetails('tt0372784')
      expect(store.selectedMovie).not.toBeNull()

      store.clearSelectedMovie()
      expect(store.selectedMovie).toBeNull()
    })
  })
})
