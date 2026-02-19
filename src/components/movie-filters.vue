<script setup lang="ts">
import type { SelectOption, SelectValue } from '@/types'
import { useFiltersStore } from '@/stores/filtersStore'
import { useGenresStore } from '@/stores/genresStore'
import { isString } from '@/utils'
import { MEDIA_TYPES, ERA_OPTIONS, RATING_OPTIONS } from '@/utils/constants'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const filtersStore = useFiltersStore()
const {
  mediaType,
  search,
  genres: genreFilter,
  era,
  minRating,
  hasActiveFilters,
} = storeToRefs(filtersStore)
const { setMediaType, setGenres, setEra, setMinRating, clearAll } = filtersStore

const genresStore = useGenresStore()
const { genres: allGenres } = storeToRefs(genresStore)

const mediaTypeItems: SelectOption[] = [...MEDIA_TYPES]

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

function handleGenresChange(values: SelectValue) {
  const ids = values.map((v) => Number(isString(v) ? v : v.value))
  setGenres(ids)
}

function handleRatingClick(value: string) {
  setMinRating(minRating.value === value ? '' : value)
}
</script>

<template>
  <div class="flex flex-col gap-6 px-4 py-4">
    <div class="flex flex-col gap-2">
      <span class="text-xs font-semibold uppercase tracking-wider text-dimmed"> Catalog Type </span>
      <UTabs
        :items="mediaTypeItems"
        :model-value="mediaType"
        :content="false"
        variant="pill"
        @update:model-value="handleMediaTypeChange"
      />
    </div>

    <template v-if="!search">
      <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-dimmed"> Genres </span>
        <div class="max-h-52 overflow-y-auto pr-1">
          <UCheckboxGroup
            :items="genreItems"
            :model-value="selectedGenres"
            @update:model-value="handleGenresChange"
          />
        </div>
      </div>

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

    <p v-else class="text-xs text-dimmed">Filters are not available during search</p>

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
