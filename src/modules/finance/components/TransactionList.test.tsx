import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TxnRow } from './TransactionList'
import {
  createTransaction,
  createPendingTransaction,
  createIncomeTransaction,
  createCategory,
} from '@/tests/factories'
import { formatCurrency } from '@/lib/utils'

const salaryCategory = createCategory({
  slug: 'salary',
  name: 'Salary',
  type: 'INCOME',
  color: '#4caf50',
})

const foodCategory = createCategory({
  slug: 'food',
  name: 'Food',
  type: 'EXPENSE',
  color: '#f7971e',
})

const baseCategories = [salaryCategory, foodCategory]

const noop = () => undefined

// ---------------------------------------------------------------------------
// TxnRow
// ---------------------------------------------------------------------------

describe('TxnRow', () => {
  it('renders transaction category name when note is empty', () => {
    const txn = createTransaction({ note: '', categorySlug: 'food' })
    render(
      <TxnRow
        txn={txn}
        categories={baseCategories}
        currency="USD"
        onEdit={noop}
        onConfirm={noop}
      />
    )
    // The sf-txn-name div shows note || cat.name
    const nameEl = screen.getByText('Food')
    expect(nameEl).toBeInTheDocument()
  })

  it('renders transaction note when note is set', () => {
    const txn = createTransaction({ note: 'Lunch with team', categorySlug: 'food' })
    render(
      <TxnRow
        txn={txn}
        categories={baseCategories}
        currency="USD"
        onEdit={noop}
        onConfirm={noop}
      />
    )
    expect(screen.getByText('Lunch with team')).toBeInTheDocument()
  })

  it('shows "pending" text for PENDING transactions', () => {
    const txn = createPendingTransaction({ categorySlug: 'food' })
    render(
      <TxnRow
        txn={txn}
        categories={baseCategories}
        currency="USD"
        onEdit={noop}
        onConfirm={noop}
      />
    )
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('shows income amount with "+" sign for INCOME type', () => {
    const txn = createIncomeTransaction({ categorySlug: 'salary', amount: 275000 })
    render(
      <TxnRow
        txn={txn}
        categories={baseCategories}
        currency="USD"
        onEdit={noop}
        onConfirm={noop}
      />
    )
    const expected = `+${formatCurrency(275000, 'USD')}`
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('shows expense amount with "−" sign for EXPENSE type', () => {
    const txn = createTransaction({ type: 'EXPENSE', amount: 1250, categorySlug: 'food' })
    render(
      <TxnRow
        txn={txn}
        categories={baseCategories}
        currency="USD"
        onEdit={noop}
        onConfirm={noop}
      />
    )
    // U+2212 MINUS SIGN as used in TxnRow
    const expected = `\u2212${formatCurrency(1250, 'USD')}`
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('calls onEdit when the row is clicked', () => {
    const txn = createTransaction({ categorySlug: 'food' })
    const onEdit = vi.fn()
    render(
      <TxnRow
        txn={txn}
        categories={baseCategories}
        currency="USD"
        onEdit={onEdit}
        onConfirm={noop}
      />
    )
    fireEvent.click(screen.getByText('Food').closest('.sf-txn-row')!)
    expect(onEdit).toHaveBeenCalledWith(txn)
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when confirm button is clicked on PENDING tx and does NOT call onEdit', () => {
    const txn = createPendingTransaction({ categorySlug: 'food' })
    const onEdit = vi.fn()
    const onConfirm = vi.fn()
    render(
      <TxnRow
        txn={txn}
        categories={baseCategories}
        currency="USD"
        onEdit={onEdit}
        onConfirm={onConfirm}
      />
    )
    const confirmBtn = screen.getByTitle('Confirm')
    fireEvent.click(confirmBtn)
    expect(onConfirm).toHaveBeenCalledWith(txn.id)
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('does not show the confirm button for CONFIRMED transactions', () => {
    const txn = createTransaction({ status: 'CONFIRMED', categorySlug: 'food' })
    render(
      <TxnRow
        txn={txn}
        categories={baseCategories}
        currency="USD"
        onEdit={noop}
        onConfirm={noop}
      />
    )
    expect(screen.queryByTitle('Confirm')).not.toBeInTheDocument()
  })

  it('shows formatted amount using formatCurrency', () => {
    const txn = createTransaction({ type: 'EXPENSE', amount: 4800, currency: 'USD', categorySlug: 'food' })
    render(
      <TxnRow
        txn={txn}
        categories={baseCategories}
        currency="USD"
        onEdit={noop}
        onConfirm={noop}
      />
    )
    // formatCurrency(4800, 'USD') → '$48.00'
    const formattedAmount = formatCurrency(4800, 'USD')
    expect(screen.getByText(`\u2212${formattedAmount}`)).toBeInTheDocument()
  })
})
