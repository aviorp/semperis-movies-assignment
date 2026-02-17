import { describe, it, expect } from 'vitest'
import { extractQueryValue } from './query'

describe('extractQueryValue', () => {
  it('returns string value as-is', () => {
    expect(extractQueryValue('batman')).toBe('batman')
  })

  it('returns null for null input', () => {
    expect(extractQueryValue(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(extractQueryValue(undefined)).toBeNull()
  })

  it('returns first element of string array', () => {
    expect(extractQueryValue(['batman', 'superman'])).toBe('batman')
  })

  it('returns null for empty array', () => {
    expect(extractQueryValue([])).toBeNull()
  })

  it('returns null when first array element is null', () => {
    expect(extractQueryValue([null, 'batman'])).toBeNull()
  })
})
