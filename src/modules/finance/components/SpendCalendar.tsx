'use client'

import { useMemo, useState } from 'react'
import { type DTransaction, type DTransactionCategory } from '@/db/dexie'
import { pad, parseISO, formatCurrency } from '@/lib/utils'

const WEEKDAY_LABELS_MON = ['M','T','W','T','F','S','S']
const WEEKDAY_LABELS_SUN = ['S','M','T','W','T','F','S']

interface SpendCalendarProps {
  year: number
  month: number
  transactions: DTransaction[]
  categories: DTransactionCategory[]
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

export function SpendCalendar({ year, month, transactions, categories, weekStartsOn, currency, totalSpent }: SpendCalendarProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const ym = `${year}-${pad(month)}`

  const { perDay, daysInMonth, startOffset, headDays, todayDate, isCurrentMonth } = useMemo(() => {
    const first = new Date(year, month - 1, 1)
    const daysInMo = new Date(year, month, 0).getDate()
    const heads = weekStartsOn === 1 ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN
    const offset = (first.getDay() - weekStartsOn + 7) % 7
    const pd: Record<number, number> = {}
    for (const t of transactions) {
      if (!t.date.startsWith(ym)) continue
      if (t.type !== 'EXPENSE' || t.status !== 'CONFIRMED') continue
      const d = parseISO(t.date).getDate()
      pd[d] = (pd[d] || 0) + t.amount
    }
    const today = new Date()
    return {
      perDay: pd,
      daysInMonth: daysInMo,
      startOffset: offset,
      headDays: heads,
      todayDate: today.getDate(),
      isCurrentMonth: today.getFullYear() === year && today.getMonth() === month - 1,
    }
  }, [year, month, transactions, weekStartsOn, ym])

  function getCatName(slug: string): string {
    return categories.find(c => c.slug === slug)?.name ?? slug
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>, d: number) {
    const dateStr = `${year}-${pad(month)}-${pad(d)}`
    const items = transactions
      .filter(t => t.date === dateStr)
      .slice(0, 6)
      .map(t => ({ label: t.note || getCatName(t.categorySlug), amount: t.amount, type: t.type }))
    if (!items.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    let x = rect.right + 8
    const tw = 200
    if (x + tw > window.innerWidth - 8) x = rect.left - tw - 8
    setTooltip({ x: Math.max(8, x), y: Math.max(8, rect.top), date: dateStr, items })
  }

  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' }).toUpperCase()

  return (
    <div className="sf-card" onMouseLeave={() => setTooltip(null)}>
      <div className="sf-card-head">
        <div className="sf-card-label">{monthName} · Daily</div>
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
          className="sf-cal-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="sf-cal-tooltip-head">
            {parseISO(tooltip.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          {tooltip.items.map((item, i) => (
            <div key={i} className="sf-cal-tooltip-row">
              <span>{item.label}</span>
              <span style={{ color: item.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}>
                {item.type === 'INCOME' ? '+' : '−'}{formatCurrency(item.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
