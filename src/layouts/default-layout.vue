<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFiltersStore } from '@/stores/filtersStore'

const route = useRoute()
const filtersStore = useFiltersStore()

const title = computed(() => {
  if (typeof route.meta?.title === 'string') {
    return route.meta.title
  }
  return 'Movies App'
})

const searchInput = ref(filtersStore.search)

watch(
  () => filtersStore.search,
  (value) => {
    searchInput.value = value
  },
)

function handleDebouncedSearch(value: string) {
  searchInput.value = value
  const trimmed = value.trim()
  if (trimmed.length > 0 && trimmed.length < 3) return
  filtersStore.setSearch(trimmed)
}

function handleSearchSubmit() {
  filtersStore.setSearch(searchInput.value.trim())
}
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <MovieFilters />
    </UDashboardSidebar>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title>
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #default>
            <UInput
              v-debounce:400ms="handleDebouncedSearch"
              :model-value="searchInput"
              placeholder="Search movies, series, episodes..."
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
