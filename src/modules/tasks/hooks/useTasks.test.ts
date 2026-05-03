import { describe, it, expect } from 'vitest'
import { sortTasks, taskDueInfo } from '@/modules/tasks/hooks/useTasks'
import { createTask } from '@/tests/factories'
import { format, addDays } from 'date-fns'

const today = format(new Date(), 'yyyy-MM-dd')
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
const in5Days = format(addDays(new Date(), 5), 'yyyy-MM-dd')
const in30Days = format(addDays(new Date(), 30), 'yyyy-MM-dd')

describe('sortTasks', () => {
  it('returns an empty array when given an empty array', () => {
    expect(sortTasks([])).toEqual([])
  })

  it('completed tasks appear after incomplete tasks', () => {
    const incomplete = createTask({ completed: false, dueDate: '2025-04-10' })
    const complete = createTask({ completed: true, dueDate: '2025-04-09' })
    const result = sortTasks([complete, incomplete])
    expect(result[0].completed).toBe(false)
    expect(result[1].completed).toBe(true)
  })

  it('all completed tasks are placed at the end', () => {
    const tasks = [
      createTask({ completed: true, dueDate: '2025-04-08' }),
      createTask({ completed: false, dueDate: '2025-04-10' }),
      createTask({ completed: true, dueDate: '2025-04-07' }),
      createTask({ completed: false, dueDate: '2025-04-09' }),
    ]
    const result = sortTasks(tasks)
    expect(result[0].completed).toBe(false)
    expect(result[1].completed).toBe(false)
    expect(result[2].completed).toBe(true)
    expect(result[3].completed).toBe(true)
  })

  it('sorts incomplete tasks by dueDate ascending', () => {
    const tasks = [
      createTask({ dueDate: '2025-04-15', completed: false }),
      createTask({ dueDate: '2025-04-10', completed: false }),
      createTask({ dueDate: '2025-04-12', completed: false }),
    ]
    const result = sortTasks(tasks)
    expect(result[0].dueDate).toBe('2025-04-10')
    expect(result[1].dueDate).toBe('2025-04-12')
    expect(result[2].dueDate).toBe('2025-04-15')
  })

  it('null dueDate sorts after tasks with a due date', () => {
    const withDate = createTask({ dueDate: '2025-04-10', completed: false })
    const noDate = createTask({ dueDate: null, completed: false })
    const result = sortTasks([noDate, withDate])
    expect(result[0].dueDate).toBe('2025-04-10')
    expect(result[1].dueDate).toBeNull()
  })

  it('sorts URGENT before HIGH before MEDIUM before LOW when dueDate is the same', () => {
    const tasks = [
      createTask({ priority: 'LOW', dueDate: '2025-04-10' }),
      createTask({ priority: 'URGENT', dueDate: '2025-04-10' }),
      createTask({ priority: 'MEDIUM', dueDate: '2025-04-10' }),
      createTask({ priority: 'HIGH', dueDate: '2025-04-10' }),
    ]
    const result = sortTasks(tasks)
    expect(result[0].priority).toBe('URGENT')
    expect(result[1].priority).toBe('HIGH')
    expect(result[2].priority).toBe('MEDIUM')
    expect(result[3].priority).toBe('LOW')
  })

  it('does not mutate the original array', () => {
    const tasks = [
      createTask({ dueDate: '2025-04-15' }),
      createTask({ dueDate: '2025-04-10' }),
    ]
    const original = [...tasks]
    sortTasks(tasks)
    expect(tasks[0].dueDate).toBe(original[0].dueDate)
    expect(tasks[1].dueDate).toBe(original[1].dueDate)
  })
})

describe('taskDueInfo', () => {
  it('returns "No due date" with null days when dueDate is null', () => {
    const result = taskDueInfo(null)
    expect(result.label).toBe('No due date')
    expect(result.klass).toBe('')
    expect(result.days).toBeNull()
  })

  it('returns "No due date" with null days when dueDate is undefined', () => {
    const result = taskDueInfo(undefined)
    expect(result.label).toBe('No due date')
    expect(result.days).toBeNull()
  })

  it('returns due-overdue class and negative days for a past date', () => {
    const result = taskDueInfo('2020-01-01')
    expect(result.klass).toBe('due-overdue')
    expect(result.days).not.toBeNull()
    expect(result.days!).toBeLessThan(0)
    expect(result.label).toContain('Overdue')
  })

  it('returns "Due today" label, due-today class, and days=0 for today', () => {
    const result = taskDueInfo(today)
    expect(result.label).toBe('Due today')
    expect(result.klass).toBe('due-today')
    expect(result.days).toBe(0)
  })

  it('returns "Due tomorrow" label, due-soon class, and days=1 for tomorrow', () => {
    const result = taskDueInfo(tomorrow)
    expect(result.label).toBe('Due tomorrow')
    expect(result.klass).toBe('due-soon')
    expect(result.days).toBe(1)
  })

  it('returns due-soon class and days=5 for a date 5 days out', () => {
    const result = taskDueInfo(in5Days)
    expect(result.klass).toBe('due-soon')
    expect(result.days).toBe(5)
    expect(result.label).toContain('5d')
  })

  it('returns empty klass and a month-name label for a date 30+ days out', () => {
    const result = taskDueInfo(in30Days)
    expect(result.klass).toBe('')
    expect(result.days).toBe(30)
    // label should contain a month abbreviation like "Jan", "Feb", etc.
    expect(result.label).toMatch(/[A-Z][a-z]{2}/)
  })

  it('overdue label includes the number of days overdue', () => {
    const result = taskDueInfo('2020-06-15')
    expect(result.label).toMatch(/Overdue · \d+d/)
  })
})
