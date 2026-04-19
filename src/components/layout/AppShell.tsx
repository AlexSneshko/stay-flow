'use client'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
