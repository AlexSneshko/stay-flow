import { db } from './dexie'
import type { DTransactionCategory, DTaskCategory } from './dexie'

const DEFAULT_CATEGORIES: Omit<DTransactionCategory, 'id'>[] = [
  { remoteId: null, slug: 'food',          userId: null, name: 'Food',          icon: '🍕', color: '#f7971e', type: 'EXPENSE', isDefault: true, order: 1 },
  { remoteId: null, slug: 'transport',     userId: null, name: 'Transport',     icon: '🚗', color: '#6c63ff', type: 'EXPENSE', isDefault: true, order: 2 },
  { remoteId: null, slug: 'housing',       userId: null, name: 'Housing',       icon: '🏠', color: '#43e97b', type: 'EXPENSE', isDefault: true, order: 3 },
  { remoteId: null, slug: 'health',        userId: null, name: 'Health',        icon: '💊', color: '#ff6584', type: 'EXPENSE', isDefault: true, order: 4 },
  { remoteId: null, slug: 'entertainment', userId: null, name: 'Entertainment', icon: '🎬', color: '#4fc3f7', type: 'EXPENSE', isDefault: true, order: 5 },
  { remoteId: null, slug: 'shopping',      userId: null, name: 'Shopping',      icon: '🛍', color: '#ab47bc', type: 'EXPENSE', isDefault: true, order: 6 },
  { remoteId: null, slug: 'education',     userId: null, name: 'Education',     icon: '📚', color: '#26a69a', type: 'EXPENSE', isDefault: true, order: 7 },
  { remoteId: null, slug: 'subscriptions', userId: null, name: 'Subscriptions', icon: '📱', color: '#ffa726', type: 'EXPENSE', isDefault: true, order: 8 },
  { remoteId: null, slug: 'other-expense', userId: null, name: 'Other',         icon: '🔧', color: '#78909c', type: 'EXPENSE', isDefault: true, order: 9 },
  { remoteId: null, slug: 'salary',        userId: null, name: 'Salary',        icon: '💼', color: '#66bb6a', type: 'INCOME',  isDefault: true, order: 10 },
  { remoteId: null, slug: 'freelance',     userId: null, name: 'Freelance',     icon: '💻', color: '#42a5f5', type: 'INCOME',  isDefault: true, order: 11 },
  { remoteId: null, slug: 'investment',    userId: null, name: 'Investment',    icon: '📈', color: '#ec407a', type: 'INCOME',  isDefault: true, order: 12 },
  { remoteId: null, slug: 'gift',          userId: null, name: 'Gift',          icon: '🎁', color: '#26c6da', type: 'INCOME',  isDefault: true, order: 13 },
  { remoteId: null, slug: 'other-income',  userId: null, name: 'Other Income',  icon: '💰', color: '#8d6e63', type: 'INCOME',  isDefault: true, order: 14 },
]

export async function seedDefaultCategories(): Promise<void> {
  const existing = await db.categories.where('isDefault').equals(1).count()
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
  const existing = await db.taskCategories.where('isDefault').equals(1).count()
  if (existing > 0) return
  await db.taskCategories.bulkAdd(DEFAULT_TASK_CATEGORIES)
}
