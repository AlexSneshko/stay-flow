import { create } from 'zustand'
import { todayISO } from '@/lib/utils'

type TaskFilter = 'all' | 'today' | 'overdue' | 'week' | 'high'

interface TasksStore {
  filter: TaskFilter
  activeDate: string | null   // null = today
  setFilter: (f: TaskFilter) => void
  setActiveDate: (d: string | null) => void
  shiftActiveDate: (delta: number) => void
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  filter: 'all',
  activeDate: null,
  setFilter: (filter) => set({ filter }),
  setActiveDate: (activeDate) => set({ activeDate }),
  shiftActiveDate: (delta) => {
    const current = get().activeDate ?? todayISO()
    const [y, m, d] = current.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    date.setDate(date.getDate() + delta)
    const pad = (n: number) => String(n).padStart(2, '0')
    set({ activeDate: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` })
  },
}))
