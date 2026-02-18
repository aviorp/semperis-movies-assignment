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
      genres.value = cached
      return
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
