<script setup lang="ts">
import { useFiltersStore } from '@/stores/filtersStore'
import { useGenresStore } from '@/stores/genresStore'
import { MEDIA_TYPES, ERA_OPTIONS, RATING_OPTIONS } from '@/utils/constants'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const filtersStore = useFiltersStore()
const { mediaType, search, genres: genreFilter, era, minRating, hasActiveFilters } =
  storeToRefs(filtersStore)
const { setMediaType, setGenres, setEra, setMinRating, clearAll } = filtersStore

const genresStore = useGenresStore()
const { genres: allGenres } = storeToRefs(genresStore)

const mediaTypeItems: { label: string; value: string }[] = [...MEDIA_TYPES]

function handleMediaTypeChange(value: string | number) {
  const strValue = String(value)
  if (strValue === 'movie' || strValue === 'tv') {
    setMediaType(strValue)
  }
}

const genreItems = computed(() =>
  allGenres.value.map(({ id, name }) => ({ label: name, value: String(id) })),
)

const selectedGenres = computed(() => {
  if (!genreFilter.value) return []
  return genreFilter.value.split(',').filter(Boolean)
})

function handleGenresChange(values: string[] | { label: string; value: string }[]) {
  const ids = values.map((v) => Number(typeof v === 'string' ? v : v.value))
  setGenres(ids)
}

function handleRatingClick(value: string) {
  setMinRating(minRating.value === value ? '' : value)
}
</script>

<template>
  <div class="flex flex-col gap-6 px-4 py-4">
    <!-- CATALOG TYPE -->
    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wider text-dimmed">
        Catalog Type
      </span>
      <UTabs
        :items="mediaTypeItems"
        :model-value="mediaType"
        :content="false"
        variant="pill"
        @update:model-value="handleMediaTypeChange"
      />
    </div>

    <!-- Discover-only filters -->
    <template v-if="!search">
      <!-- GENRES -->
      <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-dimmed">
          Genres
        </span>
        <div class="max-h-52 overflow-y-auto pr-1">
          <UCheckboxGroup
            :items="genreItems"
            :model-value="selectedGenres"
            @update:model-value="handleGenresChange"
          />
        </div>
      </div>

      <!-- RELEASE ERA -->
      <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-dimmed">
          Release Era
        </span>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="{ label, value } in ERA_OPTIONS"
            :key="value"
            :label
            :color="era === value ? 'primary' : 'neutral'"
            :variant="era === value ? 'solid' : 'subtle'"
            size="md"
            class="cursor-pointer"
            @click="setEra(value)"
          />
        </div>
      </div>

      <!-- MIN. RATING -->
      <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-dimmed">
          Min. Rating
        </span>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="{ label, value } in RATING_OPTIONS"
            :key="value"
            :label
            :color="minRating === value ? 'primary' : 'neutral'"
            :variant="minRating === value ? 'solid' : 'subtle'"
            size="md"
            class="cursor-pointer"
            @click="handleRatingClick(value)"
          />
        </div>
      </div>
    </template>

    <p v-else class="text-xs text-dimmed">
      Filters are not available during search
    </p>

    <!-- Clear all filters -->
    <UButton
      v-if="hasActiveFilters"
      label="Clear all filters"
      icon="i-lucide-x"
      color="neutral"
      variant="subtle"
      block
      @click="clearAll"
    />
  </div>
</template>
