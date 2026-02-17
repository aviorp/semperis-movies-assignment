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

  describe('search computed', () => {
    it('defaults to empty string when absent from URL', () => {
      const store = useFiltersStore()
      expect(store.search).toBe('')
    })

    it('reads from route.query.search', () => {
      mockQuery.value.search = 'batman'
      const store = useFiltersStore()
      expect(store.search).toBe('batman')
    })
  })

  describe('type computed', () => {
    it('defaults to movie when absent from URL', () => {
      const store = useFiltersStore()
      expect(store.type).toBe('movie')
    })

    it('reads valid type from URL', () => {
      mockQuery.value.type = 'series'
      const store = useFiltersStore()
      expect(store.type).toBe('series')
    })

    it('accepts episode type', () => {
      mockQuery.value.type = 'episode'
      const store = useFiltersStore()
      expect(store.type).toBe('episode')
    })

    it('falls back to movie for invalid type', () => {
      mockQuery.value.type = 'documentary'
      const store = useFiltersStore()
      expect(store.type).toBe('movie')
    })
  })

  describe('year computed', () => {
    it('defaults to empty string when absent from URL', () => {
      const store = useFiltersStore()
      expect(store.year).toBe('')
    })

    it('reads from route.query.year', () => {
      mockQuery.value.year = '2020'
      const store = useFiltersStore()
      expect(store.year).toBe('2020')
    })
  })

  describe('plot computed', () => {
    it('defaults to short when absent from URL', () => {
      const store = useFiltersStore()
      expect(store.plot).toBe('short')
    })

    it('reads full from URL', () => {
      mockQuery.value.plot = 'full'
      const store = useFiltersStore()
      expect(store.plot).toBe('full')
    })

    it('falls back to short for invalid value', () => {
      mockQuery.value.plot = 'extended'
      const store = useFiltersStore()
      expect(store.plot).toBe('short')
    })
  })

  describe('filters computed', () => {
    it('aggregates type, year, and plot', () => {
      mockQuery.value.type = 'series'
      mockQuery.value.year = '2020'
      mockQuery.value.plot = 'full'
      const store = useFiltersStore()
      expect(store.filters).toEqual({ type: 'series', year: '2020', plot: 'full' })
    })

    it('uses defaults when URL has no filter params', () => {
      const store = useFiltersStore()
      expect(store.filters).toEqual({ type: 'movie', year: '', plot: 'short' })
    })
  })

  describe('setSearch', () => {
    it('pushes search param to router', () => {
      const store = useFiltersStore()
      store.setSearch('batman')
      expect(mockPush).toHaveBeenCalledWith({ query: { search: 'batman' } })
    })

    it('removes search param when value is empty', () => {
      mockQuery.value.search = 'batman'
      const store = useFiltersStore()
      store.setSearch('')
      expect(mockPush).toHaveBeenCalledWith({ query: {} })
    })

    it('preserves existing query params', () => {
      mockQuery.value.type = 'series'
      mockQuery.value.year = '2020'
      const store = useFiltersStore()
      store.setSearch('batman')
      expect(mockPush).toHaveBeenCalledWith({
        query: { type: 'series', year: '2020', search: 'batman' },
      })
    })
  })

  describe('setType', () => {
    it('pushes type param for non-default value', () => {
      const store = useFiltersStore()
      store.setType('series')
      expect(mockPush).toHaveBeenCalledWith({ query: { type: 'series' } })
    })

    it('omits type param when value is movie (default)', () => {
      mockQuery.value.type = 'series'
      const store = useFiltersStore()
      store.setType('movie')
      expect(mockPush).toHaveBeenCalledWith({ query: {} })
    })

    it('ignores invalid type values', () => {
      const store = useFiltersStore()
      store.setType('documentary')
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('ignores null', () => {
      const store = useFiltersStore()
      store.setType(null)
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('setYear', () => {
    it('pushes year param to router', () => {
      const store = useFiltersStore()
      store.setYear('2020')
      expect(mockPush).toHaveBeenCalledWith({ query: { year: '2020' } })
    })

    it('removes year param when value is empty', () => {
      mockQuery.value.year = '2020'
      const store = useFiltersStore()
      store.setYear('')
      expect(mockPush).toHaveBeenCalledWith({ query: {} })
    })

    it('removes year param when value is null', () => {
      mockQuery.value.year = '2020'
      const store = useFiltersStore()
      store.setYear(null)
      expect(mockPush).toHaveBeenCalledWith({ query: {} })
    })
  })
})
