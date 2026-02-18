<script setup lang="ts">
import type { CastMember } from '@/types'
import { getProfileUrl } from '@/utils'

const { cast } = defineProps<{
  cast: CastMember[]
}>()
</script>

<template>
  <section class="py-10">
    <div class="mx-auto max-w-7xl px-6 md:px-10">
      <h2 class="mb-6 text-2xl font-semibold">Starring Cast</h2>
      <div class="flex gap-8 overflow-x-auto pb-2">
        <div
          v-for="{ id, name, character, profile_path } in cast.slice(0, 20)"
          :key="id"
          class="flex shrink-0 flex-col items-center gap-3"
        >
          <UAvatar
            :src="getProfileUrl(profile_path)"
            :alt="name"
            size="3xl"
          />
          <span class="w-24 text-center text-sm text-gray-400 line-clamp-2">
            {{ name }}
          </span>
          <span class="w-24 text-center text-xs text-gray-600 line-clamp-1">
            {{ character }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
