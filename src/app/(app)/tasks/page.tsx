'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Calendar, Check } from 'lucide-react'
import { db, type DTask, type DTaskCategory } from '@/db/dexie'
import { useTasksStore } from '@/store/tasksStore'
import { useSettingsStore } from '@/store/settingsStore'
import { seedDefaultTaskCategories } from '@/db/seeds'
import { formatCurrency, todayISO, parseISO, formatISO } from '@/lib/utils'
import { useTasks, useTaskCategories, sortTasks, taskDueInfo } from '@/modules/tasks/hooks/useTasks'
import { TaskModal } from '@/modules/tasks/components/TaskModal'

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_INITIALS = ['S','M','T','W','T','F','S']

function TaskRow({
  task,
  categories,
  onEdit,
  onToggle,
  onDelete,
}: {
  task: DTask
  categories: DTaskCategory[]
  onEdit: (t: DTask) => void
  onToggle: (t: DTask) => void
  onDelete: (t: DTask) => void
}) {
  const due = taskDueInfo(task.dueDate)
  const cat = task.linkedCategory ? categories.find(c => c.slug === task.linkedCategory) : null
  const isOverdue = !task.completed && due.days !== null && due.days < 0
  const priColor = task.priority === 'URGENT' ? '#c73e3e'
    : task.priority === 'HIGH' ? 'var(--expense)'
    : task.priority === 'MEDIUM' ? 'var(--pending)'
    : 'var(--text-tertiary)'

  return (
    <div
      className={`sf-task-row${task.completed ? ' done' : ''}${isOverdue ? ' overdue' : ''}`}
      onClick={e => {
        if ((e.target as HTMLElement).closest('.sf-task-check, .sf-task-actions')) return
        onEdit(task)
      }}
    >
      <button
        className={`sf-task-check${task.completed ? ' done' : ''}`}
        onClick={e => { e.stopPropagation(); onToggle(task) }}
      >
        {task.completed && <Check size={11} />}
      </button>

      <div className="sf-task-body">
        <div className="sf-task-title">{task.title}</div>
        <div className="sf-task-meta">
          {task.dueDate && (
            <span className={`sf-task-tag ${due.klass}`}>
              <Calendar size={10} /> {due.label}
            </span>
          )}
          {(task.timeFrom || task.timeTo) && (
            <span className="sf-task-time-badge">
              {task.timeFrom ?? '--:--'}–{task.timeTo ?? '--:--'}
            </span>
          )}
          <span className="sf-task-tag">
            <span className="sf-priority-dot" style={{ background: priColor }} />
            {task.priority === 'URGENT' ? 'Urgent' : task.priority === 'HIGH' ? 'High' : task.priority === 'MEDIUM' ? 'Medium' : 'Low'}
          </span>
          {cat && (
            <span
              className="sf-task-tag"
              style={{
                background: `color-mix(in oklab, ${cat.color} 14%, transparent)`,
                color: cat.color,
              }}
            >
              {cat.icon} {cat.name}
            </span>
          )}
        </div>
      </div>

      {task.amount ? (
        <div className="sf-task-amount">{formatCurrency(task.amount)}</div>
      ) : <div />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {task.isPinned && <span title="Daily pinned task" style={{ fontSize: 14 }}>📌</span>}
        <div className="sf-task-actions">
          <button className="sf-icon-btn" onClick={e => { e.stopPropagation(); onEdit(task) }}>
            <Edit2 size={14} />
          </button>
          <button className="sf-icon-btn" onClick={e => { e.stopPropagation(); onDelete(task) }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductivitySection({ tasks }: { tasks: DTask[] }) {
  const pinned = tasks.filter(t => t.isPinned)
  const todayStr = todayISO()

  if (pinned.length === 0) {
    return (
      <div className="sf-prod-section">
        <div className="sf-task-section-label">Productivity</div>
        <div className="sf-prod-card">
          <div className="sf-prod-grid">
            <div>
              <div><span className="sf-streak-flame">🔥</span><span className="sf-streak-num">0</span></div>
              <div className="sf-streak-label">day streak</div>
              <div className="sf-streak-sub">Pin a daily task to start tracking your streak.</div>
            </div>
            <div className="sf-prod-bars">
              {DAY_INITIALS.map((d, i) => (
                <div key={i} className="sf-prod-bar-col">
                  <div className="sf-prod-bar-pct" />
                  <div className="sf-prod-bar" style={{ height: 3, opacity: 0.4 }} />
                  <div className="sf-prod-bar-day">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function dayCompletion(dateStr: string) {
    const completed = pinned.filter(t => t.pinHistory?.[dateStr]).length
    return { completed, total: pinned.length, pct: Math.round((completed / pinned.length) * 100) }
  }

  // Streak
  let streak = 0
  const cursor = parseISO(todayStr)
  for (let i = 0; i < 365; i++) {
    const ds = formatISO(cursor)
    const dc = dayCompletion(ds)
    if (dc.completed === dc.total && dc.total > 0) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      if (i === 0) { cursor.setDate(cursor.getDate() - 1); continue }
      break
    }
  }

  // Last 7 days bars
  const bars = Array.from({ length: 7 }, (_, i) => {
    const d = parseISO(todayStr)
    d.setDate(d.getDate() - (6 - i))
    const ds = formatISO(d)
    const dc = dayCompletion(ds)
    return { dayLabel: DAY_INITIALS[d.getDay()], pct: dc.pct, isToday: ds === todayStr }
  })

  return (
    <div className="sf-prod-section">
      <div className="sf-task-section-label">Productivity</div>
      <div className="sf-prod-card">
        <div className="sf-prod-grid">
          <div>
            <div><span className="sf-streak-flame">🔥</span><span className="sf-streak-num">{streak}</span></div>
            <div className="sf-streak-label">day streak</div>
            <div className="sf-streak-sub">Based on your pinned daily tasks</div>
          </div>
          <div className="sf-prod-bars">
            {bars.map((b, i) => (
              <div key={i} className="sf-prod-bar-col">
                <div className="sf-prod-bar-pct">{b.pct > 0 ? `${b.pct}%` : ''}</div>
                <div
                  className={`sf-prod-bar${b.isToday ? ' today' : ''}`}
                  style={{ height: Math.max(3, (b.pct / 100) * 110) }}
                  title={`${b.pct}%`}
                />
                <div className={`sf-prod-bar-day${b.isToday ? ' today' : ''}`}>{b.dayLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { filter, activeDate, setFilter, setActiveDate, shiftActiveDate } = useTasksStore()
  const { currency } = useSettingsStore()
  const [editTask, setEditTask] = useState<DTask | null | undefined>(undefined)
  const [quickText, setQuickText] = useState('')

  useEffect(() => { seedDefaultTaskCategories() }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ route: string }>).detail
      if (detail?.route === '/tasks') setEditTask(null)
    }
    window.addEventListener('sf:new', handler)
    return () => window.removeEventListener('sf:new', handler)
  }, [])

  const tasks = useTasks()
  const categories = useTaskCategories()

  const todayStr = todayISO()
  const activeDateStr = activeDate ?? todayStr
  const isToday = activeDateStr === todayStr
  const activeDateObj = parseISO(activeDateStr)
  const today = new Date(); today.setHours(0,0,0,0)

  const open = tasks.filter(t => !t.completed)
  const done = tasks.filter(t => t.completed)

  const counts = {
    all:     open.length,
    today:   open.filter(t => { if (!t.dueDate) return false; const d = parseISO(t.dueDate); d.setHours(0,0,0,0); return d.getTime() === today.getTime() }).length,
    overdue: open.filter(t => { if (!t.dueDate) return false; const d = parseISO(t.dueDate); d.setHours(0,0,0,0); return d.getTime() < today.getTime() }).length,
    week:    open.filter(t => { if (!t.dueDate) return false; const wk = new Date(today); wk.setDate(wk.getDate() + 7); return parseISO(t.dueDate) <= wk }).length,
    high:    open.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length,
  }

  let visibleOpen: DTask[]
  const inDayView = !isToday

  if (inDayView) {
    visibleOpen = tasks.filter(t => t.isPinned || t.dueDate === activeDateStr)
  } else {
    visibleOpen = open
    if (filter === 'today') {
      visibleOpen = open.filter(t => { if (!t.dueDate) return false; const d = parseISO(t.dueDate); d.setHours(0,0,0,0); return d.getTime() === today.getTime() })
    } else if (filter === 'overdue') {
      visibleOpen = open.filter(t => { if (!t.dueDate) return false; const d = parseISO(t.dueDate); d.setHours(0,0,0,0); return d.getTime() < today.getTime() })
    } else if (filter === 'week') {
      const wk = new Date(today); wk.setDate(wk.getDate() + 7)
      visibleOpen = open.filter(t => t.dueDate && parseISO(t.dueDate) <= wk)
    } else if (filter === 'high') {
      visibleOpen = open.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT')
    }
  }

  const completedThisWeek = done.filter(t =>
    t.completedAt && (Date.now() - new Date(t.completedAt).getTime()) < 7 * 86400000
  ).length
  const totalIntent = open.reduce((s, t) => s + (t.amount ?? 0), 0)

  async function toggleTask(task: DTask) {
    if (!task.id) return
    const nowComplete = !task.completed
    const update: Partial<DTask> = {
      completed: nowComplete,
      completedAt: nowComplete ? new Date().toISOString() : null,
    }
    if (task.isPinned) {
      const ph = { ...(task.pinHistory ?? {}) }
      if (nowComplete) ph[activeDateStr] = true
      else delete ph[activeDateStr]
      update.pinHistory = ph
    }
    await db.tasks.update(task.id, update)
  }

  async function deleteTask(task: DTask) {
    if (!task.id || !confirm('Delete this task?')) return
    await db.tasks.delete(task.id)
  }

  async function handleQuickAdd(text: string) {
    if (!text.trim()) return
    let title = text
    let dueDate: string | null = null
    let amount: number | null = null
    let priority: DTask['priority'] = 'MEDIUM'

    const moneyMatch = text.match(/\$\s?([\d,]+(?:\.\d{1,2})?)/)
    if (moneyMatch) {
      const cents = Math.round(parseFloat(moneyMatch[1].replace(/,/g,'')) * 100)
      if (cents > 0) amount = cents
      title = title.replace(moneyMatch[0], '').trim()
    }

    const t2 = new Date(); t2.setHours(0,0,0,0)
    const lower = title.toLowerCase()
    if (/\btoday\b/i.test(lower)) {
      dueDate = todayStr; title = title.replace(/\btoday\b/i, '').trim()
    } else if (/\btomorrow\b/i.test(lower)) {
      const tom = new Date(t2); tom.setDate(tom.getDate() + 1)
      dueDate = formatISO(tom); title = title.replace(/\btomorrow\b/i, '').trim()
    }

    if (/\b(urgent|asap|!!)\b/i.test(title)) {
      priority = 'HIGH'; title = title.replace(/\b(urgent|asap|!!)\b/gi, '').trim()
    }

    title = title.replace(/\s+/g, ' ').trim()
    if (!title) return

    await db.tasks.add({
      remoteId: null, userId: 'demo',
      title, notes: null, dueDate, priority,
      linkedCategory: null, isPinned: false,
      timeFrom: null, timeTo: null,
      completed: false, completedAt: null, pinHistory: {},
      amount, createdAt: new Date(), _dirty: true,
    })
    setQuickText('')
  }

  const dayLabel = isToday ? 'Today'
    : `${WEEKDAYS[activeDateObj.getDay()]}, ${MONTHS_SHORT[activeDateObj.getMonth()]} ${activeDateObj.getDate()}`

  return (
    <>
      {/* Toolbar */}
      <div className="sf-task-toolbar">
        <div className="sf-task-filter-pills">
          {([
            ['all',     'All',       counts.all],
            ['today',   'Today',     counts.today],
            ['overdue', 'Overdue',   counts.overdue],
            ['week',    'This week', counts.week],
            ['high',    'High',      counts.high],
          ] as const).map(([id, label, count]) => (
            <button
              key={id}
              className={filter === id ? 'active' : ''}
              onClick={() => setFilter(id)}
            >
              {label}
              {count > 0 && <span className="sf-task-filter-count">{count}</span>}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sf-date-nav">
            <button className="sf-arrow" onClick={() => shiftActiveDate(-1)}>
              <ChevronLeft size={13} />
            </button>
            <span className="sf-date-nav-label">{dayLabel}</span>
            <button className="sf-arrow" onClick={() => shiftActiveDate(1)}>
              <ChevronRight size={13} />
            </button>
            <button
              className={`sf-today-pill${isToday ? ' active' : ''}`}
              onClick={() => setActiveDate(null)}
            >
              Today
            </button>
          </div>
          <button className="sf-btn sf-btn-primary" onClick={() => setEditTask(null)}>
            <Plus size={15} /> New task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="sf-task-stats">
        <div className="sf-stat-card">
          <div className="sf-stat-label">Open</div>
          <div className="sf-stat-value">{open.length}</div>
          <div className="sf-stat-trend">{counts.overdue} overdue</div>
        </div>
        <div className="sf-stat-card">
          <div className="sf-stat-label">Done this week</div>
          <div className="sf-stat-value" style={{ color: 'var(--income)' }}>{completedThisWeek}</div>
          <div className="sf-stat-trend up">✓ Completed</div>
        </div>
        <div className="sf-stat-card">
          <div className="sf-stat-label">High priority</div>
          <div className="sf-stat-value" style={{ color: 'var(--expense)' }}>{counts.high}</div>
          <div className="sf-stat-trend">{counts.high === 0 ? 'All clear' : 'Needs attention'}</div>
        </div>
        <div className="sf-stat-card">
          <div className="sf-stat-label">Tracked intent</div>
          <div className="sf-stat-value">{formatCurrency(totalIntent, currency)}</div>
          <div className="sf-stat-trend">Across open tasks</div>
        </div>
      </div>

      {/* Quick add (today only) */}
      {isToday && (
        <div className="sf-task-quick-add">
          <Plus size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder='Add a task and press Enter — try "Move $300 to savings tomorrow"'
            value={quickText}
            onChange={e => setQuickText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && quickText.trim()) handleQuickAdd(quickText)
            }}
          />
          <span className="sf-task-quick-add-hint"><kbd>Enter</kbd></span>
        </div>
      )}

      {/* Task list */}
      {inDayView && (
        <div className="sf-task-section-label" style={{ marginTop: 4, marginBottom: 8 }}>
          <span>{dayLabel}</span>
          <span style={{ flex: 'none', color: 'var(--text-tertiary)', fontSize: 11 }}>Day view</span>
        </div>
      )}
      {inDayView ? (
        <>
          {visibleOpen.filter(t => t.isPinned).length > 0 && (
            <>
              <div className="sf-task-section-label">Daily pinned · {visibleOpen.filter(t => t.isPinned).length}</div>
              {visibleOpen.filter(t => t.isPinned).map(t => (
                <TaskRow key={t.id} task={t} categories={categories} onEdit={setEditTask} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </>
          )}
          {visibleOpen.filter(t => !t.isPinned).length > 0 && (
            <>
              <div className="sf-task-section-label">Due that day · {visibleOpen.filter(t => !t.isPinned).length}</div>
              {sortTasks(visibleOpen.filter(t => !t.isPinned)).map(t => (
                <TaskRow key={t.id} task={t} categories={categories} onEdit={setEditTask} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </>
          )}
          {visibleOpen.length === 0 && (
            <div className="sf-empty" style={{ marginBottom: 14 }}>
              <div className="sf-empty-title">Nothing scheduled</div>
              <div className="sf-empty-text">No tasks were due on this day.</div>
            </div>
          )}
        </>
      ) : (
        <>
          {visibleOpen.length === 0 && done.length === 0 ? (
            <div className="sf-empty">
              <div className="sf-empty-title">No tasks yet</div>
              <div className="sf-empty-text">Track financial intentions, follow-ups, and reviews here.</div>
              <button className="sf-btn sf-btn-primary" style={{ marginTop: 8 }} onClick={() => setEditTask(null)}>Add your first</button>
            </div>
          ) : (
            <>
              {visibleOpen.length > 0 ? (
                <>
                  <div className="sf-task-section-label">Open · {visibleOpen.length}</div>
                  {sortTasks(visibleOpen).map(t => (
                    <TaskRow key={t.id} task={t} categories={categories} onEdit={setEditTask} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </>
              ) : (
                <div className="sf-empty" style={{ padding: '32px 20px', marginBottom: 14 }}>
                  <div className="sf-empty-title">{filter === 'all' ? 'Inbox zero' : 'Nothing here'}</div>
                  <div className="sf-empty-text">{filter === 'all' ? 'Every open task is handled.' : 'Try another filter or add a task.'}</div>
                </div>
              )}
              {done.length > 0 && (
                <>
                  <div className="sf-task-section-label">Completed · {done.length}</div>
                  {sortTasks(done).slice(0, 20).map(t => (
                    <TaskRow key={t.id} task={t} categories={categories} onEdit={setEditTask} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}

      <ProductivitySection tasks={tasks} />

      {/* Modal */}
      {editTask !== undefined && (
        <TaskModal
          initial={editTask}
          taskCategories={categories}
          onClose={() => setEditTask(undefined)}
        />
      )}
    </>
  )
}
