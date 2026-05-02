import Dexie, { type Table } from 'dexie'

export interface DTransaction {
  id?: number
  remoteId: string | null
  userId: string
  amount: number        // positive integer in cents
  type: 'INCOME' | 'EXPENSE'
  categorySlug: string  // references DTransactionCategory.slug
  currency: string      // ISO 4217
  note: string
  date: string          // YYYY-MM-DD
  status: 'CONFIRMED' | 'PENDING'
  recurringId: string | null
  createdAt: string     // ISO datetime
  _dirty: boolean
}

export interface DRecurringTransaction {
  id?: number
  remoteId: string | null
  userId: string
  title: string
  amount: number        // positive integer in cents
  type: 'INCOME' | 'EXPENSE'
  categorySlug: string  // references DTransactionCategory.slug
  currency: string      // ISO 4217
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  dayOfMonth: number | null   // 1-31 for MONTHLY
  dayOfWeek: number | null    // 0-6 for WEEKLY
  nextDueDate: string         // YYYY-MM-DD
  active: boolean
  createdAt: string
  _dirty: boolean
}

export interface DTransactionCategory {
  id?: number
  remoteId: string | null
  slug: string
  userId: string | null   // null = system default
  name: string
  icon: string            // emoji
  color: string           // hex
  type: 'INCOME' | 'EXPENSE' | 'BOTH'
  isDefault: boolean
  order: number
}

export interface DTask {
  id?: number
  remoteId: string | null
  userId: string
  title: string
  notes: string | null
  dueDate: string | null           // YYYY-MM-DD
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  linkedCategory: string | null    // task category slug
  isPinned: boolean
  timeFrom: string | null          // "09:00"
  timeTo: string | null            // "10:00"
  completed: boolean
  completedAt: string | null       // ISO datetime
  pinHistory: Record<string, boolean>  // { "2024-01-15": true }
  amount: number | null            // tracked amount in cents
  createdAt: Date
  _dirty: boolean
}

export interface DTaskCategory {
  id?: number
  slug: string
  userId: string | null   // null = system default
  name: string
  icon: string
  color: string
  isDefault: boolean
  order: number
}

export interface DNote {
  id?: number
  remoteId: string | null
  userId: string
  title: string
  _dirty: boolean
}

export interface DHabit {
  id?: number
  remoteId: string | null
  userId: string
  name: string
  _dirty: boolean
}

export class StayFlowDatabase extends Dexie {
  transactions!: Table<DTransaction>
  recurringTransactions!: Table<DRecurringTransaction>
  categories!: Table<DTransactionCategory>
  tasks!: Table<DTask>
  taskCategories!: Table<DTaskCategory>
  notes!: Table<DNote>
  habits!: Table<DHabit>

  constructor() {
    super('stayflow-v1')
    this.version(2).stores({
      transactions:
        '++id, remoteId, userId, type, categorySlug, date, status, recurringId, _dirty',
      recurringTransactions:
        '++id, remoteId, userId, type, categorySlug, frequency, nextDueDate, active, _dirty',
      categories:
        '++id, slug, userId, type, isDefault, order',
      tasks:
        '++id, remoteId, userId, priority, linkedCategory, isPinned, dueDate, completed, _dirty',
      taskCategories:
        '++id, slug, userId, isDefault, order',
      notes:   '++id, remoteId, userId, _dirty',
      habits:  '++id, remoteId, userId, _dirty',
    })
  }
}

export const db = new StayFlowDatabase()
