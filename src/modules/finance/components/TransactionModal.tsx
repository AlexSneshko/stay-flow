'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Trash2 } from 'lucide-react'
import { db, type DTransaction, type DTransactionCategory } from '@/db/dexie'
import { todayISO } from '@/lib/utils'
import { CURRENCIES } from '../types'

const DEMO_USER_ID = 'demo'

interface TransactionModalProps {
  initial?: DTransaction | null
  categories: DTransactionCategory[]
  defaultCurrency: string
  onClose: () => void
}

interface ModalState {
  id: number | undefined
  type: 'INCOME' | 'EXPENSE'
  amount: number
  categorySlug: string
  currency: string
  note: string
  date: string
  status: 'CONFIRMED' | 'PENDING'
}

function formatAmountDisplay(cents: number, type: 'INCOME' | 'EXPENSE'): string {
  const sign = type === 'INCOME' ? '+' : '−'
  const str = (cents / 100).toFixed(2)
  const parts = str.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}$${parts.join('.')}`
}

export function TransactionModal({ initial, categories, defaultCurrency, onClose }: TransactionModalProps) {
  const filteredCats = (type: 'INCOME' | 'EXPENSE') =>
    categories.filter(c => c.type === type || c.type === 'BOTH').sort((a, b) => a.order - b.order)

  const initType = initial?.type ?? 'EXPENSE'
  const initCat = initial?.categorySlug ?? (filteredCats(initType)[0]?.slug ?? '')

  const [state, setState] = useState<ModalState>({
    id: initial?.id,
    type: initType,
    amount: initial?.amount ?? 0,
    categorySlug: initCat,
    currency: initial?.currency ?? defaultCurrency,
    note: initial?.note ?? '',
    date: initial?.date ?? todayISO(),
    status: initial?.status ?? 'CONFIRMED',
  })
  const [amountDisplay, setAmountDisplay] = useState(() => formatAmountDisplay(initial?.amount ?? 0, initType))
  const [saving, setSaving] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 50)
  }, [])

  function setType(type: 'INCOME' | 'EXPENSE') {
    const cats = filteredCats(type)
    const slug = cats.find(c => c.slug === state.categorySlug) ? state.categorySlug : (cats[0]?.slug ?? '')
    setState(s => ({ ...s, type, categorySlug: slug }))
    setAmountDisplay(formatAmountDisplay(state.amount, type))
  }

  function handleAmountInput(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    const cents = parseInt(digits || '0', 10)
    setState(s => ({ ...s, amount: cents }))
    const display = formatAmountDisplay(cents, state.type)
    setAmountDisplay(display)
    const el = e.target
    requestAnimationFrame(() => { el.setSelectionRange(el.value.length, el.value.length) })
  }

  async function handleSave() {
    if (!state.amount || state.amount <= 0) return
    setSaving(true)
    try {
      if (state.id !== undefined) {
        await db.transactions.update(state.id, {
          amount: state.amount,
          type: state.type,
          categorySlug: state.categorySlug,
          currency: state.currency,
          note: state.note,
          date: state.date,
          _dirty: true,
        })
      } else {
        await db.transactions.add({
          remoteId: null,
          userId: DEMO_USER_ID,
          amount: state.amount,
          type: state.type,
          categorySlug: state.categorySlug,
          currency: state.currency,
          note: state.note,
          date: state.date,
          status: 'CONFIRMED',
          recurringId: null,
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
    if (!state.id || !confirm('Delete this transaction?')) return
    await db.transactions.delete(state.id)
    onClose()
  }

  const cats = filteredCats(state.type)

  return (
    <div className="sf-modal-overlay" onClick={onClose}>
      <div className="sf-modal" onClick={e => e.stopPropagation()}>
        <div className="sf-modal-head">
          <div className="sf-modal-title">{state.id !== undefined ? 'Edit transaction' : 'New transaction'}</div>
          <button className="sf-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="sf-modal-body">
          {/* Type tabs */}
          <div className="sf-tx-tabs" style={{ marginTop: 14 }}>
            <button
              className={`sf-tx-tab income${state.type === 'INCOME' ? ' active' : ''}`}
              onClick={() => setType('INCOME')}
            >Income</button>
            <button
              className={`sf-tx-tab expense${state.type === 'EXPENSE' ? ' active' : ''}`}
              onClick={() => setType('EXPENSE')}
            >Expense</button>
          </div>

          {/* Amount */}
          <div className="sf-amount-input-wrap">
            <input
              ref={amountRef}
              className={`sf-amount-input ${state.type === 'INCOME' ? 'income' : 'expense'}`}
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={handleAmountInput}
              onFocus={e => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
            />
          </div>

          {/* Category */}
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
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date + Currency */}
          <div className="sf-field-row">
            <div>
              <div className="sf-field-label">Date</div>
              <input
                className="sf-input"
                type="date"
                value={state.date}
                onChange={e => setState(s => ({ ...s, date: e.target.value }))}
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

          {/* Note */}
          <div className="sf-field">
            <div className="sf-field-label">Note</div>
            <textarea
              className="sf-input"
              placeholder="Tell me..."
              value={state.note}
              onChange={e => setState(s => ({ ...s, note: e.target.value }))}
            />
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
              disabled={saving || !state.amount}
            >
              {state.id !== undefined ? 'Update' : 'Save transaction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
