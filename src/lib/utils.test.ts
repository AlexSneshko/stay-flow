import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  parseCurrencyInput,
  formatDate,
  getMonthRange,
  parseISO,
  formatISO,
  pad,
  getWeekNumber,
  txnInitials,
} from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats cents as USD with two decimal places by default', () => {
    expect(formatCurrency(1250)).toBe('$12.50')
  })

  it('formats zero cents correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats large amounts correctly', () => {
    expect(formatCurrency(100000)).toBe('$1,000.00')
  })

  it('formats a non-USD currency', () => {
    expect(formatCurrency(500, 'EUR')).toContain('5.00')
  })

  it('rounds to nearest dollar when round=true', () => {
    expect(formatCurrency(1250, 'USD', true)).toBe('$13')
  })

  it('rounds down to nearest dollar when round=true', () => {
    expect(formatCurrency(1240, 'USD', true)).toBe('$12')
  })
})

describe('parseCurrencyInput', () => {
  it('parses a decimal string like "12.50" to 1250', () => {
    expect(parseCurrencyInput('12.50')).toBe(1250)
  })

  it('parses a plain integer string like "12" to 12', () => {
    expect(parseCurrencyInput('12')).toBe(12)
  })

  it('parses a dollar-prefixed string like "$12.50" to 1250', () => {
    expect(parseCurrencyInput('$12.50')).toBe(1250)
  })

  it('returns 0 for a non-numeric string like "abc"', () => {
    expect(parseCurrencyInput('abc')).toBe(0)
  })

  it('returns 0 for an empty string', () => {
    expect(parseCurrencyInput('')).toBe(0)
  })

  it('strips all non-digit characters from a mixed string', () => {
    expect(parseCurrencyInput('$1,234.56')).toBe(123456)
  })
})

describe('formatDate', () => {
  it('formats a Date object with default options (short month, numeric day, year)', () => {
    const d = new Date(2025, 2, 15) // March 15, 2025
    expect(formatDate(d)).toBe('Mar 15, 2025')
  })

  it('accepts a string date and formats it', () => {
    // Passing a string that the Date constructor can parse
    const result = formatDate('2025-06-01')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('accepts custom Intl.DateTimeFormatOptions', () => {
    const d = new Date(2025, 0, 5) // Jan 5, 2025
    const result = formatDate(d, { month: 'long', year: 'numeric' })
    expect(result).toContain('January')
    expect(result).toContain('2025')
  })

  it('does NOT return "Today" or "Yesterday" for recent dates', () => {
    const today = new Date()
    const result = formatDate(today)
    expect(result).not.toBe('Today')
    expect(result).not.toBe('Yesterday')
  })
})

describe('getMonthRange', () => {
  it('returns start as the first day of the given month', () => {
    const { start } = getMonthRange(2025, 3)
    expect(start.getFullYear()).toBe(2025)
    expect(start.getMonth()).toBe(2) // March = index 2
    expect(start.getDate()).toBe(1)
  })

  it('returns end as the last day of the given month at 23:59:59', () => {
    const { end } = getMonthRange(2025, 3)
    expect(end.getFullYear()).toBe(2025)
    expect(end.getMonth()).toBe(2)
    expect(end.getDate()).toBe(31)
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
  })

  it('handles February in a non-leap year (28 days)', () => {
    const { end } = getMonthRange(2025, 2)
    expect(end.getDate()).toBe(28)
  })

  it('handles February in a leap year (29 days)', () => {
    const { end } = getMonthRange(2024, 2)
    expect(end.getDate()).toBe(29)
  })
})

describe('parseISO', () => {
  it('parses a YYYY-MM-DD string to a local Date', () => {
    const d = parseISO('2025-03-15')
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(2) // March = index 2
    expect(d.getDate()).toBe(15)
  })

  it('parses the first day of a year correctly', () => {
    const d = parseISO('2024-01-01')
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(1)
  })

  it('parses the last day of a year correctly', () => {
    const d = parseISO('2024-12-31')
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(11)
    expect(d.getDate()).toBe(31)
  })
})

describe('formatISO', () => {
  it('formats a Date to YYYY-MM-DD', () => {
    expect(formatISO(new Date(2025, 2, 15))).toBe('2025-03-15')
  })

  it('pads single-digit month and day with a leading zero', () => {
    expect(formatISO(new Date(2025, 0, 5))).toBe('2025-01-05')
  })

  it('round-trips with parseISO', () => {
    const original = '2025-07-04'
    expect(formatISO(parseISO(original))).toBe(original)
  })
})

describe('pad', () => {
  it('pads a single-digit number with a leading zero', () => {
    expect(pad(5)).toBe('05')
  })

  it('does not pad a two-digit number', () => {
    expect(pad(12)).toBe('12')
  })

  it('pads 0 to "00"', () => {
    expect(pad(0)).toBe('00')
  })
})

describe('getWeekNumber', () => {
  it('returns week 1 for January 1, 2024 (a Monday)', () => {
    // Jan 1 2024 is a Monday, so it is in ISO week 1
    expect(getWeekNumber(new Date(2024, 0, 1))).toBe(1)
  })

  it('returns the correct week number for a mid-year date', () => {
    // July 4 2025 falls in ISO week 27
    expect(getWeekNumber(new Date(2025, 6, 4))).toBe(27)
  })

  it('returns week 53 for December 28, 2020 (a date in the last ISO week)', () => {
    // Dec 28 2020 is in ISO week 53
    expect(getWeekNumber(new Date(2020, 11, 28))).toBe(53)
  })

  it('returns a number between 1 and 53', () => {
    const wn = getWeekNumber(new Date(2025, 5, 15))
    expect(wn).toBeGreaterThanOrEqual(1)
    expect(wn).toBeLessThanOrEqual(53)
  })
})

describe('txnInitials', () => {
  it('returns two initials from the first two words of the note', () => {
    expect(txnInitials('Coffee Shop', '')).toBe('CS')
  })

  it('falls back to the category name when note is empty', () => {
    expect(txnInitials('', 'Salary Bonus')).toBe('SB')
  })

  it('returns the first two characters when the source is a single word', () => {
    expect(txnInitials('Food', '')).toBe('FO')
  })

  it('returns uppercase initials', () => {
    expect(txnInitials('coffee shop', '')).toBe('CS')
  })

  it('returns "??" when both note and category are empty strings', () => {
    expect(txnInitials('', '')).toBe('??')
  })

  it('handles extra whitespace between words', () => {
    expect(txnInitials('grocery   store', '')).toBe('GS')
  })
})
