import type { Genre, MediaType } from '@/types'
import { api } from '@/api'
import { handleError } from '@/utils'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useFiltersStore } from './filtersStore'

const CACHE_KEYS: Record<MediaType, object> = {
  movie: {},
  tv: {},
}

/**
 * We use a WeakMap with dummy object keys to cache genres by media type. This allows us to avoid refetching genres when switching between movies and TV shows, while still allowing garbage collection if the store is ever destroyed.
 * for production uses, i would likely implement a client-side caching layer, such as tanstack-query, to handle caching and background updates more robustly.
 */
const cache = new WeakMap<object, Genre[]>()

export const useGenresStore = defineStore('genres', () => {
  const filtersStore = useFiltersStore()

  const genres = ref<Genre[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchGenres(mediaType: MediaType) {
    const key = CACHE_KEYS[mediaType]
    const cached = cache.get(key)
    if (cached) {
      return (genres.value = cached)
    }

    loading.value = true
    error.value = null

    try {
      const { genres: fetched } = await api.media.getGenres(mediaType)
      cache.set(key, fetched)
      genres.value = fetched
    } catch (e) {
      error.value = handleError(e)
      genres.value = []
    } finally {
      loading.value = false
    }
  }

  watch(
    () => filtersStore.mediaType,
    (mediaType) => {
      fetchGenres(mediaType)
    },
    { immediate: true },
  )

  return { genres, loading, error, fetchGenres }
})
