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

  it('defaults all filters when no query params', () => {
    const store = useFiltersStore()
    expect(store.search).toBe('')
    expect(store.mediaType).toBe('movie')
    expect(store.genres).toBe('')
    expect(store.hasActiveFilters).toBe(false)
  })

  it('reads filters from route query', () => {
    mockQuery.value = { search: 'batman', mediaType: 'tv', genres: '28,12', era: '2020s', minRating: '8' }
    const store = useFiltersStore()
    expect(store.search).toBe('batman')
    expect(store.mediaType).toBe('tv')
    expect(store.genres).toBe('28,12')
    expect(store.hasActiveFilters).toBe(true)
  })

  it('pushes search param and removes it when empty', () => {
    mockQuery.value.mediaType = 'tv'
    const store = useFiltersStore()
    store.setSearch('batman')
    expect(mockPush).toHaveBeenCalledWith({
      query: { mediaType: 'tv', search: 'batman' },
    })

    mockPush.mockClear()
    mockQuery.value.search = 'batman'
    store.setSearch('')
    expect(mockPush).toHaveBeenCalledWith({ query: { mediaType: 'tv' } })
  })

  it('clears genres when changing media type', () => {
    mockQuery.value = { mediaType: 'tv', genres: '28,12' }
    const store = useFiltersStore()
    store.setMediaType('movie')
    expect(mockPush).toHaveBeenCalledWith({ query: {} })
  })

  it('resets all query params on clearAll', () => {
    mockQuery.value = { mediaType: 'tv', genres: '28', era: '2020s', minRating: '8', search: 'test' }
    const store = useFiltersStore()
    store.clearAll()
    expect(mockPush).toHaveBeenCalledWith({ query: {} })
  })
})
