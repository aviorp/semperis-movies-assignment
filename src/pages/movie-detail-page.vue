<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useMoviesStore } from '@/stores/moviesStore'
import { parseActors } from '@/utils/parseActors'
import MovieCard from '@/components/movie-card.vue'
import { EMPTY_DATA_VALUE } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const moviesStore = useMoviesStore()

const movie = computed(() => moviesStore.selectedMovie)
const hasPoster = computed(() => movie.value !== null && movie.value.Poster !== EMPTY_DATA_VALUE)
const actors = computed(() => parseActors(movie.value?.Actors))
const genres = computed(() => {
  if (!movie.value || movie.value.Genre === EMPTY_DATA_VALUE) return []
  return movie.value.Genre.split(', ')
})
const starRating = computed(() => {
  if (!movie.value || movie.value.imdbRating === EMPTY_DATA_VALUE) return 0
  return parseFloat(movie.value.imdbRating) / 2
})
const moreLikeThis = computed(() =>
  moviesStore.movies.filter((m) => m.imdbID !== movie.value?.imdbID),
)

function goBack() {
  router.back()
}

watch(
  () => route.params.id,
  (id) => {
    moviesStore.clearSelectedMovie()
    if (typeof id === 'string') {
      moviesStore.fetchMovieDetails(id)
    }
  },
  { immediate: true },
)

onBeforeRouteLeave(() => {
  moviesStore.clearSelectedMovie()
})
</script>

<template>
  <!-- Loading State -->
  <div v-if="moviesStore.loading && !movie" class="min-h-screen">
    <USkeleton class="h-125 w-full" />
    <div class="mx-auto flex max-w-7xl gap-6 px-6 pt-8">
      <div v-for="n in 6" :key="n" class="flex shrink-0 flex-col items-center gap-2">
        <USkeleton class="size-24 rounded-full" />
        <USkeleton class="h-3 w-20" />
      </div>
    </div>
    <div class="mx-auto flex max-w-7xl gap-4 px-6 pt-8">
      <USkeleton v-for="n in 6" :key="n" class="h-72 w-48 shrink-0 rounded-lg" />
    </div>
  </div>

  <!-- Error State -->
  <div
    v-else-if="moviesStore.error"
    class="flex min-h-screen flex-col items-center justify-center gap-4 p-6"
  >
    <UAlert
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="moviesStore.error"
      class="max-w-lg"
    />
    <UButton label="Go Back" icon="i-lucide-arrow-left" variant="outline" @click="goBack" />
  </div>

  <!-- Content -->
  <div v-else-if="movie" class="flex min-h-screen flex-col">
    <!-- Hero Section -->
    <section class="relative min-h-125 overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img
          v-if="hasPoster"
          :src="movie.Poster"
          :alt="movie.Title"
          class="h-full w-full scale-110 object-cover opacity-30 blur-2xl"
        />
        <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/70 to-black/50" />
      </div>

      <div class="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          class="mb-8 text-white hover:bg-white/10"
          @click="goBack"
        />

        <div class="flex flex-col gap-8 md:flex-row md:gap-12">
          <!-- Poster -->
          <div class="w-56 shrink-0 md:w-72">
            <img
              v-if="hasPoster"
              :src="movie.Poster"
              :alt="movie.Title"
              class="w-full rounded-xl shadow-2xl"
            />
            <div
              v-else
              class="flex aspect-2/3 w-full items-center justify-center rounded-xl bg-neutral-800"
            >
              <UIcon name="i-lucide-film" class="size-20 text-neutral-500" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex flex-1 flex-col gap-5">
            <h1 class="text-4xl font-bold text-white md:text-5xl">{{ movie.Title }}</h1>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge
                v-if="movie.Rated !== EMPTY_DATA_VALUE"
                :label="movie.Rated"
                variant="subtle"
                color="neutral"
              />
              <UBadge :label="movie.Year" variant="subtle" color="neutral" />
              <UBadge
                v-for="genre in genres"
                :key="genre"
                :label="genre"
                variant="subtle"
                color="primary"
              />
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span v-if="movie.Runtime !== EMPTY_DATA_VALUE" class="flex items-center gap-1.5">
                <UIcon name="i-lucide-clock" class="size-4" />
                {{ movie.Runtime }}
              </span>
              <span v-if="movie.Released !== EMPTY_DATA_VALUE">{{ movie.Released }}</span>
            </div>

            <div v-if="movie.imdbRating !== EMPTY_DATA_VALUE" class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <UIcon
                  v-for="n in 5"
                  :key="n"
                  name="i-lucide-star"
                  :class="n <= Math.round(starRating) ? 'text-yellow-400' : 'text-gray-600'"
                  class="size-5"
                />
              </div>
              <span class="text-sm font-medium text-gray-200">{{ movie.imdbRating }}/10</span>
              <span v-if="movie.imdbVotes !== EMPTY_DATA_VALUE" class="text-sm text-gray-500">
                ({{ movie.imdbVotes }} votes)
              </span>
            </div>

            <p class="max-w-3xl text-lg leading-relaxed text-gray-200">{{ movie.Plot }}</p>

            <div class="flex flex-col gap-2 text-sm">
              <div v-if="movie.Director !== EMPTY_DATA_VALUE">
                <span class="text-gray-400">Director:</span>
                <span class="ml-2 font-medium text-gray-200">{{ movie.Director }}</span>
              </div>
              <div v-if="movie.Writer !== EMPTY_DATA_VALUE">
                <span class="text-gray-400">Writer:</span>
                <span class="ml-2 font-medium text-gray-200">{{ movie.Writer }}</span>
              </div>
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-3">
              <UButton label="Play Now" icon="i-lucide-play" size="lg" color="primary" />
              <UButton
                label="My List"
                icon="i-lucide-plus"
                size="lg"
                variant="outline"
                color="neutral"
              />
              <UButton icon="i-lucide-thumbs-up" size="lg" variant="ghost" color="neutral" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Starring Cast -->
    <section v-if="actors.length > 0" class="py-10">
      <div class="mx-auto max-w-7xl px-6 md:px-10">
        <h2 class="mb-6 text-2xl font-semibold">Starring Cast</h2>
        <div class="flex gap-8 overflow-x-auto pb-2">
          <div
            v-for="actor in actors"
            :key="actor"
            class="flex shrink-0 flex-col items-center gap-3"
          >
            <UAvatar :alt="actor" size="3xl" />
            <span class="w-24 text-center text-sm text-gray-400 line-clamp-2">{{ actor }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- More Like This -->
    <section v-if="moreLikeThis.length > 0" class="py-10">
      <div class="mx-auto max-w-7xl px-6 md:px-10">
        <h2 class="mb-6 text-2xl font-semibold">More Like This</h2>
        <div class="scrollbar-thin flex gap-5 overflow-x-auto overflow-y-hidden scroll-smooth pb-4">
          <div
            v-for="relatedMovie in moreLikeThis"
            :key="relatedMovie.imdbID"
            class="w-48 shrink-0"
          >
            <MovieCard :movie="relatedMovie" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
