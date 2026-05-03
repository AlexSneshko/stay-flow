'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  LayoutDashboard, TrendingUp, CheckSquare, RefreshCw, Grid2x2, Settings,
} from 'lucide-react'
import { db } from '@/db/dexie'
import { useSettingsStore } from '@/store/settingsStore'
import { formatCurrency } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',  Icon: LayoutDashboard },
  { href: '/finance',     label: 'Finance',    Icon: TrendingUp },
  { href: '/tasks',       label: 'Tasks',      Icon: CheckSquare },
  { href: '/recurring',   label: 'Recurring',  Icon: RefreshCw },
  { href: '/categories',  label: 'Categories', Icon: Grid2x2 },
  { href: '/settings',    label: 'Settings',   Icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { accentColor, currency } = useSettingsStore()

  const nextRecurring = useLiveQuery(() =>
    db.recurringTransactions
      .where('active').equals(1)
      .sortBy('nextDueDate')
      .then(rows => rows[0] ?? null)
  )

  const daysUntil = nextRecurring
    ? Math.round((new Date(nextRecurring.nextDueDate).getTime() - Date.now()) / 86400000)
    : 0

  return (
    <aside className="sf-sidebar">
      {/* Logo */}
      <div className="sf-sidebar-logo">
        <div className="sf-logo-mark">S</div>
        <div>
          <span className="sf-logo-text">stayflow</span>
          <span className="sf-logo-version"> v0.1</span>
        </div>
      </div>

      <div className="sf-sidebar-label">Workspace</div>

      {/* Nav */}
      <nav className="sf-sidebar-nav">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`sf-sidebar-item${active ? ' active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="sf-sidebar-spacer" />

      {/* Next recurring */}
      {nextRecurring && (
        <div className="sf-sidebar-recurring">
          <div className="sf-sidebar-recurring-label">Next recurring</div>
          <div className="sf-sidebar-recurring-title">{nextRecurring.title}</div>
          <div className="sf-sidebar-recurring-meta">
            <span>
              {daysUntil <= 0 ? 'Due today' : `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`}
            </span>
            <span className="sf-sidebar-recurring-amount">
              {nextRecurring.type === 'EXPENSE' ? '−' : '+'}
              {formatCurrency(nextRecurring.amount, nextRecurring.currency || currency)}
            </span>
          </div>
        </div>
      )}

      {/* User */}
      <div className="sf-sidebar-user">
        <div
          className="sf-avatar"
          style={{ background: accentColor }}
        >
          AM
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="sf-sidebar-user-name">Alex Mercer</div>
          <div className="sf-sidebar-user-email">alex@mercer.dev</div>
        </div>
      </div>
    </aside>
  )
}
