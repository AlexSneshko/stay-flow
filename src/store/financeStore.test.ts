import { describe, it, expect, beforeEach } from 'vitest'
import { useFinanceStore } from '@/store/financeStore'

function currentYM(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

beforeEach(() => {
  useFinanceStore.setState({ activeMonth: currentYM() })
})

describe('useFinanceStore', () => {
  it('defaults activeMonth to the current YYYY-MM', () => {
    const { activeMonth } = useFinanceStore.getState()
    expect(activeMonth).toBe(currentYM())
  })

  it('setActiveMonth updates the activeMonth correctly', () => {
    useFinanceStore.getState().setActiveMonth('2025-07')
    expect(useFinanceStore.getState().activeMonth).toBe('2025-07')
  })

  it('prevMonth moves from 2025-03 to 2025-02', () => {
    useFinanceStore.setState({ activeMonth: '2025-03' })
    useFinanceStore.getState().prevMonth()
    expect(useFinanceStore.getState().activeMonth).toBe('2025-02')
  })

  it('prevMonth wraps from January (2025-01) to previous December (2024-12)', () => {
    useFinanceStore.setState({ activeMonth: '2025-01' })
    useFinanceStore.getState().prevMonth()
    expect(useFinanceStore.getState().activeMonth).toBe('2024-12')
  })

  it('nextMonth moves from 2025-03 to 2025-04', () => {
    useFinanceStore.setState({ activeMonth: '2025-03' })
    useFinanceStore.getState().nextMonth()
    expect(useFinanceStore.getState().activeMonth).toBe('2025-04')
  })

  it('nextMonth wraps from December (2025-12) to next January (2026-01)', () => {
    useFinanceStore.setState({ activeMonth: '2025-12' })
    useFinanceStore.getState().nextMonth()
    expect(useFinanceStore.getState().activeMonth).toBe('2026-01')
  })

  it('activeMonth format is always YYYY-MM after navigation', () => {
    useFinanceStore.setState({ activeMonth: '2025-06' })
    useFinanceStore.getState().nextMonth()
    expect(useFinanceStore.getState().activeMonth).toMatch(/^\d{4}-\d{2}$/)
  })
})
