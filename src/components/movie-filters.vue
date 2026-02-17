<script setup lang="ts">
import { useFiltersStore } from '@/stores/filtersStore'
import { GENRES } from '@/utils/constants'

const filtersStore = useFiltersStore()
</script>

<template>
  <div class="py-4 px-2 gap-6 flex flex-col items-start">
    <URadioGroup
      class="capitalize"
      legend="Type of media"
      :model-value="filtersStore.type"
      :items="GENRES"
      @update:modelValue="filtersStore.setType"
    />
    <URadioGroup
      indicator="hidden"
      variant="card"
      :items="GENRES"
      class="w-full"
      @update:model-value="filtersStore.setYear"
    />
  </div>
</template>
