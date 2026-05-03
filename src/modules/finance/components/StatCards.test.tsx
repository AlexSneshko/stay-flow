import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatCard, FinanceStatRow } from './StatCards'
import { formatCurrency } from '@/lib/utils'

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

describe('StatCard', () => {
  it('renders label text', () => {
    render(<StatCard label="Income" value="$100.00" trend="▲ 10% vs last month" />)
    expect(screen.getByText('Income')).toBeInTheDocument()
  })

  it('renders value text', () => {
    render(<StatCard label="Income" value="$100.00" trend="▲ 10% vs last month" />)
    expect(screen.getByText('$100.00')).toBeInTheDocument()
  })

  it('renders trend text', () => {
    render(<StatCard label="Income" value="$100.00" trend="▲ 10% vs last month" />)
    expect(screen.getByText('▲ 10% vs last month')).toBeInTheDocument()
  })

  it('applies valueColor as inline style when provided', () => {
    render(<StatCard label="Income" value="$100.00" trend="neutral" valueColor="var(--income)" />)
    const valueEl = screen.getByText('$100.00')
    expect(valueEl).toHaveStyle({ color: 'var(--income)' })
  })

  it('does not apply inline color style when valueColor is omitted', () => {
    render(<StatCard label="Income" value="$100.00" trend="neutral" />)
    const valueEl = screen.getByText('$100.00')
    // style attribute should be absent or empty — no color property set
    expect(valueEl).not.toHaveStyle({ color: 'var(--income)' })
    expect(valueEl.getAttribute('style')).toBeFalsy()
  })
})

// ---------------------------------------------------------------------------
// FinanceStatRow
// ---------------------------------------------------------------------------

const defaultProps = {
  income: 275000,
  expense: 50000,
  net: 225000,
  incomePct: 10,
  expensePct: 5,
  currency: 'USD',
  formatFn: formatCurrency,
  bestMonthLabel: 'Best month: Jan',
}

describe('FinanceStatRow', () => {
  it('renders Income, Expenses and Net cards (3 cards visible)', () => {
    render(<FinanceStatRow {...defaultProps} />)
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Expenses')).toBeInTheDocument()
    expect(screen.getByText('Net')).toBeInTheDocument()
  })

  it('formats income value using formatFn', () => {
    render(<FinanceStatRow {...defaultProps} />)
    const expected = formatCurrency(defaultProps.income, defaultProps.currency)
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('shows green color (var(--income)) on the Net value for positive net', () => {
    render(<FinanceStatRow {...defaultProps} net={225000} />)
    // Net value is prefixed with '+'
    const netValue = screen.getByText(
      `+${formatCurrency(225000, defaultProps.currency)}`
    )
    expect(netValue).toHaveStyle({ color: 'var(--income)' })
  })

  it('shows red color (var(--expense)) on the Net value for negative net', () => {
    render(<FinanceStatRow {...defaultProps} net={-5000} />)
    const netValue = screen.getByText(
      `\u2212${formatCurrency(5000, defaultProps.currency)}`
    )
    expect(netValue).toHaveStyle({ color: 'var(--expense)' })
  })

  it('applies trend direction class "up" for positive income trend', () => {
    render(<FinanceStatRow {...defaultProps} incomePct={10} />)
    // The trend element for income is the one showing "▲ 10% vs last month"
    const trendEl = screen.getByText('▲ 10% vs last month')
    expect(trendEl).toHaveClass('up')
  })

  it('applies trend direction class "dn" for positive expensePct (higher expense = bad)', () => {
    render(<FinanceStatRow {...defaultProps} expensePct={8} />)
    const trendEl = screen.getByText('▲ 8% vs last month')
    expect(trendEl).toHaveClass('dn')
  })

  it('shows bestMonthLabel in the Net card trend', () => {
    render(<FinanceStatRow {...defaultProps} bestMonthLabel="Best month: Mar" />)
    expect(screen.getByText('Best month: Mar')).toBeInTheDocument()
  })
})
