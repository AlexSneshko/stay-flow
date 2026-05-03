import type { DTransaction, DRecurringTransaction, DTransactionCategory, DTask, DTaskCategory } from '@/db/dexie'

let idCounter = 1
export const nextId = () => idCounter++
export const resetIdCounter = () => { idCounter = 1 }

export const createTransaction = (overrides?: Partial<DTransaction>): DTransaction => ({
  id: nextId(),
  remoteId: null,
  userId: 'user-1',
  amount: 1250,
  type: 'EXPENSE',
  categorySlug: 'food',
  currency: 'USD',
  note: '',
  date: '2025-04-10',
  status: 'CONFIRMED',
  recurringId: null,
  createdAt: new Date('2025-04-10').toISOString(),
  _dirty: true,
  ...overrides,
})

export const createRecurring = (overrides?: Partial<DRecurringTransaction>): DRecurringTransaction => ({
  id: nextId(),
  remoteId: null,
  userId: 'user-1',
  title: 'Netflix',
  amount: 1599,
  type: 'EXPENSE',
  categorySlug: 'subscriptions',
  currency: 'USD',
  frequency: 'MONTHLY',
  dayOfMonth: 15,
  dayOfWeek: null,
  nextDueDate: '2025-05-15',
  active: true,
  createdAt: new Date('2025-01-01').toISOString(),
  _dirty: true,
  ...overrides,
})

export const createCategory = (overrides?: Partial<DTransactionCategory>): DTransactionCategory => ({
  id: nextId(),
  remoteId: null,
  slug: 'food',
  userId: null,
  name: 'Food',
  icon: '🍕',
  color: '#f7971e',
  type: 'EXPENSE',
  isDefault: true,
  order: 1,
  ...overrides,
})

export const createTask = (overrides?: Partial<DTask>): DTask => ({
  id: nextId(),
  remoteId: null,
  userId: 'user-1',
  title: 'Buy groceries',
  notes: null,
  dueDate: '2025-04-10',
  priority: 'MEDIUM',
  linkedCategory: null,
  isPinned: false,
  timeFrom: null,
  timeTo: null,
  completed: false,
  completedAt: null,
  pinHistory: {},
  amount: null,
  createdAt: new Date('2025-04-10'),
  _dirty: true,
  ...overrides,
})

export const createTaskCategory = (overrides?: Partial<DTaskCategory>): DTaskCategory => ({
  id: nextId(),
  slug: 'home',
  userId: null,
  name: 'Home',
  icon: '🏠',
  color: '#5b8def',
  isDefault: true,
  order: 1,
  ...overrides,
})

export const createPendingTransaction = (overrides?: Partial<DTransaction>) =>
  createTransaction({ status: 'PENDING', recurringId: 'rec-1', ...overrides })

export const createIncomeTransaction = (overrides?: Partial<DTransaction>) =>
  createTransaction({ type: 'INCOME', categorySlug: 'salary', amount: 275000, ...overrides })

export const createMonthTransactions = (year: number, month: number): DTransaction[] => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const d = (day: number) => `${year}-${pad(month)}-${pad(day)}`
  return [
    createIncomeTransaction({ date: d(3), amount: 275000 }),
    createTransaction({ date: d(4), amount: 999, categorySlug: 'subscriptions' }),
    createTransaction({ date: d(7), amount: 7245, categorySlug: 'food' }),
    createTransaction({ date: d(10), amount: 4800, categorySlug: 'transport' }),
    createPendingTransaction({ date: d(15), amount: 1599 }),
  ]
}
