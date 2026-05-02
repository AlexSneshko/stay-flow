'use client'

import { useMemo, useState } from 'react'
import { type DTransaction } from '@/db/dexie'
import { pad, parseISO } from '@/lib/utils'

const WEEKDAY_LABELS_MON = ['M','T','W','T','F','S','S']
const WEEKDAY_LABELS_SUN = ['S','M','T','W','T','F','S']

interface SpendCalendarProps {
  year: number
  month: number
  transactions: DTransaction[]
  weekStartsOn: 0 | 1
  currency: string
  totalSpent: string
}

interface TooltipData {
  x: number
  y: number
  date: string
  items: { label: string; amount: number; type: 'INCOME' | 'EXPENSE' }[]
}

function bgFor(cents: number): string {
  if (!cents) return 'transparent'
  const dollars = cents / 100
  if (dollars <= 30)  return 'color-mix(in oklab, var(--accent) 10%, transparent)'
  if (dollars <= 100) return 'color-mix(in oklab, var(--accent) 25%, transparent)'
  if (dollars <= 300) return 'color-mix(in oklab, var(--accent) 50%, transparent)'
  return 'color-mix(in oklab, var(--accent) 80%, transparent)'
}

export function SpendCalendar({ year, month, transactions, weekStartsOn, totalSpent }: SpendCalendarProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const ym = `${year}-${pad(month)}`

  const { perDay, daysInMonth, startOffset, headDays, todayDate, isCurrentMonth } = useMemo(() => {
    const first = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const headDays = weekStartsOn === 1 ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN
    const startOffset = (first.getDay() - weekStartsOn + 7) % 7
    const perDay: Record<number, number> = {}
    for (const t of transactions) {
      if (!t.date.startsWith(ym)) continue
      if (t.type !== 'EXPENSE' || t.status !== 'CONFIRMED') continue
      const d = parseISO(t.date).getDate()
      perDay[d] = (perDay[d] || 0) + t.amount
    }
    const today = new Date()
    return {
      perDay,
      daysInMonth,
      startOffset,
      headDays,
      todayDate: today.getDate(),
      isCurrentMonth: today.getFullYear() === year && today.getMonth() === month - 1,
    }
  }, [year, month, transactions, weekStartsOn, ym])

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>, d: number) {
    const dateStr = `${year}-${pad(month)}-${pad(d)}`
    const items = transactions
      .filter(t => t.date === dateStr)
      .slice(0, 6)
      .map(t => ({ label: t.note || dateStr, amount: t.amount, type: t.type }))
    if (!items.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ x: rect.right + 8, y: rect.top, date: dateStr, items })
  }

  return (
    <div className="sf-card" onMouseLeave={() => setTooltip(null)}>
      <div className="sf-card-head">
        <div className="sf-card-label">
          {new Date(year, month - 1).toLocaleString('en-US', { month: 'long' }).toUpperCase()} · Daily
        </div>
        <div className="sf-card-label">{totalSpent} spent</div>
      </div>
      <div className="sf-cal-grid">
        {headDays.map((h, i) => (
          <div key={i} className="sf-cal-head">{h}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`e-${i}`} className="sf-cal-day empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const cents = perDay[d] || 0
          const isToday = isCurrentMonth && d === todayDate
          return (
            <div
              key={d}
              className={`sf-cal-day${isToday ? ' today' : ''}`}
              style={{ background: bgFor(cents), color: cents > 10000 ? 'white' : undefined }}
              onMouseEnter={e => handleMouseEnter(e, d)}
            >
              {d}
            </div>
          )
        })}
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] px-3.5 py-2.5 shadow-lg min-w-[160px]"
          style={{ left: tooltip.x, top: tooltip.y, pointerEvents: 'none' }}
        >
          <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-2">
            {new Date(tooltip.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          {tooltip.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-6 text-[13px] text-[var(--text-primary)] py-0.5">
              <span>{item.label}</span>
              <span style={{ color: item.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}>
                {item.type === 'INCOME' ? '+' : '−'}
                {(item.amount / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
