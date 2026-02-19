import type { BaseMediaDetails, MediaType, MediaWithDate, MediaWithTitle, MovieDetails } from '@/types'
import type { LocationQuery } from 'vue-router'
import { TMDB_IMAGE_BASE, IMAGE_SIZES } from './constants'

export function extractQueryValue(value: LocationQuery[string] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export function handleError(e: unknown, fallback = 'Something went wrong'): string {
  if (e instanceof Error) return e.message
  return fallback
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isMediaType(value: unknown): value is MediaType {
  return value === 'movie' || value === 'tv'
}

export function getMediaTitle(item: MediaWithTitle): string {
  if ('title' in item && item.title) return item.title
  if ('name' in item && item.name) return item.name
  return ''
}

export function getMediaDate(item: MediaWithDate): string {
  if ('release_date' in item && item.release_date) return item.release_date
  if ('first_air_date' in item && item.first_air_date) return item.first_air_date
  return ''
}

export function getMediaYear(item: MediaWithDate): string {
  const date = getMediaDate(item)
  if (!date) return ''
  return date.slice(0, 4)
}

export function isMovieDetails(details: BaseMediaDetails): details is MovieDetails {
  return 'title' in details
}

export function getPosterUrl(
  path: string | null,
  size: keyof typeof IMAGE_SIZES.poster = 'medium',
): string {
  if (!path) return ''
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.poster[size]}${path}`
}

export function getBackdropUrl(
  path: string | null,
  size: keyof typeof IMAGE_SIZES.backdrop = 'medium',
): string {
  if (!path) return ''
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.backdrop[size]}${path}`
}

export function getProfileUrl(
  path: string | null,
  size: keyof typeof IMAGE_SIZES.profile = 'medium',
): string {
  if (!path) return ''
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.profile[size]}${path}`
}
