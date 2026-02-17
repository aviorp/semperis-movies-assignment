import type { MovieDetails, SearchMovieResult } from '@/types'
import { api } from '@/api'
import { handleError } from '@/utils/handleError'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useFiltersStore } from './filtersStore'

export const useMoviesStore = defineStore('movies', () => {
  const filtersStore = useFiltersStore()

  const movies = ref<SearchMovieResult[]>([])
  const totalResults = ref(0)
  const currentPage = ref(1)
  const selectedMovie = ref<MovieDetails | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hasMore = computed(() => movies.value.length < totalResults.value)

  async function searchMovies(page = 1) {
    loading.value = true
    error.value = null

    try {
      const { filters, search } = filtersStore
      const response = await api.movies.searchMovies({
        s: search,
        type: filters.type,
        ...(filters.year && { y: filters.year }),
        page,
      })

      if (response.Response === 'False') {
        error.value = response.Error
        if (page === 1) {
          movies.value = []
          totalResults.value = 0
        }
        return
      }

      if (page === 1) {
        movies.value = response.Search
      } else {
        movies.value = [...movies.value, ...response.Search]
      }
      totalResults.value = Number(response.totalResults)
      currentPage.value = page
    } catch (e) {
      error.value = handleError(e, 'Failed to fetch movies')
      if (page === 1) {
        movies.value = []
        totalResults.value = 0
      }
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    await searchMovies(currentPage.value + 1)
  }

  async function fetchMovieDetails(imdbId: string) {
    loading.value = true
    error.value = null

    try {
      const { filters } = filtersStore
      const response = await api.movies.getByIdOrTitle({
        i: imdbId,
        type: filters.type,
        plot: filters.plot,
      })

      if (response.Response === 'False') {
        error.value = response.Error
        selectedMovie.value = null
        return
      }

      selectedMovie.value = response
    } catch (e) {
      error.value = handleError(e, 'Failed to fetch movie details')
      selectedMovie.value = null
    } finally {
      loading.value = false
    }
  }

  function clearSelectedMovie() {
    selectedMovie.value = null
  }

  watch(
    () => ({ search: filtersStore.search, type: filtersStore.type, year: filtersStore.year }),
    (params) => {
      if (params.search.trim().length < 3) {
        movies.value = []
        totalResults.value = 0
        currentPage.value = 1
        error.value = null
        return
      }
      searchMovies(1)
    },
    { immediate: true },
  )

  return {
    movies,
    totalResults,
    currentPage,
    hasMore,
    selectedMovie,
    loading,
    error,
    searchMovies,
    loadMore,
    fetchMovieDetails,
    clearSelectedMovie,
  }
})
