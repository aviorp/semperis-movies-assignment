<script setup lang="ts">
import type { MovieDetails, TvDetails } from '@/types'
import { isMovieDetails, getMediaTitle, getMediaYear, getPosterUrl, getBackdropUrl } from '@/utils'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const { media } = defineProps<{
  media: MovieDetails | TvDetails
}>()

const router = useRouter()

const title = computed(() => getMediaTitle(media))
const year = computed(() => getMediaYear(media))
const posterUrl = computed(() => getPosterUrl(media.poster_path, 'large'))
const backdropUrl = computed(() => getBackdropUrl(media.backdrop_path, 'large'))
const genres = computed(() => media.genres)
const voteAverage = computed(() => media.vote_average)
const voteCount = computed(() => media.vote_count)
const overview = computed(() => media.overview)
const starRating = computed(() => voteAverage.value / 2)

const hasRating = computed(() => voteAverage.value > 0)
const hasVotes = computed(() => voteCount.value > 0)

const crew = computed(() => media.credits?.crew ?? [])
const directors = computed(() => crew.value.filter((c) => c.job === 'Director'))
const writers = computed(() => crew.value.filter((c) => c.department === 'Writing'))
const hasDirectors = computed(() => directors.value.length > 0)
const hasWriters = computed(() => writers.value.length > 0)

const runtime = computed(() => {
  if (isMovieDetails(media)) {
    if (!media.runtime) return ''
    const h = Math.floor(media.runtime / 60)
    const m = media.runtime % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }
  const ep = media.episode_run_time
  if (!ep || ep.length === 0) return ''
  return `${ep[0]}m per episode`
})

const seasonInfo = computed(() => {
  if (isMovieDetails(media)) return ''
  return `${media.number_of_seasons} season${media.number_of_seasons !== 1 ? 's' : ''}`
})
</script>

<template>
  <section class="relative min-h-125 overflow-hidden">
    <div class="absolute inset-0 z-0">
      <img
        v-if="backdropUrl"
        :src="backdropUrl"
        :alt="title"
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
        @click="router.back"
      />

      <div class="flex flex-col gap-8 md:flex-row md:gap-12">
        <!-- Poster -->
        <div class="w-56 shrink-0 md:w-72">
          <img
            v-if="posterUrl"
            :src="posterUrl"
            :alt="title"
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
          <h1 class="text-4xl font-bold text-white md:text-5xl">{{ title }}</h1>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge :label="year" variant="subtle" color="neutral" />
            <UBadge
              v-for="{ id, name } in genres"
              :key="id"
              :label="name"
              variant="subtle"
              color="primary"
            />
          </div>

          <div class="flex items-center gap-4 text-sm text-gray-400">
            <span v-if="runtime" class="flex items-center gap-1.5">
              <UIcon name="i-lucide-clock" class="size-4" />
              {{ runtime }}
            </span>
            <span v-if="seasonInfo">{{ seasonInfo }}</span>
          </div>

          <div v-if="hasRating" class="flex items-center gap-3">
            <div class="flex items-center gap-1">
              <UIcon
                v-for="n in 5"
                :key="n"
                name="i-lucide-star"
                :class="n <= Math.round(starRating) ? 'text-yellow-400' : 'text-gray-600'"
                class="size-5"
              />
            </div>
            <span class="text-sm font-medium text-gray-200">
              {{ voteAverage.toFixed(1) }}/10
            </span>
            <span v-if="hasVotes" class="text-sm text-gray-500">
              ({{ voteCount.toLocaleString() }} votes)
            </span>
          </div>

          <p class="max-w-3xl text-lg leading-relaxed text-gray-200">{{ overview }}</p>

          <div class="flex flex-col gap-2 text-sm">
            <div v-if="hasDirectors">
              <span class="text-gray-400">Director:</span>
              <span class="ml-2 font-medium text-gray-200">
                {{ directors.map((d) => d.name).join(', ') }}
              </span>
            </div>
            <div v-if="hasWriters">
              <span class="text-gray-400">Writer:</span>
              <span class="ml-2 font-medium text-gray-200">
                {{ writers.map((w) => w.name).join(', ') }}
              </span>
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
</template>
