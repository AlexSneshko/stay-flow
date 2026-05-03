import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import { seedDefaultCategories, seedDefaultTaskCategories } from '@/db/seeds'

beforeEach(async () => {
  await db.categories.clear()
  await db.taskCategories.clear()
})

describe('seedDefaultCategories', () => {
  it('creates exactly 13 categories', async () => {
    await seedDefaultCategories()
    const count = await db.categories.count()
    expect(count).toBe(13)
  })

  it('does not duplicate categories on a second call', async () => {
    await seedDefaultCategories()
    await seedDefaultCategories()
    const count = await db.categories.count()
    expect(count).toBe(13)
  })

  it('all categories have a valid hex color', async () => {
    await seedDefaultCategories()
    const all = await db.categories.toArray()
    for (const cat of all) {
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('all categories have a non-empty icon', async () => {
    await seedDefaultCategories()
    const all = await db.categories.toArray()
    for (const cat of all) {
      expect(cat.icon.trim().length).toBeGreaterThan(0)
    }
  })

  it('seeds exactly 8 EXPENSE categories', async () => {
    await seedDefaultCategories()
    const count = await db.categories.where('type').equals('EXPENSE').count()
    expect(count).toBe(8)
  })

  it('seeds exactly 4 INCOME categories', async () => {
    await seedDefaultCategories()
    const count = await db.categories.where('type').equals('INCOME').count()
    expect(count).toBe(4)
  })

  it('seeds exactly 1 BOTH category', async () => {
    await seedDefaultCategories()
    const count = await db.categories.where('type').equals('BOTH').count()
    expect(count).toBe(1)
  })

  it('all categories have isDefault set to true', async () => {
    await seedDefaultCategories()
    const all = await db.categories.toArray()
    for (const cat of all) {
      expect(cat.isDefault).toBe(true)
    }
  })
})

describe('seedDefaultTaskCategories', () => {
  it('creates exactly 5 task categories', async () => {
    await seedDefaultTaskCategories()
    const count = await db.taskCategories.count()
    expect(count).toBe(5)
  })

  it('does not duplicate task categories on a second call', async () => {
    await seedDefaultTaskCategories()
    await seedDefaultTaskCategories()
    const count = await db.taskCategories.count()
    expect(count).toBe(5)
  })

  it('all slugs are unique', async () => {
    await seedDefaultTaskCategories()
    const all = await db.taskCategories.toArray()
    const slugs = all.map((c) => c.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })

  it('all task categories have isDefault set to true', async () => {
    await seedDefaultTaskCategories()
    const all = await db.taskCategories.toArray()
    for (const cat of all) {
      expect(cat.isDefault).toBe(true)
    }
  })

  it('all task categories have a non-empty icon', async () => {
    await seedDefaultTaskCategories()
    const all = await db.taskCategories.toArray()
    for (const cat of all) {
      expect(cat.icon.trim().length).toBeGreaterThan(0)
    }
  })
})
