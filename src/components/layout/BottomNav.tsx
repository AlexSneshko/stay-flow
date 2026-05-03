'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, CheckSquare, RefreshCw, Settings } from 'lucide-react'

const ITEMS = [
  { href: '/dashboard', label: 'Home',      Icon: Home },
  { href: '/finance',   label: 'Finance',   Icon: TrendingUp },
  { href: '/tasks',     label: 'Tasks',     Icon: CheckSquare },
  { href: '/recurring', label: 'Recurring', Icon: RefreshCw },
  { href: '/settings',  label: 'Settings',  Icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sf-mobile-bottom">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} className={active ? 'active' : ''}>
            <Icon size={22} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
