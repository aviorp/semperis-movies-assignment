<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFiltersStore } from '@/stores/filtersStore'
import { isString } from '@/utils'

const route = useRoute()

const filtersStore = useFiltersStore()
const { search } = storeToRefs(filtersStore)
const { setSearch } = filtersStore

const title = computed(() => {
  if (isString(route.meta?.title)) {
    return route.meta.title
  }
  return 'Movies App'
})

const searchInput = ref(search.value)

watch(search, (value) => {
  searchInput.value = value
})

function handleDebouncedSearch(value: string) {
  searchInput.value = value
  setSearch(value.trim())
}

function handleSearchSubmit() {
  setSearch(searchInput.value.trim())
}
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar resizable>
      <MovieFilters />
    </UDashboardSidebar>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title>
          <template #default>
            <UInput
              v-debounce:400ms="handleDebouncedSearch"
              :model-value="searchInput"
              placeholder="Search movies & TV shows..."
              icon="i-lucide-search"
              size="xl"
              class="w-100"
              @keydown.enter="handleSearchSubmit"
            />
          </template>

          <template #right>
            <UColorModeButton />
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <RouterView />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
