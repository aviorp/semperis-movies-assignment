import type { LocationQuery } from 'vue-router'

export function extractQueryValue(value: LocationQuery[string] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}
