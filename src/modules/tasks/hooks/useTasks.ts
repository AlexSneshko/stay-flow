import { useLiveQuery } from 'dexie-react-hooks'
import { db, type DTask } from '@/db/dexie'

export function useTasks() {
  return useLiveQuery(() => db.tasks.toArray(), [], [] as DTask[])
}

export function useTaskCategories() {
  return useLiveQuery(() => db.taskCategories.orderBy('order').toArray(), [], [])
}

export function sortTasks(arr: DTask[]): DTask[] {
  return [...arr].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const ad = a.dueDate ?? '9999-12-31'
    const bd = b.dueDate ?? '9999-12-31'
    if (ad !== bd) return ad.localeCompare(bd)
    const pri = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return (pri[a.priority] ?? 2) - (pri[b.priority] ?? 2)
  })
}

export function taskDueInfo(dueDate: string | null | undefined): {
  label: string
  klass: string
  days: number | null
} {
  if (!dueDate) return { label: 'No due date', klass: '', days: null }
  const [y, m, d] = dueDate.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0,0,0,0); due.setHours(0,0,0,0)
  const days = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (days < 0)  return { label: `Overdue · ${Math.abs(days)}d`, klass: 'due-overdue', days }
  if (days === 0) return { label: 'Due today', klass: 'due-today', days }
  if (days === 1) return { label: 'Due tomorrow', klass: 'due-soon', days }
  if (days <= 7)  return { label: `Due in ${days}d`, klass: 'due-soon', days }
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return { label: `${months[due.getMonth()]} ${due.getDate()}`, klass: '', days }
}
