import { describe, it, expect } from 'vitest'
import { sumAmount, monthStats, prevYM, nextYM, last6Months } from '@/modules/finance/hooks/useFinanceData'
import {
  createTransaction,
  createPendingTransaction,
  createIncomeTransaction,
} from '@/tests/factories'

describe('sumAmount', () => {
  it('returns 0 for an empty array', () => {
    expect(sumAmount([])).toBe(0)
  })

  it('sums a single transaction amount', () => {
    const txns = [createTransaction({ amount: 500 })]
    expect(sumAmount(txns)).toBe(500)
  })

  it('sums multiple transaction amounts correctly', () => {
    const txns = [
      createTransaction({ amount: 1000 }),
      createTransaction({ amount: 2500 }),
      createTransaction({ amount: 750 }),
    ]
    expect(sumAmount(txns)).toBe(4250)
  })

  it('handles large amounts (integer cents)', () => {
    const txns = [
      createIncomeTransaction({ amount: 275000 }),
      createIncomeTransaction({ amount: 125000 }),
    ]
    expect(sumAmount(txns)).toBe(400000)
  })
})

describe('monthStats', () => {
  it('returns zeros for an empty array', () => {
    expect(monthStats([])).toEqual({ income: 0, expense: 0, net: 0 })
  })

  it('sums income correctly from CONFIRMED income transactions', () => {
    const txns = [
      createIncomeTransaction({ amount: 100000 }),
      createIncomeTransaction({ amount: 50000 }),
    ]
    const { income } = monthStats(txns)
    expect(income).toBe(150000)
  })

  it('sums expenses correctly from CONFIRMED expense transactions', () => {
    const txns = [
      createTransaction({ type: 'EXPENSE', amount: 3000 }),
      createTransaction({ type: 'EXPENSE', amount: 7000 }),
    ]
    const { expense } = monthStats(txns)
    expect(expense).toBe(10000)
  })

  it('excludes PENDING transactions from income total', () => {
    const txns = [
      createIncomeTransaction({ amount: 10000, status: 'CONFIRMED' }),
      createPendingTransaction({ type: 'INCOME', amount: 5000 }),
    ]
    const { income } = monthStats(txns)
    expect(income).toBe(10000)
  })

  it('excludes PENDING transactions from expense total', () => {
    const txns = [
      createTransaction({ type: 'EXPENSE', amount: 2000, status: 'CONFIRMED' }),
      createPendingTransaction({ type: 'EXPENSE', amount: 9999 }),
    ]
    const { expense } = monthStats(txns)
    expect(expense).toBe(2000)
  })

  it('net equals income minus expense', () => {
    const txns = [
      createIncomeTransaction({ amount: 100000, status: 'CONFIRMED' }),
      createTransaction({ type: 'EXPENSE', amount: 30000, status: 'CONFIRMED' }),
    ]
    const { income, expense, net } = monthStats(txns)
    expect(net).toBe(income - expense)
    expect(net).toBe(70000)
  })

  it('returns negative net when expenses exceed income', () => {
    const txns = [
      createIncomeTransaction({ amount: 5000, status: 'CONFIRMED' }),
      createTransaction({ type: 'EXPENSE', amount: 12000, status: 'CONFIRMED' }),
    ]
    const { net } = monthStats(txns)
    expect(net).toBe(-7000)
  })
})

describe('prevYM', () => {
  it('returns previous month for a standard case', () => {
    expect(prevYM('2025-03')).toBe('2025-02')
  })

  it('crosses year boundary from January to December of previous year', () => {
    expect(prevYM('2025-01')).toBe('2024-12')
  })

  it('handles mid-year month correctly', () => {
    expect(prevYM('2025-07')).toBe('2025-06')
  })

  it('returns December of previous year when given 2026-01', () => {
    expect(prevYM('2026-01')).toBe('2025-12')
  })
})

describe('nextYM', () => {
  it('returns next month for a standard case', () => {
    expect(nextYM('2025-03')).toBe('2025-04')
  })

  it('crosses year boundary from December to January of next year', () => {
    expect(nextYM('2025-12')).toBe('2026-01')
  })

  it('handles mid-year month correctly', () => {
    expect(nextYM('2025-06')).toBe('2025-07')
  })

  it('returns January of next year when given end of year', () => {
    expect(nextYM('2024-12')).toBe('2025-01')
  })
})

describe('last6Months', () => {
  it('returns exactly 6 months', () => {
    expect(last6Months('2025-04')).toHaveLength(6)
  })

  it('last entry equals the input month', () => {
    const result = last6Months('2025-04')
    expect(result[result.length - 1]).toBe('2025-04')
  })

  it('months are in ascending chronological order', () => {
    const result = last6Months('2025-04')
    for (let i = 1; i < result.length; i++) {
      expect(result[i] > result[i - 1]).toBe(true)
    }
  })

  it('correctly spans a year boundary', () => {
    const result = last6Months('2025-02')
    expect(result[0]).toBe('2024-09')
    expect(result[result.length - 1]).toBe('2025-02')
  })

  it('first entry is 5 months before the input month', () => {
    const result = last6Months('2025-06')
    expect(result[0]).toBe('2025-01')
  })
})
