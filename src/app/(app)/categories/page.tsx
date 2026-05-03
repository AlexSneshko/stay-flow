'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type DTransactionCategory, type DTaskCategory } from '@/db/dexie'
import { seedDefaultCategories, seedDefaultTaskCategories } from '@/db/seeds'

type Tab = 'EXPENSE' | 'INCOME' | 'TASK'

const DEMO_USER_ID = 'demo'
const PRESET_COLORS = ['#e8a44a','#5b8def','#2f9d8a','#47a373','#c7943e','#c73e3e','#8a6bc8','#0f8f5a','#42a5f5','#ec407a']
const PRESET_EMOJIS = ['🍕','🚗','🏠','💊','🎬','🛍','📱','🔧','💼','💻','📈','💰','🐾','🎁','🏋️','✈️','🍺','☕']

interface CategoryFormState {
  name: string
  icon: string
  color: string
  type: 'INCOME' | 'EXPENSE' | 'BOTH'
}

function CategoryModal({
  initial,
  isTask,
  onClose,
}: {
  initial?: (DTransactionCategory | DTaskCategory) | null
  isTask: boolean
  onClose: () => void
}) {
  const [form, setForm] = useState<CategoryFormState>({
    name: (initial as DTransactionCategory)?.name ?? '',
    icon: initial?.icon ?? '🏷️',
    color: initial?.color ?? '#5b8def',
    type: (initial as DTransactionCategory)?.type ?? 'EXPENSE',
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (isTask) {
        const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if ((initial as DTaskCategory)?.id !== undefined) {
          await db.taskCategories.update((initial as DTaskCategory).id!, {
            name: form.name, icon: form.icon, color: form.color,
          })
        } else {
          await db.taskCategories.add({
            slug: `custom-${slug}-${Date.now()}`,
            userId: DEMO_USER_ID,
            name: form.name,
            icon: form.icon,
            color: form.color,
            isDefault: false,
            order: 100 + Date.now(),
          })
        }
      } else {
        const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if ((initial as DTransactionCategory)?.id !== undefined) {
          await db.categories.update((initial as DTransactionCategory).id!, {
            name: form.name, icon: form.icon, color: form.color,
          })
        } else {
          await db.categories.add({
            remoteId: null,
            slug: `custom-${slug}-${Date.now()}`,
            userId: DEMO_USER_ID,
            name: form.name,
            icon: form.icon,
            color: form.color,
            type: form.type,
            isDefault: false,
            order: 100 + Date.now(),
          })
        }
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sf-modal-overlay" onClick={onClose}>
      <div className="sf-modal" onClick={e => e.stopPropagation()}>
        <div className="sf-modal-head">
          <div className="sf-modal-title">{(initial as DTransactionCategory)?.id ? 'Edit category' : 'New category'}</div>
          <button className="sf-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="sf-modal-body" style={{ padding: '10px 20px 20px' }}>
          <div className="sf-field">
            <div className="sf-field-label">Name</div>
            <input
              className="sf-input"
              type="text"
              value={form.name}
              onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
              placeholder="Category name"
            />
          </div>
          <div className="sf-field">
            <div className="sf-field-label">Icon</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  style={{
                    width: 36, height: 36, borderRadius: 8, fontSize: 18,
                    background: form.icon === emoji ? 'var(--bg-hover)' : 'transparent',
                    border: form.icon === emoji ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                  onClick={() => setForm(s => ({ ...s, icon: emoji }))}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="sf-field">
            <div className="sf-field-label">Color</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRESET_COLORS.map(col => (
                <div
                  key={col}
                  className={`sf-swatch${form.color === col ? ' active' : ''}`}
                  style={{ background: col }}
                  onClick={() => setForm(s => ({ ...s, color: col }))}
                >
                  {form.color === col && <Check size={14} />}
                </div>
              ))}
            </div>
          </div>
          {!isTask && (
            <div className="sf-field">
              <div className="sf-field-label">Type</div>
              <div className="sf-cat-tabs">
                {(['EXPENSE','INCOME','BOTH'] as const).map(t => (
                  <button key={t} className={form.type === t ? 'active' : ''} onClick={() => setForm(s => ({ ...s, type: t }))}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="sf-modal-foot">
          <div className="sf-modal-foot-left" />
          <div className="sf-modal-foot-right">
            <button className="sf-btn sf-btn-ghost" onClick={onClose}>Cancel</button>
            <button className="sf-btn sf-btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const [tab, setTab] = useState<Tab>('EXPENSE')
  const [editCat, setEditCat] = useState<(DTransactionCategory | DTaskCategory) | null | undefined>(undefined)

  useEffect(() => {
    seedDefaultCategories()
    seedDefaultTaskCategories()
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ route: string }>).detail
      if (detail?.route === '/categories') setEditCat(null)
    }
    window.addEventListener('sf:new', handler)
    return () => window.removeEventListener('sf:new', handler)
  }, [])

  const finCats = useLiveQuery(() => db.categories.orderBy('order').toArray(), [], [] as DTransactionCategory[])
  const taskCats = useLiveQuery(() => db.taskCategories.orderBy('order').toArray(), [], [] as DTaskCategory[])
  const allTxns = useLiveQuery(() => db.transactions.toArray(), [], [])
  const allTasks = useLiveQuery(() => db.tasks.toArray(), [], [])

  const isTask = tab === 'TASK'

  const visibleFin = finCats.filter(c => tab === 'EXPENSE' ? c.type === 'EXPENSE' || c.type === 'BOTH' : c.type === 'INCOME' || c.type === 'BOTH')
  const systemFin = visibleFin.filter(c => c.isDefault)
  const userFin = visibleFin.filter(c => !c.isDefault)
  const systemTask = taskCats.filter(c => c.isDefault)
  const userTask = taskCats.filter(c => !c.isDefault)

  async function deleteFinCat(c: DTransactionCategory) {
    if (c.isDefault || !confirm(`Delete "${c.name}"?`)) return
    if (c.id) await db.categories.delete(c.id)
  }
  async function deleteTaskCat(c: DTaskCategory) {
    if (c.isDefault || !confirm(`Delete "${c.name}"?`)) return
    if (c.id) await db.taskCategories.delete(c.id)
  }

  function CatRow({ c, isSystem, onEdit, onDelete, count }: {
    c: DTransactionCategory | DTaskCategory
    isSystem: boolean
    onEdit: () => void
    onDelete: () => void
    count: number
  }) {
    return (
      <div className="sf-cat-row">
        <div className="sf-cat-circle" style={{ background: c.color }}>{c.icon}</div>
        <div>
          <div className="sf-cat-name">{c.name}</div>
          <div className="sf-cat-count">{count} {isTask ? 'task' : 'transaction'}{count === 1 ? '' : 's'}</div>
        </div>
        <div style={{ flex: 1 }} />
        {isSystem ? (
          <div className="sf-cat-count">system</div>
        ) : (
          <div className="sf-cat-actions">
            <button className="sf-icon-btn" title="Edit" onClick={onEdit}><Edit2 size={14} /></button>
            <button className="sf-icon-btn" title="Delete" onClick={onDelete}><Trash2 size={14} /></button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Tabs */}
      <div className="sf-fin-toolbar">
        <div className="sf-cat-tabs">
          {(['EXPENSE','INCOME','TASK'] as const).map(t => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button className="sf-btn sf-btn-primary" onClick={() => setEditCat(null)}>
          <Plus size={15} /> New
        </button>
      </div>

      {isTask ? (
        <>
          <div className="sf-rec-section-label">System task categories</div>
          <div className="sf-cat-grid">
            {systemTask.map(c => (
              <CatRow
                key={c.slug}
                c={c}
                isSystem={true}
                onEdit={() => setEditCat(c)}
                onDelete={() => deleteTaskCat(c)}
                count={allTasks.filter(t => t.linkedCategory === c.slug).length}
              />
            ))}
          </div>
          <div className="sf-rec-section-label">
            <span>My task categories</span>
            <span className="sf-section-badge">Yours</span>
          </div>
          {userTask.length === 0 ? (
            <div className="sf-empty" style={{ padding: '30px 20px' }}>
              <div className="sf-empty-text">No custom task categories yet.</div>
              <button className="sf-btn sf-btn-secondary mt-2" onClick={() => setEditCat(null)}>
                <Plus size={14} /> Create your first
              </button>
            </div>
          ) : (
            <div className="sf-cat-grid">
              {userTask.map(c => (
                <CatRow
                  key={c.slug}
                  c={c}
                  isSystem={false}
                  onEdit={() => setEditCat(c)}
                  onDelete={() => deleteTaskCat(c)}
                  count={allTasks.filter(t => t.linkedCategory === c.slug).length}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="sf-rec-section-label">System categories</div>
          <div className="sf-cat-grid">
            {systemFin.map(c => (
              <CatRow
                key={c.slug}
                c={c}
                isSystem={true}
                onEdit={() => setEditCat(c)}
                onDelete={() => deleteFinCat(c)}
                count={allTxns.filter(t => t.categorySlug === c.slug).length}
              />
            ))}
          </div>
          <div className="sf-rec-section-label">
            <span>My categories</span>
            <span className="sf-section-badge">Yours</span>
          </div>
          {userFin.length === 0 ? (
            <div className="sf-empty" style={{ padding: '30px 20px' }}>
              <div className="sf-empty-text">No custom categories yet.</div>
              <button className="sf-btn sf-btn-secondary mt-2" onClick={() => setEditCat(null)}>
                <Plus size={14} /> Create your first →
              </button>
            </div>
          ) : (
            <div className="sf-cat-grid">
              {userFin.map(c => (
                <CatRow
                  key={c.slug}
                  c={c}
                  isSystem={false}
                  onEdit={() => setEditCat(c)}
                  onDelete={() => deleteFinCat(c)}
                  count={allTxns.filter(t => t.categorySlug === c.slug).length}
                />
              ))}
            </div>
          )}
        </>
      )}

      {editCat !== undefined && (
        <CategoryModal
          initial={editCat}
          isTask={isTask}
          onClose={() => setEditCat(undefined)}
        />
      )}
    </>
  )
}
