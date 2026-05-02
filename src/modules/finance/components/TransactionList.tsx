'use client'

import { Check } from 'lucide-react'
import { type DTransaction, type DTransactionCategory, db } from '@/db/dexie'
import { txnInitials, parseISO, formatCurrency } from '@/lib/utils'
import { MONTHS_SHORT, WEEKDAYS } from '../types'

interface TxnRowProps {
  txn: DTransaction
  categories: DTransactionCategory[]
  currency: string
  onEdit: (txn: DTransaction) => void
  onConfirm: (id: number) => void
}

function getCategory(slug: string, cats: DTransactionCategory[]): DTransactionCategory {
  return cats.find(c => c.slug === slug) ?? {
    id: 0, remoteId: null, slug, userId: null,
    name: slug, icon: '•', color: '#888',
    type: 'BOTH', isDefault: false, order: 99,
  }
}

export function TxnRow({ txn, categories, currency, onEdit, onConfirm }: TxnRowProps) {
  const cat = getCategory(txn.categorySlug, categories)
  const isPending = txn.status === 'PENDING'
  const amtClass = isPending ? 'pending' : txn.type === 'INCOME' ? 'income' : 'expense'
  const sign = txn.type === 'INCOME' ? '+' : '−'
  const dateObj = parseISO(txn.date)
  const dateStr = `${MONTHS_SHORT[dateObj.getMonth()]} ${dateObj.getDate()}`
  const cur = txn.currency || currency

  return (
    <div className="sf-txn-row" onClick={() => onEdit(txn)}>
      <div className="sf-txn-circle" style={{ background: cat.color }}>
        {txnInitials(txn.note, cat.name)}
      </div>
      <div className="sf-txn-body">
        <div className="sf-txn-name">{txn.note || cat.name}</div>
        <div className="sf-txn-meta">{cat.name} · {dateStr}</div>
      </div>
      <div className={`sf-txn-amount ${amtClass}`}>
        {isPending && <span className="sf-pending-tag">pending</span>}
        <span>{sign}{formatCurrency(txn.amount, cur)}</span>
        {isPending && txn.id !== undefined && (
          <button
            className="sf-confirm-btn"
            title="Confirm"
            onClick={e => { e.stopPropagation(); onConfirm(txn.id!) }}
          >
            <Check size={11} />
          </button>
        )}
      </div>
    </div>
  )
}

interface TxnGroupProps {
  date: string
  txns: DTransaction[]
  categories: DTransactionCategory[]
  currency: string
  onEdit: (txn: DTransaction) => void
  onConfirm: (id: number) => void
}

export function TxnGroup({ date, txns, categories, currency, onEdit, onConfirm }: TxnGroupProps) {
  const d = parseISO(date)
  const label = `${WEEKDAYS[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`
  const total = txns
    .filter(t => t.type === 'EXPENSE' && t.status === 'CONFIRMED')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="sf-txn-group">
      <div className="sf-txn-group-header">
        <span>{label} · {txns.length} item{txns.length > 1 ? 's' : ''}</span>
        <span>{total > 0 ? formatCurrency(total, currency) : ''}</span>
      </div>
      {txns.map(t => (
        <TxnRow
          key={t.id}
          txn={t}
          categories={categories}
          currency={currency}
          onEdit={onEdit}
          onConfirm={onConfirm}
        />
      ))}
    </div>
  )
}

interface TransactionListProps {
  transactions: DTransaction[]
  categories: DTransactionCategory[]
  currency: string
  onEdit: (txn: DTransaction) => void
  onNew: () => void
}

export function TransactionList({ transactions, categories, currency, onEdit, onNew }: TransactionListProps) {
  async function handleConfirm(id: number) {
    await db.transactions.update(id, { status: 'CONFIRMED' })
  }

  if (transactions.length === 0) {
    return (
      <div className="sf-empty">
        <div className="sf-empty-title">No transactions this month</div>
        <div className="sf-empty-text">Add your first to get started.</div>
        <button className="sf-btn sf-btn-primary mt-2" onClick={onNew}>
          + Add transaction
        </button>
      </div>
    )
  }

  const groups: Record<string, DTransaction[]> = {}
  for (const t of transactions) {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  }
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  return (
    <div>
      {sortedDates.map(date => (
        <TxnGroup
          key={date}
          date={date}
          txns={groups[date]}
          categories={categories}
          currency={currency}
          onEdit={onEdit}
          onConfirm={handleConfirm}
        />
      ))}
    </div>
  )
}
