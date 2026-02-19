import type { MediaType, QueryParams } from '@/types'
import { extractQueryValue } from '@/utils'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export const useFiltersStore = defineStore('filters', () => {
  const route = useRoute()
  const router = useRouter()

  const routeQuery = computed(() => route.query)

  const search = computed(() => extractQueryValue(routeQuery.value.search) ?? '')

  const mediaType = computed<MediaType>(() => {
    const val = extractQueryValue(routeQuery.value.mediaType)
    if (val === 'tv') return 'tv'
    return 'movie'
  })

  const genres = computed(() => extractQueryValue(routeQuery.value.genres) ?? '')

  const era = computed(() => extractQueryValue(routeQuery.value.era) ?? '')

  const minRating = computed(() => extractQueryValue(routeQuery.value.minRating) ?? '')

  const hasActiveFilters = computed(
    () =>
      mediaType.value !== 'movie' ||
      genres.value !== '' ||
      era.value !== '' ||
      minRating.value !== '' ||
      search.value !== '',
  )

  function updateQuery(params: QueryParams) {
    const query = { ...routeQuery.value }
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === '') {
        delete query[key]
        continue
      }
      query[key] = value
    }
    router.push({ query })
  }

  function setSearch(value: string) {
    updateQuery({ search: value || undefined })
  }

  function setMediaType(value: MediaType) {
    if (value !== 'movie' && value !== 'tv') return
    updateQuery({
      mediaType: value === 'movie' ? undefined : value,
      genres: undefined,
    })
  }

  function setGenres(genreIds: number[]) {
    updateQuery({ genres: genreIds.length > 0 ? genreIds.join(',') : undefined })
  }

  function toggleGenre(genreId: number) {
    const current = genres.value ? genres.value.split(',').map(Number).filter(Boolean) : []
    const index = current.indexOf(genreId)
    if (index === -1) {
      current.push(genreId)
    } else {
      current.splice(index, 1)
    }
    setGenres(current)
  }

  function setEra(value: string) {
    updateQuery({ era: value || undefined })
  }

  function setMinRating(value: string) {
    updateQuery({ minRating: value || undefined })
  }

  function clearAll() {
    router.push({ query: {} })
  }

  return {
    search,
    mediaType,
    genres,
    era,
    minRating,
    hasActiveFilters,
    setSearch,
    setMediaType,
    setGenres,
    toggleGenre,
    setEra,
    setMinRating,
    clearAll,
  }
})
