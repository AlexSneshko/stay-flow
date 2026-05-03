'use client'

import { usePathname } from 'next/navigation'
import { Sun, Moon, Monitor, Search, Bell, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'

const TITLE_MAP: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/finance':    'Finance',
  '/tasks':      'Tasks',
  '/recurring':  'Recurring',
  '/categories': 'Categories',
  '/settings':   'Settings',
}

const NEW_LABEL_MAP: Record<string, string> = {
  '/recurring':  'New recurring',
  '/tasks':      'New task',
  '/categories': 'New category',
}

export function TopNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const title = TITLE_MAP[pathname] ?? 'StayFlow'
  const newLabel = NEW_LABEL_MAP[pathname] ?? 'New'
  const isSettings = pathname === '/settings'

  return (
    <header className="sf-topnav">
      <div className="sf-topnav-title">{title}</div>

      <div className="sf-topnav-actions">
        {/* Theme pill */}
        <div className="sf-theme-pill">
          <button
            className={theme === 'light' ? 'active' : ''}
            onClick={() => setTheme('light')}
            aria-label="Light mode"
          >
            <Sun size={13} />
            <span>Light</span>
          </button>
          <button
            className={theme === 'dark' ? 'active' : ''}
            onClick={() => setTheme('dark')}
            aria-label="Dark mode"
          >
            <Moon size={13} />
            <span>Dark</span>
          </button>
          <button
            className={theme === 'system' ? 'active' : ''}
            onClick={() => setTheme('system')}
            aria-label="Auto mode"
          >
            <Monitor size={13} />
            <span>Auto</span>
          </button>
        </div>

        <button className="sf-icon-btn" aria-label="Search">
          <Search size={16} />
        </button>

        <button className="sf-icon-btn" aria-label="Notifications">
          <Bell size={16} />
        </button>

        {!isSettings && (
          <button
            className="sf-btn sf-btn-primary"
            onClick={() => {
              // Each page's modal is triggered via URL params or global event
              window.dispatchEvent(new CustomEvent('sf:new', { detail: { route: pathname } }))
            }}
          >
            <Plus size={15} />
            {newLabel}
          </button>
        )}
      </div>
    </header>
  )
}
