<script setup lang="ts">
import type { MediaListItem, MediaType } from '@/types'
import { getMediaTitle, getMediaYear, getPosterUrl } from '@/utils'
import { computed, ref } from 'vue'

const { movie, mediaType } = defineProps<{
  movie: MediaListItem
  mediaType: MediaType
}>()

const imgFailed = ref(false)
const hasRating = movie.vote_average > 0
const showPoster = computed(() => getPosterUrl(movie.poster_path) !== '' && !imgFailed.value)
const rating = movie.vote_average.toFixed(1)

function getMediaLabel(mediaType: MediaType): string {
  return mediaType === 'tv' ? 'TV' : 'Movie'
}
</script>

<template>
  <RouterLink
    :to="{ name: 'media-detail', params: { mediaType, id: movie.id } }"
    class="group flex flex-col overflow-hidden rounded-lg bg-muted/10 shadow-xl transition-transform hover:scale-105 hover:shadow-2xl"
  >
    <div class="relative aspect-2/3 w-full overflow-hidden bg-muted/10">
      <img
        v-if="showPoster"
        :src="getPosterUrl(movie.poster_path)"
        :alt="getMediaTitle(movie)"
        class="h-full w-full object-cover transition-opacity group-hover:opacity-90"
        loading="lazy"
        @error="imgFailed = true"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-zinc-500">
        <UIcon name="i-lucide-film" class="size-12" />
      </div>

      <div
        v-if="hasRating"
        class="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-primary/70 px-2 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm"
      >
        <UIcon name="i-lucide-star" class="size-3" />
        {{ rating }}
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-1 p-3">
      <h3 class="line-clamp-1 text-sm font-semibold" :title="getMediaTitle(movie)">
        {{ getMediaTitle(movie) }}
      </h3>
      <div class="mt-auto flex items-center justify-between gap-2">
        <span class="text-xs text-muted/80">{{ getMediaYear(movie) }}</span>
        <UBadge :label="getMediaLabel(mediaType)" size="xs" variant="subtle" color="neutral" />
      </div>
    </div>
  </RouterLink>
</template>
