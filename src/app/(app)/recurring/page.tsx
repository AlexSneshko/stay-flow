'use client'

import { useState, useEffect } from 'react'
import { Plus, Pause, Play, Trash2 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type DRecurringTransaction } from '@/db/dexie'
import { useSettingsStore } from '@/store/settingsStore'
import { seedDefaultCategories } from '@/db/seeds'
import { formatCurrency } from '@/lib/utils'
import { useTransactionCategories } from '@/modules/finance/hooks/useFinanceData'
import { RecurringModal } from '@/modules/finance/components/RecurringModal'

export default function RecurringPage() {
  const { currency } = useSettingsStore()
  const [editItem, setEditItem] = useState<DRecurringTransaction | null | undefined>(undefined)

  useEffect(() => { seedDefaultCategories() }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ route: string }>).detail
      if (detail?.route === '/recurring') setEditItem(null)
    }
    window.addEventListener('sf:new', handler)
    return () => window.removeEventListener('sf:new', handler)
  }, [])

  const items = useLiveQuery(() => db.recurringTransactions.toArray(), [], [] as DRecurringTransaction[])
  const categories = useTransactionCategories()

  const active = items.filter(r => r.active)
  const paused = items.filter(r => !r.active)

  const monthlyCommit = active
    .filter(r => r.type === 'EXPENSE')
    .reduce((s, r) => {
      const norm = r.frequency === 'MONTHLY' ? r.amount
        : r.frequency === 'YEARLY'  ? Math.round(r.amount / 12)
        : r.frequency === 'WEEKLY'  ? Math.round(r.amount * 4.33)
        : Math.round(r.amount * 30)
      return s + norm
    }, 0)

  const upcoming7 = active.filter(r => {
    const diff = (new Date(r.nextDueDate).getTime() - Date.now()) / 86400000
    return diff >= 0 && diff <= 7
  }).length

  function getCategory(slug: string) {
    return categories.find(c => c.slug === slug) ?? { icon: '•', color: '#888', name: slug }
  }

  async function toggleActive(item: DRecurringTransaction) {
    if (!item.id) return
    await db.recurringTransactions.update(item.id, { active: !item.active })
  }

  async function deleteItem(item: DRecurringTransaction) {
    if (!item.id || !confirm(`Delete "${item.title}"?`)) return
    await db.recurringTransactions.delete(item.id)
  }

  function RecRow({ item }: { item: DRecurringTransaction }) {
    const cat = getCategory(item.categorySlug)
    const diff = Math.round((new Date(item.nextDueDate).getTime() - Date.now()) / 86400000)
    const dueLabel = diff < 0 ? 'Due now' : diff === 0 ? 'Due today' : `Due in ${diff}d`

    return (
      <div className={`sf-rec-row${item.active ? '' : ' paused'}`} onClick={() => setEditItem(item)}>
        <div className="sf-rec-icon" style={{ background: cat.color }}>
          {cat.icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="sf-rec-title">{item.title}</div>
          <div className="sf-rec-badge">{item.frequency.toLowerCase()} · {dueLabel}</div>
        </div>
        <div
          className="sf-rec-amount"
          style={{ color: item.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}
        >
          {item.type === 'INCOME' ? '+' : '−'}
          {formatCurrency(item.amount, item.currency || currency)}
        </div>
        <button
          className="sf-icon-btn"
          title={item.active ? 'Pause' : 'Resume'}
          onClick={e => { e.stopPropagation(); toggleActive(item) }}
        >
          {item.active ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          className="sf-icon-btn"
          title="Delete"
          onClick={e => { e.stopPropagation(); deleteItem(item) }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="sf-fin-toolbar">
        <div style={{ color: 'var(--text-secondary)', fontSize: 12, letterSpacing: '0.04em' }}>
          {items.length} recurring — {active.length} active
        </div>
        <button className="sf-btn sf-btn-primary" onClick={() => setEditItem(null)}>
          <Plus size={15} /> New recurring
        </button>
      </div>

      {/* Stats */}
      <div className="sf-rec-stats">
        <div className="sf-stat-card">
          <div className="sf-stat-label">Monthly commit</div>
          <div className="sf-stat-value" style={{ color: 'var(--expense)' }}>
            {formatCurrency(monthlyCommit, currency)}
          </div>
          <div className="sf-stat-trend">Recurring expenses normalized</div>
        </div>
        <div className="sf-stat-card">
          <div className="sf-stat-label">Active</div>
          <div className="sf-stat-value">{active.length}</div>
          <div className="sf-stat-trend">{active.length} sub{active.length === 1 ? '' : 's'}</div>
        </div>
        <div className="sf-stat-card">
          <div className="sf-stat-label">Next 7 days</div>
          <div className="sf-stat-value">{upcoming7}</div>
          <div className="sf-stat-trend">{upcoming7} upcoming</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="sf-empty">
          <div className="sf-empty-title">No recurring transactions</div>
          <div className="sf-empty-text">Automate recurring income and bills.</div>
          <button className="sf-btn sf-btn-primary mt-2" onClick={() => setEditItem(null)}>
            Add one
          </button>
        </div>
      ) : (
        <>
          <div className="sf-rec-section-label">Active</div>
          {active.map(r => <RecRow key={r.id} item={r} />)}
          {paused.length > 0 && (
            <>
              <div className="sf-rec-section-label">Paused</div>
              {paused.map(r => <RecRow key={r.id} item={r} />)}
            </>
          )}
        </>
      )}

      {editItem !== undefined && (
        <RecurringModal
          initial={editItem}
          categories={categories}
          defaultCurrency={currency}
          onClose={() => setEditItem(undefined)}
        />
      )}
    </>
  )
}
