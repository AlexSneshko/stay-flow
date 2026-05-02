'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Trash2 } from 'lucide-react'
import { db, type DTask, type DTaskCategory } from '@/db/dexie'

const DEMO_USER_ID = 'demo'

interface TaskModalProps {
  initial?: DTask | null
  taskCategories: DTaskCategory[]
  onClose: () => void
}

interface ModalState {
  id: number | undefined
  title: string
  notes: string
  dueDate: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  linkedCategory: string | null
  isPinned: boolean
  timeFrom: string
  timeTo: string
  amount: number
}

const PRIORITIES: Array<{ value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; label: string; cls: string }> = [
  { value: 'URGENT', label: 'Urgent', cls: 'urgent' },
  { value: 'HIGH',   label: 'High',   cls: 'high' },
  { value: 'MEDIUM', label: 'Medium', cls: 'med' },
  { value: 'LOW',    label: 'Low',    cls: 'low' },
]

export function TaskModal({ initial, taskCategories, onClose }: TaskModalProps) {
  const [state, setState] = useState<ModalState>({
    id: initial?.id,
    title: initial?.title ?? '',
    notes: initial?.notes ?? '',
    dueDate: initial?.dueDate ?? '',
    priority: initial?.priority ?? 'MEDIUM',
    linkedCategory: initial?.linkedCategory ?? null,
    isPinned: initial?.isPinned ?? false,
    timeFrom: initial?.timeFrom ?? '',
    timeTo: initial?.timeTo ?? '',
    amount: initial?.amount ?? 0,
  })
  const [amountDisplay, setAmountDisplay] = useState(
    initial?.amount ? `$${(initial.amount / 100).toFixed(2)}` : ''
  )
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [])

  function handleAmountInput(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    const cents = parseInt(digits || '0', 10)
    setState(s => ({ ...s, amount: cents }))
    setAmountDisplay(cents ? `$${(cents / 100).toFixed(2)}` : '')
  }

  async function handleSave() {
    if (!state.title.trim()) return
    setSaving(true)
    try {
      if (state.id !== undefined) {
        await db.tasks.update(state.id, {
          title: state.title,
          notes: state.notes || null,
          dueDate: state.dueDate || null,
          priority: state.priority,
          linkedCategory: state.linkedCategory,
          isPinned: state.isPinned,
          timeFrom: state.timeFrom || null,
          timeTo: state.timeTo || null,
          amount: state.amount || null,
          _dirty: true,
        })
      } else {
        await db.tasks.add({
          remoteId: null,
          userId: DEMO_USER_ID,
          title: state.title,
          notes: state.notes || null,
          dueDate: state.dueDate || null,
          priority: state.priority,
          linkedCategory: state.linkedCategory,
          isPinned: state.isPinned,
          timeFrom: state.timeFrom || null,
          timeTo: state.timeTo || null,
          completed: false,
          completedAt: null,
          pinHistory: {},
          amount: state.amount || null,
          createdAt: new Date(),
          _dirty: true,
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!state.id || !confirm('Delete this task?')) return
    await db.tasks.delete(state.id)
    onClose()
  }

  return (
    <div className="sf-modal-overlay" onClick={onClose}>
      <div className="sf-modal" onClick={e => e.stopPropagation()}>
        <div className="sf-modal-head">
          <div className="sf-modal-title">{state.id !== undefined ? 'Edit task' : 'New task'}</div>
          <button className="sf-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="sf-modal-body">
          {/* Title */}
          <div className="sf-field" style={{ marginTop: 14 }}>
            <div className="sf-field-label">Task</div>
            <input
              ref={titleRef}
              className="sf-input"
              type="text"
              placeholder="e.g. Move $500 to savings"
              value={state.title}
              onChange={e => setState(s => ({ ...s, title: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave() }}
            />
          </div>

          {/* Due date + tracked amount */}
          <div className="sf-field-row">
            <div>
              <div className="sf-field-label">Due date</div>
              <input
                className="sf-input"
                type="date"
                value={state.dueDate}
                onChange={e => setState(s => ({ ...s, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <div className="sf-field-label">Tracked amount</div>
              <input
                className="sf-input"
                type="text"
                inputMode="numeric"
                placeholder="Optional"
                value={amountDisplay}
                onChange={handleAmountInput}
              />
            </div>
          </div>

          {/* Priority */}
          <div className="sf-field">
            <div className="sf-field-label">Priority</div>
            <div className="sf-freq-pills">
              {PRIORITIES.map(({ value, label, cls }) => (
                <button
                  key={value}
                  className={`sf-priority-pill${state.priority === value ? ` active ${cls}` : ''}`}
                  onClick={() => setState(s => ({ ...s, priority: value }))}
                >
                  <span className={`sf-priority-dot`} style={{
                    background: value === 'URGENT' ? '#c73e3e'
                      : value === 'HIGH' ? 'var(--expense)'
                      : value === 'MEDIUM' ? 'var(--pending)'
                      : 'var(--text-tertiary)'
                  }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="sf-field">
            <div className="sf-field-label">Category</div>
            <div className="sf-cat-pills">
              <button
                className={`sf-cat-pill${!state.linkedCategory ? ' active' : ''}`}
                style={!state.linkedCategory ? { background: 'var(--text-secondary)', color: 'var(--bg-page)' } : undefined}
                onClick={() => setState(s => ({ ...s, linkedCategory: null }))}
              >
                <span>—</span><span>No link</span>
              </button>
              {taskCategories.map(c => (
                <button
                  key={c.slug}
                  className={`sf-cat-pill${state.linkedCategory === c.slug ? ' active' : ''}`}
                  style={state.linkedCategory === c.slug ? { background: c.color } : undefined}
                  onClick={() => setState(s => ({ ...s, linkedCategory: c.slug }))}
                >
                  <span>{c.icon}</span><span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="sf-field-row">
            <div>
              <div className="sf-field-label">Time from</div>
              <input
                className="sf-input"
                type="time"
                value={state.timeFrom}
                onChange={e => setState(s => ({ ...s, timeFrom: e.target.value }))}
              />
            </div>
            <div>
              <div className="sf-field-label">Time to</div>
              <input
                className="sf-input"
                type="time"
                value={state.timeTo}
                onChange={e => setState(s => ({ ...s, timeTo: e.target.value }))}
              />
            </div>
          </div>

          {/* Repeat daily */}
          <div className="sf-toggle-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sf-toggle-row-label">Repeat every day</div>
              <div className="sf-toggle-row-sub">This task will appear daily until removed</div>
            </div>
            <div
              className={`sf-switch${state.isPinned ? ' on' : ''}`}
              onClick={() => setState(s => ({ ...s, isPinned: !s.isPinned }))}
            />
          </div>

          {/* Notes */}
          <div className="sf-field" style={{ marginTop: 10 }}>
            <div className="sf-field-label">Notes</div>
            <textarea
              className="sf-input"
              placeholder="Additional details..."
              value={state.notes}
              onChange={e => setState(s => ({ ...s, notes: e.target.value }))}
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
              disabled={saving || !state.title.trim()}
            >
              {state.id !== undefined ? 'Update' : 'Save task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
