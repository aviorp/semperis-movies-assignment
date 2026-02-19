import type { DiscoverParams, MediaListItem, MediaType, MovieDetails, TvDetails } from '@/types'
import { api } from '@/api'
import { ERA_DATE_RANGES } from '@/utils/constants'
import { handleError } from '@/utils'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useFiltersStore } from './filtersStore'

interface DiscoverFilterOptions {
  page: number
  genres: string
  era: string
  minRating: string
  mediaType: MediaType
}

function buildDiscoverParams(opts: DiscoverFilterOptions): DiscoverParams {
  const params: DiscoverParams = { page: opts.page }

  if (opts.genres) {
    params.with_genres = opts.genres
  }

  const eraRange = ERA_DATE_RANGES[opts.era]
  if (eraRange) {
    if (opts.mediaType === 'movie') {
      params['primary_release_date.gte'] = eraRange.gte
      params['primary_release_date.lte'] = eraRange.lte
    } else {
      params['first_air_date.gte'] = eraRange.gte
      params['first_air_date.lte'] = eraRange.lte
    }
  }

  if (opts.minRating) {
    params['vote_average.gte'] = Number(opts.minRating)
  }

  return params
}

export const useMoviesStore = defineStore('movies', () => {
  const filtersStore = useFiltersStore()

  const items = ref<MediaListItem[]>([])
  const totalPages = ref(0)
  const currentPage = ref(1)
  const selectedMedia = ref<MovieDetails | TvDetails | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hasMore = computed(() => currentPage.value < totalPages.value)

  async function fetchItems(page = 1) {
    loading.value = true
    error.value = null

    try {
      const { search, mediaType, genres, era, minRating } = filtersStore
      const { results, total_pages } = search
        ? await api.media.search(mediaType, { query: search, page })
        : await api.media.discover(
            mediaType,
            buildDiscoverParams({ page, genres, era, minRating, mediaType }),
          )

      if (page === 1) {
        items.value = results
      } else {
        items.value = [...items.value, ...results]
      }
      totalPages.value = total_pages
      currentPage.value = page
    } catch (e) {
      error.value = handleError(e)
      if (page === 1) {
        items.value = []
        totalPages.value = 0
      }
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    await fetchItems(currentPage.value + 1)
  }

  async function fetchMediaDetails(mediaType: MediaType, id: number) {
    loading.value = true
    error.value = null

    try {
      selectedMedia.value = await api.media.getDetails(mediaType, id)
    } catch (e) {
      error.value = handleError(e)
      selectedMedia.value = null
    } finally {
      loading.value = false
    }
  }

  function clearSelectedMedia() {
    selectedMedia.value = null
  }

  watch(
    () => ({
      search: filtersStore.search,
      mediaType: filtersStore.mediaType,
      genres: filtersStore.genres,
      era: filtersStore.era,
      minRating: filtersStore.minRating,
    }),
    () => {
      fetchItems(1)
    },
    { immediate: true },
  )

  return {
    items,
    totalPages,
    currentPage,
    hasMore,
    selectedMedia,
    loading,
    error,
    fetchItems,
    loadMore,
    fetchMediaDetails,
    clearSelectedMedia,
  }
})
