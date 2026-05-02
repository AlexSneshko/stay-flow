'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { db, type DRecurringTransaction, type DTransactionCategory } from '@/db/dexie'
import { todayISO } from '@/lib/utils'
import { CURRENCIES } from '../types'

const DEMO_USER_ID = 'demo'
type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

interface RecurringModalProps {
  initial?: DRecurringTransaction | null
  categories: DTransactionCategory[]
  defaultCurrency: string
  onClose: () => void
}

interface ModalState {
  id: number | undefined
  title: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  categorySlug: string
  currency: string
  frequency: Frequency
  dayOfMonth: number | null
  nextDueDate: string
}

function formatAmt(cents: number, type: 'INCOME' | 'EXPENSE'): string {
  const sign = type === 'INCOME' ? '+' : '−'
  const str = (cents / 100).toFixed(2)
  const parts = str.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}$${parts.join('.')}`
}

export function RecurringModal({ initial, categories, defaultCurrency, onClose }: RecurringModalProps) {
  const filteredCats = (type: 'INCOME' | 'EXPENSE') =>
    categories.filter(c => c.type === type || c.type === 'BOTH').sort((a, b) => a.order - b.order)

  const initType = initial?.type ?? 'EXPENSE'
  const initCat = initial?.categorySlug ?? (filteredCats(initType)[0]?.slug ?? 'subscriptions')

  const [state, setState] = useState<ModalState>({
    id: initial?.id,
    title: initial?.title ?? '',
    type: initType,
    amount: initial?.amount ?? 0,
    categorySlug: initCat,
    currency: initial?.currency ?? defaultCurrency,
    frequency: initial?.frequency ?? 'MONTHLY',
    dayOfMonth: initial?.dayOfMonth ?? new Date().getDate(),
    nextDueDate: initial?.nextDueDate ?? todayISO(),
  })
  const [amountDisplay, setAmountDisplay] = useState(() => formatAmt(initial?.amount ?? 0, initType))
  const [saving, setSaving] = useState(false)

  function setType(type: 'INCOME' | 'EXPENSE') {
    const cats = filteredCats(type)
    const slug = cats.find(c => c.slug === state.categorySlug) ? state.categorySlug : (cats[0]?.slug ?? '')
    setState(s => ({ ...s, type, categorySlug: slug }))
    setAmountDisplay(formatAmt(state.amount, type))
  }

  function handleAmountInput(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    const cents = parseInt(digits || '0', 10)
    setState(s => ({ ...s, amount: cents }))
    const display = formatAmt(cents, state.type)
    setAmountDisplay(display)
    const el = e.target
    requestAnimationFrame(() => { el.setSelectionRange(el.value.length, el.value.length) })
  }

  async function handleSave() {
    if (!state.title.trim() || !state.amount) return
    setSaving(true)
    try {
      if (state.id !== undefined) {
        await db.recurringTransactions.update(state.id, {
          title: state.title,
          amount: state.amount,
          type: state.type,
          categorySlug: state.categorySlug,
          currency: state.currency,
          frequency: state.frequency,
          dayOfMonth: state.frequency === 'MONTHLY' ? state.dayOfMonth : null,
          nextDueDate: state.nextDueDate,
          _dirty: true,
        })
      } else {
        await db.recurringTransactions.add({
          remoteId: null,
          userId: DEMO_USER_ID,
          title: state.title,
          amount: state.amount,
          type: state.type,
          categorySlug: state.categorySlug,
          currency: state.currency,
          frequency: state.frequency,
          dayOfMonth: state.frequency === 'MONTHLY' ? state.dayOfMonth : null,
          dayOfWeek: null,
          nextDueDate: state.nextDueDate,
          active: true,
          createdAt: new Date().toISOString(),
          _dirty: true,
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!state.id || !confirm('Delete this recurring transaction?')) return
    await db.recurringTransactions.delete(state.id)
    onClose()
  }

  const cats = filteredCats(state.type)
  const freqs: Frequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

  return (
    <div className="sf-modal-overlay" onClick={onClose}>
      <div className="sf-modal" onClick={e => e.stopPropagation()}>
        <div className="sf-modal-head">
          <div className="sf-modal-title">
            {state.id !== undefined ? 'Edit recurring' : 'New recurring transaction'}
          </div>
          <button className="sf-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="sf-modal-body">
          <div className="sf-field" style={{ marginTop: 14 }}>
            <div className="sf-field-label">Subscription name</div>
            <input
              className="sf-input"
              type="text"
              placeholder="e.g. Netflix"
              value={state.title}
              onChange={e => setState(s => ({ ...s, title: e.target.value }))}
            />
          </div>

          <div className="sf-tx-tabs" style={{ margin: '14px 0 8px' }}>
            <button
              className={`sf-tx-tab income${state.type === 'INCOME' ? ' active' : ''}`}
              onClick={() => setType('INCOME')}
            >Income</button>
            <button
              className={`sf-tx-tab expense${state.type === 'EXPENSE' ? ' active' : ''}`}
              onClick={() => setType('EXPENSE')}
            >Expense</button>
          </div>

          <div className="sf-amount-input-wrap">
            <input
              className={`sf-amount-input ${state.type === 'INCOME' ? 'income' : 'expense'}`}
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={handleAmountInput}
              onFocus={e => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
            />
          </div>

          <div className="sf-field">
            <div className="sf-field-label">Category</div>
            <div className="sf-cat-pills">
              {cats.map(c => (
                <button
                  key={c.slug}
                  className={`sf-cat-pill${state.categorySlug === c.slug ? ' active' : ''}`}
                  style={state.categorySlug === c.slug ? { background: c.color } : undefined}
                  onClick={() => setState(s => ({ ...s, categorySlug: c.slug }))}
                >
                  <span>{c.icon}</span><span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sf-field">
            <div className="sf-field-label">Frequency</div>
            <div className="sf-freq-pills">
              {freqs.map(f => (
                <button
                  key={f}
                  className={`sf-freq-pill${state.frequency === f ? ' active' : ''}`}
                  onClick={() => setState(s => ({ ...s, frequency: f }))}
                >
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {state.frequency === 'MONTHLY' && (
            <div className="sf-field">
              <div className="sf-field-label">Day of month</div>
              <input
                className="sf-input"
                type="number"
                min={1}
                max={31}
                placeholder="e.g. 15"
                value={state.dayOfMonth ?? ''}
                onChange={e => {
                  const n = parseInt(e.target.value, 10)
                  setState(s => ({ ...s, dayOfMonth: n >= 1 && n <= 31 ? n : null }))
                }}
              />
            </div>
          )}

          <div className="sf-field-row">
            <div>
              <div className="sf-field-label">First due date</div>
              <input
                className="sf-input"
                type="date"
                value={state.nextDueDate}
                onChange={e => setState(s => ({ ...s, nextDueDate: e.target.value }))}
              />
            </div>
            <div>
              <div className="sf-field-label">Currency</div>
              <select
                className="sf-input"
                value={state.currency}
                onChange={e => setState(s => ({ ...s, currency: e.target.value }))}
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="sf-modal-foot">
          <div className="sf-modal-foot-left">
            {state.id !== undefined && (
              <button
                className="sf-btn sf-btn-ghost"
                style={{ color: 'var(--expense)' }}
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
          <div className="sf-modal-foot-right">
            <button className="sf-btn sf-btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="sf-btn sf-btn-primary"
              onClick={handleSave}
              disabled={saving || !state.title.trim() || !state.amount}
            >
              {state.id !== undefined ? 'Update' : 'Save recurring'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
