<script setup lang="ts">
import type { SearchMovieResult } from '@/types'
import { EMPTY_DATA_VALUE } from '@/utils/constants'
import { computed, ref } from 'vue'

const props = defineProps<{
  movie: SearchMovieResult
}>()

const imgFailed = ref(false)
const showPoster = computed(() => props.movie.Poster !== EMPTY_DATA_VALUE && !imgFailed.value)
</script>

<template>
  <RouterLink
    :to="{ name: 'movie-detail', params: { id: movie.imdbID } }"
    class="group flex flex-col overflow-hidden rounded-lg bg-zinc-900 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
  >
    <div class="relative aspect-2/3 w-full overflow-hidden bg-zinc-800">
      <img
        v-if="showPoster"
        :src="movie.Poster"
        :alt="movie.Title"
        class="h-full w-full object-cover transition-opacity group-hover:opacity-90"
        loading="lazy"
        @error="imgFailed = true"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-zinc-500">
        <UIcon name="i-lucide-film" class="size-12" />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-1 p-3">
      <h3 class="line-clamp-1 text-sm font-semibold text-white" :title="movie.Title">
        {{ movie.Title }}
      </h3>
      <div class="mt-auto flex items-center justify-between gap-2">
        <span class="text-xs text-gray-400">{{ movie.Year }}</span>
        <UBadge :label="movie.Type" size="xs" variant="subtle" color="neutral" class="capitalize" />
      </div>
    </div>
  </RouterLink>
</template>
