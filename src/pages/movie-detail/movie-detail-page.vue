<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMoviesStore } from '@/stores/moviesStore'
import { isMediaType, isString } from '@/utils'
import MediaHero from './components/media-hero.vue'
import MediaCast from './components/media-cast.vue'

const route = useRoute()
const router = useRouter()

const moviesStore = useMoviesStore()
const { selectedMedia: media, loading, error } = storeToRefs(moviesStore)
const { fetchMediaDetails, clearSelectedMedia } = moviesStore

const cast = computed(() => media.value?.credits?.cast ?? [])
const showSkeleton = computed(() => loading.value && !media.value)
const hasCast = computed(() => cast.value.length > 0)

watch(
  () => [route.params.mediaType, route.params.id],
  ([mediaType, id]) => {
    clearSelectedMedia()
    if (isMediaType(mediaType) && isString(id)) {
      fetchMediaDetails(mediaType, Number(id))
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="showSkeleton" class="min-h-screen">
    <USkeleton class="h-125 w-full" />
    <div class="mx-auto flex max-w-7xl gap-6 px-6 pt-8">
      <div v-for="n in 6" :key="n" class="flex shrink-0 flex-col items-center gap-2">
        <USkeleton class="size-24 rounded-full" />
        <USkeleton class="h-3 w-20" />
      </div>
    </div>
  </div>

  <div v-else-if="error" class="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
    <UAlert
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="error"
      class="max-w-lg"
    />
    <UButton label="Go Back" icon="i-lucide-arrow-left" variant="outline" @click="router.back" />
  </div>

  <div v-else-if="media" class="flex min-h-screen flex-col">
    <MediaHero :media="media" />
    <MediaCast v-if="hasCast" :cast="cast" />
  </div>
</template>
