import { create } from 'zustand'

function currentYM() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface FinanceStore {
  activeMonth: string   // "YYYY-MM"
  setActiveMonth: (ym: string) => void
  prevMonth: () => void
  nextMonth: () => void
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  activeMonth: currentYM(),
  setActiveMonth: (activeMonth) => set({ activeMonth }),
  prevMonth: () => {
    const [y, m] = get().activeMonth.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    set({ activeMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })
  },
  nextMonth: () => {
    const [y, m] = get().activeMonth.split('-').map(Number)
    const d = new Date(y, m, 1)
    set({ activeMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })
  },
}))
