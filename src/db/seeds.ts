import { db } from './dexie'
import type { DTransactionCategory, DTaskCategory } from './dexie'

const DEFAULT_CATEGORIES: Omit<DTransactionCategory, 'id'>[] = [
  { remoteId: null, slug: 'food',          userId: null, name: 'Food',          icon: '🍕', color: '#e8a44a', type: 'EXPENSE', isDefault: true, order: 1 },
  { remoteId: null, slug: 'transport',     userId: null, name: 'Transport',     icon: '🚗', color: '#5b8def', type: 'EXPENSE', isDefault: true, order: 2 },
  { remoteId: null, slug: 'housing',       userId: null, name: 'Housing',       icon: '🏠', color: '#2f9d8a', type: 'EXPENSE', isDefault: true, order: 3 },
  { remoteId: null, slug: 'health',        userId: null, name: 'Health',        icon: '💊', color: '#47a373', type: 'EXPENSE', isDefault: true, order: 4 },
  { remoteId: null, slug: 'leisure',       userId: null, name: 'Leisure',       icon: '🎬', color: '#c7943e', type: 'EXPENSE', isDefault: true, order: 5 },
  { remoteId: null, slug: 'shopping',      userId: null, name: 'Shopping',      icon: '🛍', color: '#c73e3e', type: 'EXPENSE', isDefault: true, order: 6 },
  { remoteId: null, slug: 'subscriptions', userId: null, name: 'Subscriptions', icon: '📱', color: '#8a6bc8', type: 'EXPENSE', isDefault: true, order: 7 },
  { remoteId: null, slug: 'other-expense', userId: null, name: 'Other',         icon: '🔧', color: '#6b6a63', type: 'EXPENSE', isDefault: true, order: 8 },
  { remoteId: null, slug: 'salary',        userId: null, name: 'Salary',        icon: '💼', color: '#0f8f5a', type: 'INCOME',  isDefault: true, order: 9 },
  { remoteId: null, slug: 'freelance',     userId: null, name: 'Freelance',     icon: '💻', color: '#42a5f5', type: 'INCOME',  isDefault: true, order: 10 },
  { remoteId: null, slug: 'interest',      userId: null, name: 'Interest',      icon: '📈', color: '#ec407a', type: 'INCOME',  isDefault: true, order: 11 },
  { remoteId: null, slug: 'other-income',  userId: null, name: 'Other Income',  icon: '💰', color: '#8d6e63', type: 'INCOME',  isDefault: true, order: 12 },
  { remoteId: null, slug: 'pets',          userId: null, name: 'Pets',          icon: '🐾', color: '#47a373', type: 'BOTH',    isDefault: true, order: 13 },
]

export async function seedDefaultCategories(): Promise<void> {
  const existing = await db.categories.filter((c) => c.isDefault).count()
  if (existing > 0) return
  await db.categories.bulkAdd(DEFAULT_CATEGORIES)
}

const DEFAULT_TASK_CATEGORIES: Omit<DTaskCategory, 'id'>[] = [
  { slug: 'home',     userId: null, name: 'Home',     icon: '🏠', color: '#5b8def', isDefault: true, order: 1 },
  { slug: 'pet',      userId: null, name: 'Pet',      icon: '🐾', color: '#47a373', isDefault: true, order: 2 },
  { slug: 'shopping', userId: null, name: 'Shopping', icon: '🛍', color: '#e8a44a', isDefault: true, order: 3 },
  { slug: 'work',     userId: null, name: 'Work',     icon: '💼', color: '#8a6bc8', isDefault: true, order: 4 },
  { slug: 'personal', userId: null, name: 'Personal', icon: '👤', color: '#c7943e', isDefault: true, order: 5 },
]

export async function seedDefaultTaskCategories(): Promise<void> {
  const existing = await db.taskCategories.filter((c) => c.isDefault).count()
  if (existing > 0) return
  await db.taskCategories.bulkAdd(DEFAULT_TASK_CATEGORIES)
}
