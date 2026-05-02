import { useLiveQuery } from 'dexie-react-hooks'
import { db, type DTransaction } from '@/db/dexie'

export function useMonthTransactions(ym: string) {
  return useLiveQuery(
    () => db.transactions.where('date').startsWith(ym).toArray().then(rows =>
      rows.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    ),
    [ym],
    [] as DTransaction[]
  )
}

export function useAllTransactions() {
  return useLiveQuery(() => db.transactions.toArray(), [], [] as DTransaction[])
}

export function useTransactionCategories() {
  return useLiveQuery(
    () => db.categories.orderBy('order').toArray(),
    [],
    []
  )
}

export function useRecurringTransactions() {
  return useLiveQuery(() => db.recurringTransactions.toArray(), [], [])
}

export function sumAmount(txns: DTransaction[]): number {
  return txns.reduce((s, t) => s + t.amount, 0)
}

export function monthStats(txns: DTransaction[]) {
  const confirmed = txns.filter(t => t.status === 'CONFIRMED')
  const income  = sumAmount(confirmed.filter(t => t.type === 'INCOME'))
  const expense = sumAmount(confirmed.filter(t => t.type === 'EXPENSE'))
  return { income, expense, net: income - expense }
}

export function prevYM(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function nextYM(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function last6Months(ym: string): string[] {
  const [y, m] = ym.split('-').map(Number)
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}
