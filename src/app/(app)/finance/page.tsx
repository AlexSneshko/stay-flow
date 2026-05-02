'use client'

import { useState, useEffect } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import {
  useMonthTransactions, useAllTransactions, useTransactionCategories,
  monthStats, prevYM, last6Months, sumAmount,
} from '@/modules/finance/hooks/useFinanceData'
import { seedDefaultCategories } from '@/db/seeds'
import { formatCurrency } from '@/lib/utils'
import { FinanceStatRow } from '@/modules/finance/components/StatCards'
import { FinanceChart } from '@/modules/finance/components/FinanceChart'
import { SpendCalendar } from '@/modules/finance/components/SpendCalendar'
import { TransactionList } from '@/modules/finance/components/TransactionList'
import { TransactionModal } from '@/modules/finance/components/TransactionModal'
import { type DTransaction } from '@/db/dexie'
import { MONTHS } from '@/modules/finance/types'

export default function FinancePage() {
  const { activeMonth, prevMonth, nextMonth } = useFinanceStore()
  const { currency, weekStartsOn, roundToNearestDollar } = useSettingsStore()
  const [editTxn, setEditTxn] = useState<DTransaction | null | undefined>(undefined)

  useEffect(() => { seedDefaultCategories() }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ route: string }>).detail
      if (detail?.route === '/finance') setEditTxn(null)
    }
    window.addEventListener('sf:new', handler)
    return () => window.removeEventListener('sf:new', handler)
  }, [])

  const [y, m] = activeMonth.split('-').map(Number)
  const txns = useMonthTransactions(activeMonth)
  const allTxns = useAllTransactions()
  const categories = useTransactionCategories()

  const fmt = (cents: number, cur = currency) => formatCurrency(cents, cur, roundToNearestDollar)

  const { income, expense, net } = monthStats(txns)
  const prev = prevYM(activeMonth)
  const prevStats = monthStats(allTxns.filter(t => t.date.startsWith(prev)))
  const incomePct = prevStats.income ? Math.round(((income - prevStats.income) / prevStats.income) * 100) : 0
  const expensePct = prevStats.expense ? Math.round(((expense - prevStats.expense) / prevStats.expense) * 100) : 0

  let bestNet = -Infinity
  let bestYm = activeMonth
  for (let mm = 1; mm <= 12; mm++) {
    const ym = `${y}-${String(mm).padStart(2, '0')}`
    const stats = monthStats(allTxns.filter(t => t.date.startsWith(ym)))
    if (stats.net > bestNet) { bestNet = stats.net; bestYm = ym }
  }
  const netLabel = bestYm === activeMonth ? 'Best month YTD' : net < 0 ? 'Spending exceeded income' : 'Healthy margin'

  const chartMonths = last6Months(activeMonth)
  const chartData = chartMonths.map(ym => {
    const mt = allTxns.filter(t => t.date.startsWith(ym) && t.status === 'CONFIRMED')
    return {
      ym,
      income: sumAmount(mt.filter(t => t.type === 'INCOME')),
      expense: sumAmount(mt.filter(t => t.type === 'EXPENSE')),
    }
  })

  const monthLabel = MONTHS[m - 1]

  return (
    <>
      <div className="sf-fin-toolbar">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="sf-month-selector">
            <button onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className="sf-month-selector-label">{monthLabel} {y}</span>
            <button onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <button className="sf-btn sf-btn-primary" onClick={() => setEditTxn(null)}>
          <Plus size={15} /> Add
        </button>
      </div>

      <FinanceStatRow
        income={income}
        expense={expense}
        net={net}
        incomePct={incomePct}
        expensePct={expensePct}
        currency={currency}
        formatFn={fmt}
        bestMonthLabel={netLabel}
      />

      <div className="sf-fin-row">
        <FinanceChart data={chartData} />
        <SpendCalendar
          year={y}
          month={m}
          transactions={txns}
          weekStartsOn={weekStartsOn}
          currency={currency}
          totalSpent={fmt(expense)}
        />
      </div>

      <TransactionList
        transactions={txns}
        categories={categories}
        onEdit={t => setEditTxn(t)}
        onNew={() => setEditTxn(null)}
      />

      {editTxn !== undefined && (
        <TransactionModal
          initial={editTxn}
          categories={categories}
          defaultCurrency={currency}
          onClose={() => setEditTxn(undefined)}
        />
      )}
    </>
  )
}
