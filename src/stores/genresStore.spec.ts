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

const mockGetGenres = vi.fn()

vi.mock('@/api', () => ({
  api: {
    media: {
      discover: vi.fn().mockResolvedValue({ page: 1, results: [], total_pages: 0, total_results: 0 }),
      search: vi.fn(),
      getDetails: vi.fn(),
      getGenres: (...args: unknown[]) => mockGetGenres(...args),
    },
  },
}))

import { useGenresStore } from './genresStore'
import type { Genre } from '@/types'

const MOCK_GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
]

describe('genresStore', () => {
  beforeEach(() => {
    mockQuery.value = {}
    setActivePinia(createPinia())
    mockGetGenres.mockReset()
    mockGetGenres.mockResolvedValue({ genres: MOCK_GENRES })
  })

  it('fetches genres on init and caches by media type', async () => {
    useGenresStore()
    await nextTick()
    await flushPromises()
    expect(mockGetGenres).toHaveBeenCalledWith('movie')

    mockGetGenres.mockClear()
    mockQuery.value.mediaType = 'tv'
    await nextTick()
    await flushPromises()
    expect(mockGetGenres).toHaveBeenCalledWith('tv')

    mockGetGenres.mockClear()
    mockQuery.value.mediaType = 'movie'
    await nextTick()
    await flushPromises()
    expect(mockGetGenres).not.toHaveBeenCalled()
  })

  it('sets error and clears genres on failure', async () => {
    mockGetGenres.mockRejectedValue(new Error('Network error'))
    const store = useGenresStore()
    await nextTick()
    await flushPromises()
    expect(store.error).toBe('Network error')
    expect(store.genres).toEqual([])
  })
})
