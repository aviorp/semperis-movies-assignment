export const MEDIA_TYPES = [
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' },
] as const

export const ERA_OPTIONS = [
  { label: 'All Time', value: '' },
  { label: '2020s', value: '2020s' },
  { label: '2010s', value: '2010s' },
  { label: '2000s', value: '2000s' },
  { label: '90s - 50s', value: 'classic' },
] as const

import type { DateRange } from '@/types'

export const ERA_DATE_RANGES: Record<string, DateRange> = {
  '2020s': { gte: '2020-01-01', lte: '2029-12-31' },
  '2010s': { gte: '2010-01-01', lte: '2019-12-31' },
  '2000s': { gte: '2000-01-01', lte: '2009-12-31' },
  classic: { gte: '1950-01-01', lte: '1999-12-31' },
}

export const RATING_OPTIONS = [
  { label: '8.0+', value: '8' },
  { label: '7.5+', value: '7.5' },
  { label: '6.0+', value: '6' },
  { label: '5.0+', value: '5' },
] as const

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original',
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original',
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original',
  },
} as const
