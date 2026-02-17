import { EMPTY_DATA_VALUE } from './constants'

export function parseActors(actors: string | undefined): string[] {
  if (!actors || actors === EMPTY_DATA_VALUE) return []
  return actors
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
}
