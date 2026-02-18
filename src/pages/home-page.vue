<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useMoviesStore } from '@/stores/moviesStore'
import { useFiltersStore } from '@/stores/filtersStore'
import MovieCard from '@/components/movie-card.vue'

const moviesStore = useMoviesStore()
const { items, loading, error, hasMore } = storeToRefs(moviesStore)
const { loadMore } = moviesStore

const filtersStore = useFiltersStore()
const { mediaType } = storeToRefs(filtersStore)

const SKELETON_COUNT = 10

const hasResults = computed(() => items.value.length > 0)
const showSkeleton = computed(() => loading.value && !hasResults.value)
const showEmpty = computed(() => !loading.value && !error.value && !hasResults.value)
const showLoader = computed(() => hasResults.value && hasMore.value)

const loaderRef = ref<HTMLElement | null>(null)

useIntersectionObserver(
  loaderRef,
  ([entry]) => {
    if (!entry?.isIntersecting) return
    if (loading.value || !hasMore.value) return
    loadMore()
  },
  { rootMargin: '200px' },
)
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="error"
    />

    <div
      v-if="showSkeleton"
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
      <MovieCard
        v-for="item in items"
        :key="item.id"
        :movie="item"
        :media-type="mediaType"
      />
    </div>

    <UEmpty
      v-else-if="showEmpty"
      icon="i-lucide-search-x"
      title="No results found"
      description="Try a different search term or adjust your filters"
    />

    <div
      v-if="showLoader"
      ref="loaderRef"
      class="flex justify-center py-4"
    >
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-neutral-400" />
    </div>
  </div>
</template>
