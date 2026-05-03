import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import { seedDefaultCategories } from '@/db/seeds'
import { monthStats } from '@/modules/finance/hooks/useFinanceData'
import {
  createTransaction,
  createIncomeTransaction,
  createPendingTransaction,
} from '@/tests/factories'
import { format } from 'date-fns'

const currentYM = format(new Date(), 'yyyy-MM')

beforeEach(async () => {
  await db.transactions.clear()
  await db.categories.clear()
  await db.recurringTransactions.clear()
})

describe('finance-flow integration', () => {
  it('add transaction → appears in list', async () => {
    const txn = createTransaction({ date: `${currentYM}-10` })
    await db.transactions.put(txn)
    const all = await db.transactions.toArray()
    expect(all).toHaveLength(1)
    expect(all[0].amount).toBe(txn.amount)
  })

  it('PENDING excluded from monthStats', async () => {
    const confirmedIncome = createIncomeTransaction({ date: `${currentYM}-05`, amount: 10000, status: 'CONFIRMED' })
    const pendingExpense = createPendingTransaction({ date: `${currentYM}-10`, amount: 5000, type: 'EXPENSE' })
    await db.transactions.put(confirmedIncome)
    await db.transactions.put(pendingExpense)

    const all = await db.transactions.toArray()
    const stats = monthStats(all)

    expect(stats.income).toBe(10000)
    expect(stats.expense).toBe(0)
  })

  it('confirm pending → changes status', async () => {
    const pending = createPendingTransaction({ date: `${currentYM}-15` })
    const addedId = await db.transactions.put(pending)

    await db.transactions.update(addedId, { status: 'CONFIRMED' })

    const updated = await db.transactions.get(addedId)
    expect(updated).toBeDefined()
    expect(updated!.status).toBe('CONFIRMED')
  })

  it('add recurring then add pending linked to it', async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const recurringId = await db.recurringTransactions.put({
      id: 100,
      remoteId: null,
      userId: 'user-1',
      title: 'Monthly Rent',
      amount: 120000,
      type: 'EXPENSE',
      categorySlug: 'housing',
      currency: 'USD',
      frequency: 'MONTHLY',
      dayOfMonth: new Date().getDate(),
      dayOfWeek: null,
      nextDueDate: today,
      active: true,
      createdAt: new Date().toISOString(),
      _dirty: true,
    })
    const recurring = await db.recurringTransactions.get(recurringId)
    expect(recurring).toBeDefined()
    expect(recurring!.nextDueDate).toBe(today)

    const pendingTx = createPendingTransaction({ date: today, recurringId: String(recurringId), amount: 120000, categorySlug: 'housing' })
    await db.transactions.put(pendingTx)
    const fetched = await db.transactions.get(pendingTx.id!)
    expect(fetched).toBeDefined()
    expect(fetched!.status).toBe('PENDING')
    expect(fetched!.recurringId).toBe(String(recurringId))
  })

  it('delete transaction → count should be 0', async () => {
    const txn = createTransaction()
    await db.transactions.put(txn)
    await db.transactions.delete(txn.id!)
    const count = await db.transactions.count()
    expect(count).toBe(0)
  })

  it('seedDefaultCategories seeds exactly 13 categories on first call', async () => {
    await seedDefaultCategories()
    const count = await db.categories.count()
    expect(count).toBe(13)
  })

  it('seedDefaultCategories — all 13 slugs are present after seeding', async () => {
    await seedDefaultCategories()
    const categories = await db.categories.toArray()
    const slugs = categories.map(c => c.slug)
    expect(slugs).toContain('food')
    expect(slugs).toContain('salary')
    expect(slugs).toContain('pets')
    expect(categories).toHaveLength(13)
  })
})
