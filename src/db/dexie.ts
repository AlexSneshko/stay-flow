import Dexie, { type Table } from 'dexie'

export interface DTransaction {
  id?: number
  remoteId: string | null
  userId: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  currency: string
  note: string
  date: Date
  status: 'CONFIRMED' | 'PENDING'
  recurringId: string | null
  createdAt: Date
  updatedAt: Date
  _dirty: boolean
}

export interface DRecurringTransaction {
  id?: number
  remoteId: string | null
  userId: string
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  currency: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  dayOfMonth: number | null
  dayOfWeek: number | null
  nextDueDate: Date
  active: boolean
  createdAt: Date
  _dirty: boolean
}

export interface DTransactionCategory {
  id?: number
  remoteId: string | null
  slug: string
  userId: string | null
  name: string
  icon: string
  color: string
  type: 'INCOME' | 'EXPENSE' | 'BOTH'
  isDefault: boolean
  order: number
}

export interface DTask {
  id?: number
  remoteId: string | null
  userId: string
  title: string
  _dirty: boolean
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
  notes!: Table<DNote>
  habits!: Table<DHabit>

  constructor() {
    super('stayflow-v1')
    this.version(1).stores({
      transactions:
        '++id, remoteId, userId, type, category, date, status, recurringId, _dirty',
      recurringTransactions:
        '++id, remoteId, userId, type, frequency, nextDueDate, active, _dirty',
      categories:
        '++id, slug, userId, type, isDefault, order',
      tasks:   '++id, remoteId, userId, _dirty',
      notes:   '++id, remoteId, userId, _dirty',
      habits:  '++id, remoteId, userId, _dirty',
    })
  }
}

export const db = new StayFlowDatabase()
