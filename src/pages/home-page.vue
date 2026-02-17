<script setup lang="ts">
import { computed } from 'vue'
import { useMoviesStore } from '@/stores/moviesStore'
import { useFiltersStore } from '@/stores/filtersStore'
import MovieCard from '@/components/movie-card.vue'

const moviesStore = useMoviesStore()
const filtersStore = useFiltersStore()

const SKELETON_COUNT = 10

const hasResults = computed(() => moviesStore.movies.length > 0)
const showEmpty = computed(
  () => !moviesStore.loading && !moviesStore.error && !hasResults.value && filtersStore.search,
)
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <UAlert
      v-if="moviesStore.error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="moviesStore.error"
    />

    <div
      v-if="moviesStore.loading && !hasResults"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      <div v-for="n in SKELETON_COUNT" :key="n" class="flex flex-col gap-2">
        <USkeleton class="aspect-2/3 w-full rounded-lg" />
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-3 w-1/2" />
      </div>
    </div>

    <div
      v-else-if="hasResults"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      <MovieCard v-for="movie in moviesStore.movies" :key="movie.imdbID" :movie="movie" />
    </div>

    <UEmpty
      v-else-if="showEmpty"
      icon="i-lucide-search-x"
      title="No results found"
      description="Try a different search term or adjust your filters"
    />

    <UEmpty
      v-else-if="!filtersStore.search && !moviesStore.loading"
      icon="i-lucide-film"
      title="Search for movies"
      description="Enter a title above to get started"
    />

    <div v-if="moviesStore.hasMore && hasResults" class="flex justify-center">
      <UButton
        label="Load more"
        variant="outline"
        color="neutral"
        size="lg"
        :loading="moviesStore.loading"
        @click="moviesStore.loadMore"
      />
    </div>
  </div>
</template>
