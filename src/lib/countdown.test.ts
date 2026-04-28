import { describe, it, expect } from 'vitest'
import { formatCountdown, getCountdownColorClass, getSecondsRemaining } from './countdown'

describe('formatCountdown', () => {
  it('returns "Ready" when seconds is 0', () => {
    expect(formatCountdown(0)).toBe('Ready')
  })
  it('returns "Ready" when seconds is Infinity', () => {
    expect(formatCountdown(Infinity)).toBe('Ready')
  })
  it('formats seconds only', () => {
    expect(formatCountdown(45)).toBe('45s')
  })
  it('formats minutes and seconds', () => {
    expect(formatCountdown(125)).toBe('2m 5s')
  })
  it('formats hours, minutes, seconds', () => {
    expect(formatCountdown(3723)).toBe('1h 2m 3s')
  })
})

describe('getCountdownColorClass', () => {
  it('returns green for elapsed (0 seconds)', () => {
    expect(getCountdownColorClass(0)).toBe('text-green-400')
  })
  it('returns red+pulse for under 15 minutes', () => {
    expect(getCountdownColorClass(500)).toContain('text-red-400')
    expect(getCountdownColorClass(500)).toContain('animate-pulse')
  })
  it('returns amber for under 2 hours', () => {
    expect(getCountdownColorClass(3600)).toBe('text-amber-400')
  })
  it('returns white for over 2 hours', () => {
    expect(getCountdownColorClass(10000)).toBe('text-white')
  })
})

describe('getSecondsRemaining', () => {
  it('returns Infinity for null resetAt', () => {
    expect(getSecondsRemaining(null)).toBe(Infinity)
  })
  it('returns 0 for a past timestamp', () => {
    const past = new Date(Date.now() - 5000).toISOString()
    expect(getSecondsRemaining(past)).toBe(0)
  })
  it('returns positive number for a future timestamp', () => {
    const future = new Date(Date.now() + 10000).toISOString()
    expect(getSecondsRemaining(future)).toBeGreaterThan(0)
  })
})
