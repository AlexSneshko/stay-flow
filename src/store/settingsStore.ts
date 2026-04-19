import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  currency: string
  theme: 'light' | 'dark' | 'system'
  language: string
  weekStartsOn: 0 | 1
  timezone: string
  setCurrency: (currency: string) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: string) => void
  setWeekStartsOn: (day: 0 | 1) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      theme: 'system',
      language: 'en',
      weekStartsOn: 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setWeekStartsOn: (weekStartsOn) => set({ weekStartsOn }),
    }),
    { name: 'settings-store' }
  )
)
