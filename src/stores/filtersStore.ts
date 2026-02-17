import type { MovieType, PlotOptions } from '@/types'
import { extractQueryValue } from '@/utils/query'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export const useFiltersStore = defineStore('filters', () => {
  const route = useRoute()
  const router = useRouter()

  const search = computed(() => extractQueryValue(route.query.search) ?? '')

  const type = computed<MovieType>(() => {
    const val = extractQueryValue(route.query.type)
    if (val === 'movie' || val === 'series' || val === 'episode') return val
    return 'movie'
  })

  const year = computed(() => extractQueryValue(route.query.year) ?? '')

  const plot = computed<PlotOptions>(() => {
    const val = extractQueryValue(route.query.plot)
    if (val === 'full') return 'full'
    return 'short'
  })

  const filters = computed(() => ({
    type: type.value,
    year: year.value,
    plot: plot.value,
  }))

  function updateQuery(params: Record<string, string | undefined>) {
    const query = { ...route.query }
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

  function setType(value: string | null) {
    if (value !== 'movie' && value !== 'series' && value !== 'episode') return
    updateQuery({ type: value === 'movie' ? undefined : value })
  }

  function setYear(value: string | null) {
    updateQuery({ year: value || undefined })
  }

  return { search, type, year, plot, filters, setSearch, setType, setYear }
})
