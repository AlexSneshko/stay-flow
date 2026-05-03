import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/dexie'
import { createTask } from '@/tests/factories'
import { sortTasks } from '@/modules/tasks/hooks/useTasks'

beforeEach(async () => {
  await db.tasks.clear()
})

describe('tasks-flow integration', () => {
  it('add task → appears in db with correct title', async () => {
    const task = createTask({ title: 'Integration test task' })
    await db.tasks.put(task)
    const fetched = await db.tasks.get(task.id!)
    expect(fetched).toBeDefined()
    expect(fetched!.title).toBe('Integration test task')
  })

  it('pinned task has isPinned=true', async () => {
    const task = createTask({ isPinned: true, title: 'Pinned task' })
    await db.tasks.put(task)
    const fetched = await db.tasks.get(task.id!)
    expect(fetched).toBeDefined()
    expect(fetched!.isPinned).toBe(true)
  })

  it('complete task sets completedAt', async () => {
    const task = createTask({ completed: false, completedAt: null })
    await db.tasks.put(task)

    const completedAt = new Date().toISOString()
    await db.tasks.update(task.id!, { completed: true, completedAt })

    const fetched = await db.tasks.get(task.id!)
    expect(fetched).toBeDefined()
    expect(fetched!.completed).toBe(true)
    expect(fetched!.completedAt).toBe(completedAt)
  })

  it('sortTasks puts completed tasks last', async () => {
    const done = createTask({ completed: true, dueDate: '2025-04-08', title: 'Done task' })
    const active = createTask({ completed: false, dueDate: '2025-04-10', title: 'Active task' })
    await db.tasks.bulkPut([done, active])

    const all = await db.tasks.toArray()
    const sorted = sortTasks(all)

    expect(sorted[0].completed).toBe(false)
    expect(sorted[sorted.length - 1].completed).toBe(true)
  })

  it('pinHistory records completion — key is preserved after db round-trip', async () => {
    const pinHistory: Record<string, boolean> = { '2025-04-10': true }
    const task = createTask({ pinHistory })
    await db.tasks.put(task)

    const fetched = await db.tasks.get(task.id!)
    expect(fetched).toBeDefined()
    expect(fetched!.pinHistory['2025-04-10']).toBe(true)
  })

  it('multiple tasks sorted by priority (URGENT first) when dueDate is the same', async () => {
    const sharedDate = '2025-04-10'
    const low = createTask({ priority: 'LOW', dueDate: sharedDate, title: 'Low' })
    const urgent = createTask({ priority: 'URGENT', dueDate: sharedDate, title: 'Urgent' })
    const medium = createTask({ priority: 'MEDIUM', dueDate: sharedDate, title: 'Medium' })

    await db.tasks.bulkPut([low, urgent, medium])

    const all = await db.tasks.toArray()
    const sorted = sortTasks(all)

    expect(sorted[0].priority).toBe('URGENT')
    expect(sorted[1].priority).toBe('MEDIUM')
    expect(sorted[2].priority).toBe('LOW')
  })
})
