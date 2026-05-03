import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { taskDueInfo } from '@/modules/tasks/hooks/useTasks'

describe('taskDueInfo – edge cases', () => {
  // Pin "today" to 2026-05-03 so tests are deterministic
  const TODAY = new Date(2026, 4, 3) // May 3 2026 (month is 0-indexed)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('past date "2020-01-01" returns klass "due-overdue" with negative days', () => {
    const result = taskDueInfo('2020-01-01')
    expect(result.klass).toBe('due-overdue')
    expect(result.days).not.toBeNull()
    expect(result.days!).toBeLessThan(0)
  })

  it('"2020-01-01" label starts with "Overdue"', () => {
    const result = taskDueInfo('2020-01-01')
    expect(result.label).toMatch(/^Overdue/)
  })

  it('null returns days = null and empty klass', () => {
    const result = taskDueInfo(null)
    expect(result.days).toBeNull()
    expect(result.klass).toBe('')
  })

  it('far future date (year 2099) returns klass "" (empty)', () => {
    const result = taskDueInfo('2099-12-31')
    expect(result.klass).toBe('')
  })

  it('far future label contains a month name abbreviation', () => {
    const result = taskDueInfo('2099-06-15')
    // Expected label format: "Jun 15"
    const monthAbbreviations = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const hasMonth = monthAbbreviations.some(m => result.label.includes(m))
    expect(hasMonth).toBe(true)
  })
})
