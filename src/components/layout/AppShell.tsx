'use client'

import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sf-app">
      <Sidebar />
      <div className="sf-main">
        <TopNav />
        <main className="sf-page">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
