'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import { useSettingsStore } from '@/store/settingsStore'
import { useFinanceStore } from '@/store/financeStore'
import { seedDefaultCategories, seedDefaultTaskCategories } from '@/db/seeds'
import { formatCurrency, getWeekNumber, parseISO } from '@/lib/utils'
import { monthStats, prevYM, last6Months, sumAmount } from '@/modules/finance/hooks/useFinanceData'
import { MONTHS, MONTHS_SHORT } from '@/modules/finance/types'
import { TxnRow } from '@/modules/finance/components/TransactionList'

export default function DashboardPage() {
  const { currency, roundToNearestDollar } = useSettingsStore()
  const { activeMonth } = useFinanceStore()

  useEffect(() => {
    seedDefaultCategories()
    seedDefaultTaskCategories()
  }, [])

  const allTxns = useLiveQuery(() => db.transactions.toArray(), [], [])
  const tasks    = useLiveQuery(() => db.tasks.toArray(), [], [])
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [], [])

  const fmt = (c: number) => formatCurrency(c, currency, roundToNearestDollar)

  const now = new Date()
  const hour = now.getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const weekNum = getWeekNumber(now)

  const [, m] = activeMonth.split('-').map(Number)
  const monthTxns = allTxns.filter(t => t.date.startsWith(activeMonth))
  const { income, expense, net } = monthStats(monthTxns)

  // vs prev month same-day
  const prev = prevYM(activeMonth)
  const today = new Date()
  const dayCutoff = today.getDate()
  const prevPartial = allTxns.filter(t =>
    t.date.startsWith(prev) && t.status === 'CONFIRMED' &&
    parseISO(t.date).getDate() <= dayCutoff
  )
  const prevNet = monthStats(prevPartial).net
  const pctMore = prevNet > 0 ? Math.round(((net - prevNet) / prevNet) * 100) : (net > 0 ? 100 : 0)
  const prevMonthName = MONTHS[parseInt(prev.split('-')[1]) - 1]

  // Sparkline data: last 6 months net
  const sparkMonths = last6Months(activeMonth)
  const sparkData = sparkMonths.map(ym => {
    const mt = allTxns.filter(t => t.date.startsWith(ym) && t.status === 'CONFIRMED')
    return sumAmount(mt.filter(t => t.type === 'INCOME')) - sumAmount(mt.filter(t => t.type === 'EXPENSE'))
  })

  // Recent transactions
  const recent = [...allTxns]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  // Upcoming tasks
  const openTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      const ad = a.dueDate ?? '9999-12-31'
      const bd = b.dueDate ?? '9999-12-31'
      return ad.localeCompare(bd)
    })
    .slice(0, 4)

  async function toggleTask(id: number | undefined) {
    if (!id) return
    const t = await db.tasks.get(id)
    if (!t) return
    await db.tasks.update(id, {
      completed: !t.completed,
      completedAt: !t.completed ? new Date().toISOString() : null,
    })
  }

  // Sparkline SVG
  function renderSparkline(values: number[]) {
    if (values.length < 2) return null
    const w = 320, h = 44, p = 2
    const min = Math.min(...values, 0)
    const max = Math.max(...values, 0)
    const range = Math.max(max - min, 1)
    const pts = values.map((v, i) => ({
      x: p + (i * (w - p * 2)) / (values.length - 1),
      y: p + (h - p * 2) * (1 - (v - min) / range),
    }))
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    const last = pts[pts.length - 1]
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="sf-sparkline" preserveAspectRatio="none">
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last.x} cy={last.y} r="3" fill="var(--accent)" />
      </svg>
    )
  }

  const monthLabel = MONTHS[m - 1]

  return (
    <>
      {/* Header */}
      <div className="sf-dash-head">
        <div className="sf-dash-date">{dateStr} · week {weekNum}</div>
        <h1 className="sf-dash-greeting">{greet}, Alex.</h1>
        <p className="sf-dash-sub">
          You&apos;ve kept <strong>{fmt(Math.max(net, 0))}</strong> this month —{' '}
          that&apos;s <strong>{pctMore >= 0 ? '+' : ''}{pctMore}%</strong>{' '}
          {pctMore >= 0 ? 'more' : 'less'} than {prevMonthName} at this point.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="sf-dash-grid">
        {/* Finance card */}
        <div className="sf-card">
          <div className="sf-card-head">
            <div className="sf-card-label">Finances · {monthLabel.toUpperCase()}</div>
            <Link href="/finance" className="sf-card-link">Open →</Link>
          </div>
          <div
            className="sf-finance-net"
            style={{ color: net >= 0 ? 'var(--income)' : 'var(--expense)' }}
          >
            {net >= 0 ? '+' : '−'}{fmt(Math.abs(net))}
          </div>
          <div className="sf-finance-rows">
            <div className="sf-finance-row">
              <span className="sf-finance-row-label">
                <span style={{ color: 'var(--income)', fontSize: 14 }}>↑</span> Income
              </span>
              <span className="sf-finance-row-amt">{fmt(income)}</span>
            </div>
            <div className="sf-finance-row">
              <span className="sf-finance-row-label">
                <span style={{ color: 'var(--expense)', fontSize: 14 }}>↓</span> Expenses
              </span>
              <span className="sf-finance-row-amt">{fmt(expense)}</span>
            </div>
          </div>
          {renderSparkline(sparkData)}
        </div>

        {/* Tasks card */}
        <div className="sf-card">
          <div className="sf-card-head">
            <div className="sf-card-label">Upcoming tasks</div>
            <Link href="/tasks" className="sf-card-link">Open →</Link>
          </div>
          {openTasks.length === 0 ? (
            <div style={{ padding: '14px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              No open tasks.{' '}
              <Link href="/tasks" className="sf-card-link" style={{ display: 'inline', padding: 0 }}>
                Add one →
              </Link>
            </div>
          ) : (
            <div className="sf-dash-tasks-list">
              {openTasks.map(t => {
                const dueLabel = t.dueDate
                  ? (() => {
                      const today2 = new Date(); today2.setHours(0,0,0,0)
                      const due2 = parseISO(t.dueDate); due2.setHours(0,0,0,0)
                      const days = Math.round((due2.getTime() - today2.getTime()) / 86400000)
                      if (days < 0) return { label: `Overdue ${Math.abs(days)}d`, cls: 'due-overdue' }
                      if (days === 0) return { label: 'Due today', cls: 'due-today' }
                      if (days === 1) return { label: 'Due tomorrow', cls: 'due-soon' }
                      return { label: `${MONTHS_SHORT[due2.getMonth()]} ${due2.getDate()}`, cls: '' }
                    })()
                  : { label: 'No due date', cls: '' }

                return (
                  <div
                    key={t.id}
                    className={`sf-dash-task-item${t.completed ? ' done' : ''}`}
                  >
                    <button
                      className={`sf-dash-task-check${t.completed ? ' done' : ''}`}
                      onClick={() => toggleTask(t.id)}
                    >
                      {t.completed && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><path d="M5 12l5 5L20 7"/></svg>}
                    </button>
                    <div className="sf-dash-task-title">{t.title}</div>
                    <span
                      className="sf-dash-task-meta"
                      style={{
                        color: dueLabel.cls === 'due-overdue' ? 'var(--expense)'
                          : dueLabel.cls === 'due-today' ? 'var(--pending)'
                          : 'var(--text-secondary)'
                      }}
                    >
                      {dueLabel.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="sf-card">
        <div className="sf-card-head">
          <div className="sf-card-label">Last {recent.length} transactions</div>
          <Link href="/finance" className="sf-card-link">See all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="sf-empty">
            <div className="sf-empty-title">No transactions yet</div>
            <div className="sf-empty-text">Add your first to get started.</div>
          </div>
        ) : (
          recent.map(t => (
            <TxnRow
              key={t.id}
              txn={t}
              categories={categories}
              currency={currency}
              onEdit={() => {}}
              onConfirm={async id => { await db.transactions.update(id, { status: 'CONFIRMED' }) }}
            />
          ))
        )}
      </div>
    </>
  )
}
