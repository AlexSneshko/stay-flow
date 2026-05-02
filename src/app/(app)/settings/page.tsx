'use client'

import { useTheme } from 'next-themes'
import { Check, Download } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/dexie'
import { todayISO } from '@/lib/utils'

const ACCENT_OPTIONS = ['#2d4dff', '#8a6bc8', '#d97757', '#0f8f5a', '#c73e3e']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY']

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const {
    currency, setCurrency,
    weekStartsOn, setWeekStartsOn,
    accentColor, setAccentColor,
    roundToNearestDollar, setRoundToNearestDollar,
  } = useSettingsStore()

  const allTxns = useLiveQuery(() => db.transactions.toArray(), [], [])
  const allRec = useLiveQuery(() => db.recurringTransactions.toArray(), [], [])
  const allCats = useLiveQuery(() => db.categories.toArray(), [], [])
  const allTasks = useLiveQuery(() => db.tasks.toArray(), [], [])

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      transactions: allTxns,
      recurring: allRec,
      categories: allCats,
      tasks: allTasks,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stayflow-export-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Profile */}
      <div className="sf-settings-section">
        <div className="sf-settings-title">Profile</div>
        <div className="sf-settings-card">
          <div className="sf-settings-row">
            <div className="sf-avatar lg" style={{ background: accentColor }}>AM</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>Alex Mercer</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>alex@mercer.dev</div>
            </div>
            <button className="sf-btn sf-btn-secondary">Edit</button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="sf-settings-section">
        <div className="sf-settings-title">Appearance</div>
        <div className="sf-settings-card">
          <div className="sf-settings-row">
            <div>
              <div className="sf-settings-row-label">Theme</div>
              <div className="sf-settings-row-sub">Light, auto, or dark across the app.</div>
            </div>
            <div className="sf-cat-tabs">
              {(['light', 'system', 'dark'] as const).map(t => (
                <button
                  key={t}
                  className={theme === t ? 'active' : ''}
                  onClick={() => setTheme(t)}
                >
                  {t === 'system' ? 'Auto' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="sf-settings-row">
            <div>
              <div className="sf-settings-row-label">Accent color</div>
              <div className="sf-settings-row-sub">Applied everywhere accents appear.</div>
            </div>
            <div className="sf-swatch-row">
              {ACCENT_OPTIONS.map(col => (
                <div
                  key={col}
                  className={`sf-swatch${accentColor === col ? ' active' : ''}`}
                  style={{ background: col }}
                  onClick={() => {
                    setAccentColor(col)
                    document.documentElement.style.setProperty('--accent', col)
                  }}
                >
                  {accentColor === col && <Check size={14} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Finance */}
      <div className="sf-settings-section">
        <div className="sf-settings-title">Finance</div>
        <div className="sf-settings-card">
          <div className="sf-settings-row">
            <div>
              <div className="sf-settings-row-label">Default currency</div>
              <div className="sf-settings-row-sub">Used for new transactions and totals.</div>
            </div>
            <select
              className="sf-select"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sf-settings-row">
            <div>
              <div className="sf-settings-row-label">Week starts on</div>
              <div className="sf-settings-row-sub">Affects the spend calendar layout.</div>
            </div>
            <div className="sf-cat-tabs">
              <button className={weekStartsOn === 0 ? 'active' : ''} onClick={() => setWeekStartsOn(0)}>Sun</button>
              <button className={weekStartsOn === 1 ? 'active' : ''} onClick={() => setWeekStartsOn(1)}>Mon</button>
            </div>
          </div>
          <div className="sf-settings-row">
            <div>
              <div className="sf-settings-row-label">Round to nearest dollar</div>
              <div className="sf-settings-row-sub">Display whole-dollar amounts only (visual).</div>
            </div>
            <div
              className={`sf-switch${roundToNearestDollar ? ' on' : ''}`}
              onClick={() => setRoundToNearestDollar(!roundToNearestDollar)}
              role="switch"
              aria-checked={roundToNearestDollar}
            />
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="sf-settings-section">
        <div className="sf-settings-title">Data</div>
        <div className="sf-settings-card">
          <div className="sf-settings-row">
            <div>
              <div className="sf-settings-row-label">Export all data</div>
              <div className="sf-settings-row-sub">Download a JSON file of everything StayFlow stores locally.</div>
            </div>
            <button className="sf-btn sf-btn-secondary" onClick={exportData}>
              <Download size={14} /> Export
            </button>
          </div>
          <div className="sf-settings-row">
            <div>
              <div className="sf-settings-row-label" style={{ color: 'var(--expense)' }}>Reset sample data</div>
              <div className="sf-settings-row-sub">Clear local state and reload with fresh seed.</div>
            </div>
            <button
              className="sf-btn sf-btn-secondary"
              onClick={() => {
                if (confirm('Reset all StayFlow data?')) {
                  indexedDB.deleteDatabase('stayflow-v1')
                  localStorage.clear()
                  window.location.reload()
                }
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
