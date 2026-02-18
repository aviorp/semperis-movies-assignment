import { describe, it, expect } from 'vitest'
import { extractQueryValue, handleError } from '.'

describe('extractQueryValue', () => {
  it('returns string value as-is', () => {
    expect(extractQueryValue('batman')).toBe('batman')
  })

  it('returns null for null or undefined input', () => {
    expect(extractQueryValue(null)).toBeNull()
    expect(extractQueryValue(undefined)).toBeNull()
  })

  it('returns first element of string array', () => {
    expect(extractQueryValue(['batman', 'superman'])).toBe('batman')
  })

  it('returns null for empty array or array starting with null', () => {
    expect(extractQueryValue([])).toBeNull()
    expect(extractQueryValue([null, 'batman'])).toBeNull()
  })
})

describe('handleError', () => {
  it('extracts message from Error instances', () => {
    expect(handleError(new Error('Network error'))).toBe('Network error')
  })

  it('returns default fallback for non-Error values', () => {
    expect(handleError('something broke')).toBe('Something went wrong')
  })

  it('uses custom fallback when provided', () => {
    expect(handleError('oops', 'Custom message')).toBe('Custom message')
  })
})
