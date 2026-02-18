import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'

const mockQuery = ref<Record<string, string>>({})
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mockQuery.value }),
  useRouter: () => ({ push: mockPush }),
}))

import { useFiltersStore } from './filtersStore'

describe('filtersStore', () => {
  beforeEach(() => {
    mockQuery.value = {}
    setActivePinia(createPinia())
    mockPush.mockClear()
  })

  describe('computed filters from URL', () => {
    it('defaults all filters to empty/movie when absent', () => {
      const store = useFiltersStore()
      expect(store.search).toBe('')
      expect(store.mediaType).toBe('movie')
      expect(store.genres).toBe('')
      expect(store.era).toBe('')
      expect(store.minRating).toBe('')
    })

    it('reads all filters from route query', () => {
      mockQuery.value = { search: 'batman', mediaType: 'tv', genres: '28,12', era: '2020s', minRating: '8' }
      const store = useFiltersStore()
      expect(store.search).toBe('batman')
      expect(store.mediaType).toBe('tv')
      expect(store.genres).toBe('28,12')
      expect(store.era).toBe('2020s')
      expect(store.minRating).toBe('8')
    })

    it('falls back to movie for invalid mediaType', () => {
      mockQuery.value.mediaType = 'documentary'
      const store = useFiltersStore()
      expect(store.mediaType).toBe('movie')
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when all filters are default', () => {
      const store = useFiltersStore()
      expect(store.hasActiveFilters).toBe(false)
    })

    it('returns true when any filter is non-default', () => {
      mockQuery.value.era = '2020s'
      const store = useFiltersStore()
      expect(store.hasActiveFilters).toBe(true)
    })
  })

  describe('setSearch', () => {
    it('pushes search param and preserves existing params', () => {
      mockQuery.value.mediaType = 'tv'
      const store = useFiltersStore()
      store.setSearch('batman')
      expect(mockPush).toHaveBeenCalledWith({
        query: { mediaType: 'tv', search: 'batman' },
      })
    })

    it('removes search param when value is empty', () => {
      mockQuery.value.search = 'batman'
      const store = useFiltersStore()
      store.setSearch('')
      expect(mockPush).toHaveBeenCalledWith({ query: {} })
    })
  })

  describe('setMediaType', () => {
    it('clears genres when changing and omits movie as default', () => {
      mockQuery.value = { mediaType: 'tv', genres: '28,12' }
      const store = useFiltersStore()
      store.setMediaType('movie')
      expect(mockPush).toHaveBeenCalledWith({ query: {} })
    })

    it('pushes tv mediaType', () => {
      const store = useFiltersStore()
      store.setMediaType('tv')
      expect(mockPush).toHaveBeenCalledWith({ query: { mediaType: 'tv' } })
    })

    it('ignores invalid mediaType values', () => {
      const store = useFiltersStore()
      // @ts-expect-error testing invalid mediaType input
      store.setMediaType('documentary')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('toggleGenre', () => {
    it('adds a genre when not selected', () => {
      const store = useFiltersStore()
      store.toggleGenre(28)
      expect(mockPush).toHaveBeenCalledWith({ query: { genres: '28' } })
    })

    it('removes a genre when already selected', () => {
      mockQuery.value.genres = '28,12'
      const store = useFiltersStore()
      store.toggleGenre(28)
      expect(mockPush).toHaveBeenCalledWith({ query: { genres: '12' } })
    })
  })

  describe('setEra / setMinRating', () => {
    it('pushes era param', () => {
      const store = useFiltersStore()
      store.setEra('2020s')
      expect(mockPush).toHaveBeenCalledWith({ query: { era: '2020s' } })
    })

    it('pushes minRating param', () => {
      const store = useFiltersStore()
      store.setMinRating('8')
      expect(mockPush).toHaveBeenCalledWith({ query: { minRating: '8' } })
    })
  })

  describe('clearAll', () => {
    it('resets all query params', () => {
      mockQuery.value = { mediaType: 'tv', genres: '28', era: '2020s', minRating: '8', search: 'test' }
      const store = useFiltersStore()
      store.clearAll()
      expect(mockPush).toHaveBeenCalledWith({ query: {} })
    })
  })
})
