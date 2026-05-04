# StayFlow Code Audit

Date: 2026-05-04
Auditor: Claude (per `prompts/STAYFLOW_AUDIT_PROMPT.md`)
Scope: Full pre-launch audit across Money/Amounts, Offline/Data Integrity, Tasks Logic, React/UI, TypeScript Strict, Security/Data, Performance, Edge Cases.
Method: Deep static analysis of `src/`, `prisma/`, config, and seeds. Findings reference exact `file:line`. No code was changed; this report only documents.

---

## CRITICAL (must fix before launch)

### BUG-MNY-001: FinanceChart Y-axis labels are off by 100×
**Location:** `src/modules/finance/components/FinanceChart.tsx:38-39, 49, 53-57`
**Description:** `data.income` and `data.expense` are in **integer cents** (passed straight from `sumAmount()` which sums Dexie `amount` cents). The chart computes `maxVal = Math.max(...incVals, ...expVals, 100)` and renders Y-axis tick labels via `fmtShort(v)` which formats raw values as dollars (`v >= 1000 ? '$' + (v/1000).toFixed(0) + 'K' : '$' + v`). A user who actually spends $50 in a month sees axis labels reading "$5K" — the labels misrepresent the values by 100× (cents shown as dollars).
**Reproduction:** Add a $50 expense and a $500 income for the current month. Open Finance page → chart axis labels read "$5K" / "$50K" instead of "$50" / "$500". The relative shape of curves is correct; only the labels lie.
**Impact:** Major user trust failure on the only chart in the app. Every user-visible $ figure on the chart axis is wrong.
**Fix:** Convert cents to dollars before tick formatting. Either pass dollars to the chart or change `fmtShort` to divide by 100 first:
```ts
const fmtShort = (cents: number) => {
  const dollars = cents / 100
  return dollars >= 1000 ? `$${(dollars / 1000).toFixed(0)}K` : `$${dollars.toFixed(0)}`
}
```
Also use `currency` from settings instead of hardcoded `$`. (See BUG-MNY-006.)

### BUG-OFF-001: Confirming a PENDING transaction never sets `_dirty: true`
**Location:** `src/modules/finance/components/TransactionList.tsx:104-106`; same bug in `src/app/(app)/dashboard/page.tsx:214`
**Description:** `db.transactions.update(id, { status: 'CONFIRMED' })` does NOT include `_dirty: true`. Project rule (CLAUDE.md): *"Offline-first: ALL writes go to Dexie first (`_dirty: true`), server sync is secondary."* When server sync is implemented, every confirmed-from-PENDING transaction will be invisible to the sync engine because its dirty bit was already cleared by an earlier PENDING insert (which itself isn't currently set when the recurring processor lands). End-state: a user's confirmation action never propagates to the server.
**Reproduction:** With sync wired (future), confirm a PENDING txn. Inspect Dexie: `_dirty === false`. Sync loop skips it. Server forever sees the txn as PENDING.
**Impact:** Silent sync data loss for the most common write in the app once server sync is wired.
**Fix:** Add `_dirty: true` to both updates:
```ts
await db.transactions.update(id, { status: 'CONFIRMED', _dirty: true })
```

### BUG-OFF-002: Pause/resume of recurring transaction never sets `_dirty: true`
**Location:** `src/app/(app)/recurring/page.tsx:53-56`
**Description:** `db.recurringTransactions.update(item.id, { active: !item.active })` omits `_dirty: true`. Same offline-first violation as BUG-OFF-001 — pause/resume never syncs to server.
**Impact:** User-visible state diverges from server forever once sync lands.
**Fix:** `db.recurringTransactions.update(item.id, { active: !item.active, _dirty: true })`.

### BUG-OFF-003: Dashboard task toggle never sets `_dirty: true` AND drops `pinHistory`
**Location:** `src/app/(app)/dashboard/page.tsx:67-75`
**Description:** Two bugs in the same function:
1. `db.tasks.update(id, { completed: !t.completed, completedAt: ... })` omits `_dirty: true`.
2. For pinned tasks, the function **doesn't update `pinHistory`** the way `tasks/page.tsx:252-266` does. Toggling a pinned task from the Dashboard breaks the per-day completion tracking — the streak / 7-day chart silently desynchronize from the toggle.
**Reproduction:** From Dashboard, click the checkbox on a pinned task. Open Tasks page → streak/7-day chart unchanged because `pinHistory[today]` was never written.
**Impact:** Inconsistent task semantics across surfaces; sync miss; streak math wrong.
**Fix:** Mirror the logic in `tasks/page.tsx:toggleTask` (read pinHistory, mutate, save) and always include `_dirty: true`. Better: extract `toggleTask(task, activeDate?)` into a single shared helper in `src/modules/tasks/hooks/useTasks.ts` and call it from both surfaces.

### BUG-MNY-002: No recurring-transaction processor exists
**Location:** Missing — search shows no `useRecurringProcessor`, no auto-creation logic anywhere. `RecurringModal` exists; `recurring/page.tsx` exists; nothing creates PENDING transactions from active recurring entries.
**Description:** Per ECOSYSTEM.md: *"PENDING for auto-created recurring transactions"*. Per COORDINATION.md "Next Session" item: `useRecurringProcessor`. Today, the user can create a recurring entry but **no PENDING transaction is ever auto-generated**. The "Last 5 transactions" PENDING + Confirm flow is a UI dead branch in production usage.
**Impact:** Headline feature (recurring) is non-functional end-to-end. Sidebar widget "Next recurring" works only because the user manually entered a `nextDueDate`, but nothing acts on it.
**Fix:** Implement `useRecurringProcessor()` (run on mount in `(app)/layout.tsx` or a higher layout):
- Iterate all `active` recurring entries.
- For each entry where `nextDueDate <= today`, in a Dexie transaction:
  1. Insert PENDING `DTransaction` with `recurringId = String(entry.id)`, copy `amount/type/categorySlug/currency`, `status: 'PENDING'`, `_dirty: true`.
  2. Advance `nextDueDate` by `frequency` (use `date-fns addDays/addWeeks/addMonths/addYears`). For MONTHLY use `setDate(min(dayOfMonth, daysInMonth))` to handle Feb-31 gracefully.
  3. Set `_dirty: true` on the recurring entry.
- Cap at e.g. 60 iterations per entry per processor run to avoid creating 90 PENDINGs after 3 months of inactivity.
- Use a per-entry "lock" key in localStorage (`sf:recproc:lock`) with a short TTL to deduplicate cross-tab runs.

### BUG-OFF-004: Dexie schema upgrade `v1 → v2` has no `.upgrade()` callback
**Location:** `src/db/dexie.ts:107-122`
**Description:** Per COORDINATION.md: *"Dexie schema bumped to v2 (categorySlug rename, DTask redesign)"*. The constructor declares `this.version(2).stores({...})` but no `.upgrade()` migration is provided. Existing v1 installs (if any user installed the app before the rename) will have rows with the old field names; on first open against v2 schema, queries against `categorySlug` return empty / undefined, and Dexie silently keeps the old data with no migration path.
**Impact:** Any user with v1 data loses access to their data on the v1→v2 upgrade.
**Fix:** Either accept the breaking change explicitly (delete v1 DB on upgrade) or add a proper migration:
```ts
this.version(2).stores({...}).upgrade(async (tx) => {
  await tx.table('transactions').toCollection().modify((t) => {
    if (t.category && !t.categorySlug) {
      t.categorySlug = t.category
      delete t.category
    }
  })
  // ...repeat for tasks, recurring, categories
})
```
Pre-launch the right call may be: bump to `v3` with an explicit `.upgrade()` and a fallback that wipes if the migration cannot complete.

### BUG-MNY-003: `monthlyCommit` (and many sums) blindly mix currencies
**Location:** `src/app/(app)/recurring/page.tsx:34-42`; `src/modules/finance/hooks/useFinanceData.ts:30-39` (via `monthStats`); `src/modules/finance/components/SpendCalendar.tsx:50` (perDay sum); `src/modules/finance/components/TransactionList.tsx:71-73` (group total); `src/app/(app)/dashboard/page.tsx:38-39, 56`; `src/app/(app)/tasks/page.tsx:250` (`totalIntent`).
**Description:** All summation paths treat `amount` as raw cents and ignore the per-row `currency` field. If a user has any mix of USD + RUB + JPY transactions (or recurring), totals add cents across currencies as if they were the same denomination, then format with the *current* `settings.currency` symbol — silently wrong. Example: $100 USD + ¥1,000 JPY (which is also stored as 100,000 cents because JPY has no minor unit) → summed → displayed as `$1,100.00`.
**Impact:** Headline finance numbers are wrong for any multi-currency user. ¥/JPY is especially broken because JPY has no decimal subunit but the app stores all amounts as "cents".
**Fix:** Two parts:
1. **Either** restrict the app to single-currency at the user level (drop the per-row `currency` field; use `settings.currency`), **or**
2. Change every aggregator to group by currency and either (a) refuse to display a single total when mixed and instead show "$120 USD + ¥1,000 JPY", or (b) introduce an FX-conversion service.
For JPY specifically: the input modal stores user input directly in "cents" — for JPY the displayed `$12.50` math doesn't apply. Need explicit handling per currency's minor-unit count.

---

## HIGH (fix before launch)

### BUG-OFF-005: `Sidebar` query `where('active').equals(1)` cannot match boolean `true`
**Location:** `src/components/layout/Sidebar.tsx:26-31` (query); `src/modules/finance/components/RecurringModal.tsx:106` and `:53` (writes `active: true` boolean).
**Description:** Dexie/IndexedDB cannot index booleans natively. The Sidebar query uses the common workaround `equals(1)` to look up "active recurring", but RecurringModal writes `active: true` (the JS boolean), not `1`. The query will return nothing, even when active recurring exist.
**Reproduction:** Add a recurring with `active: true`. Open Sidebar → "Next recurring" widget never renders. (Same root cause if WEEKLY filtering is ever added on `active`.)
**Impact:** Sidebar feature visibly broken for every user with recurring.
**Fix:** Two options:
- Easy: change writes to `active: item.active ? 1 : 0` and the type on `DRecurringTransaction.active` to `0 | 1`. Update all reads.
- Better: drop the `active` index entirely (remove from `stores()` schema string), and `.filter(r => r.active)` in JS — fine for the small N of recurring entries.

### BUG-MNY-004: % vs last month divides by zero / sign-blind
**Location:** `src/app/(app)/finance/page.tsx:47-48`; `src/app/(app)/dashboard/page.tsx:49`
**Description:** `incomePct = prevStats.income ? Math.round(((income - prevStats.income) / prevStats.income) * 100) : 0` — if last month income was $0, the chip silently shows "0%" even when this month is +$10,000 (factually a brand-new income, not unchanged). On Dashboard, the analogous `prevNet > 0 ? ... : (net > 0 ? 100 : 0)` is also sign-blind: when prevNet is *negative* (a previous-month loss) and current net is less negative (improvement), it falls through to the `: 0` branch, claiming "0% change".
**Reproduction:** Last month: net = -$500. This month so far: net = -$100. Dashboard greeting reports "0% more" — actually the user is doing 80% better.
**Impact:** Misleading insights on a primary dashboard surface.
**Fix:** Show "—" or "new" when prev is 0, and compute % using absolute prev with proper sign: `pct = prev !== 0 ? Math.round(((cur - prev) / Math.abs(prev)) * 100) : null`. Render `null` as "—" or "new".

### BUG-OFF-006: Deleting a category does not warn about referencing rows; transactions silently orphan
**Location:** `src/app/(app)/categories/page.tsx:195-202` (delete) → no cascade or warning. Resolution falls back to `getCategory` in `src/modules/finance/components/TransactionList.tsx:16-22` which renders the slug as the category name (`name: slug, icon: '•', color: '#888'`).
**Description:** Deleting a custom category that's still referenced by N transactions silently orphans them. The TxnRow then displays the literal slug ("custom-coffee-1714000000000") with a `•` icon and grey color. Worse, `useFinanceSummary` and chart math still include those orphans correctly (they're keyed by slug, not by category id), but the UI looks broken.
**Reproduction:** Create a custom category "Coffee", add a transaction in it, delete the category. The transaction now displays "custom-coffee-1714…" with a `•` dot.
**Impact:** Confusing UX; in worst case a user thinks transactions vanished.
**Fix:** Before deleting, count transactions/tasks referencing the slug; show a warning ("12 transactions use this category — they'll be reassigned to Other"). Then either reassign to `other-expense` / `other-income` or block the delete.

### BUG-RCT-001: Accent color setting only applies live; lost on reload
**Location:** `src/app/(app)/settings/page.tsx:93-95`
**Description:** Accent color is persisted to Zustand (`settingsStore`), but the only place that writes the CSS variable `--accent` is the `onClick` handler in Settings. After a full page reload, the persisted color isn't pushed back to `document.documentElement.style.setProperty('--accent', ...)`. The user sees their accent color revert to the default `#2d4dff` defined in CSS — until they re-click the swatch in Settings.
**Reproduction:** Set accent to red. Reload. Sidebar avatar / sparkline / etc. revert to default blue.
**Impact:** Personalization silently lost across sessions.
**Fix:** In `Providers.tsx` (or a top-level effect in `(app)/layout.tsx`):
```ts
const { accentColor } = useSettingsStore()
useEffect(() => {
  document.documentElement.style.setProperty('--accent', accentColor)
}, [accentColor])
```

### BUG-RCT-002: Dashboard "Alex" / "Alex Mercer" hardcoded everywhere
**Location:** `src/app/(app)/dashboard/page.tsx:105` (`{greet}, Alex.`); `src/components/layout/Sidebar.tsx:92-96` (avatar "AM", name "Alex Mercer", email "alex@mercer.dev"); `src/app/(app)/settings/page.tsx:51-54` (same)
**Description:** Three different surfaces hardcode placeholder identity. With NextAuth wired but not consumed, these will be wrong for every real user.
**Impact:** Embarrassing for any non-Alex visitor; data-leak appearance ("who's Alex Mercer?").
**Fix:** Extract `useCurrentUser()` returning `{ name, email, initials }` (placeholder values until session lands), use it in all three surfaces.

### BUG-OFF-007: Tasks not in Prisma schema; sync impossible
**Location:** `prisma/schema.prisma` (lacks `Task` and `TaskCategory` models); `src/db/dexie.ts:50-79` defines them locally.
**Description:** Tasks, TaskCategories, Notes, Habits exist in Dexie but **not in Prisma**. When server sync is implemented, tasks have no destination table.
**Impact:** Tasks remain forever local-only; users lose tasks if they clear their browser data.
**Fix:** Add `Task` and `TaskCategory` (and Notes/Habits when those modules ship) to `prisma/schema.prisma` mirroring the Dexie schema, run `npm run db:migrate`.

### BUG-RCT-003: Hydration mismatch on theme toggle pills
**Location:** `src/components/layout/TopNav.tsx:38-60`
**Description:** `useTheme()` returns `theme: undefined` during SSR/initial paint, then snaps to the persisted value after `next-themes` hydrates client-side. The "active" class is computed from `theme === 'light' | 'dark' | 'system'`, so on first paint **none** of the three buttons is highlighted (or the wrong one is, then the highlight jumps). React logs a hydration mismatch warning.
**Reproduction:** Hard reload any page. Inspect: theme pill briefly shows no active state, then snaps. DevTools console may warn about hydration.
**Impact:** Visible UI flicker on every navigation/refresh.
**Fix:** Track `mounted` state with `useState`/`useEffect`, render the pills only after mount; or wrap the theme pill component in a `'use client'` component that suspends until `useTheme()` returns a defined value. `next-themes` docs cover this pattern (`mounted` guard).

### BUG-EDG-001: Dashboard `now = new Date()` stale across midnight
**Location:** `src/app/(app)/dashboard/page.tsx:31-35, 43`; same in `src/app/(app)/tasks/page.tsx:215, 287` (`today` set in render path).
**Description:** `now`, `greet`, `dateStr`, `weekNum`, and (critically) `dayCutoff = now.getDate()` are computed at render time. The page is intended for long-running PWA sessions. Open the app at 11:55 PM → at 00:01 AM the greeting still says "Good evening", date still says yesterday, and the "vs prev month same-day" cutoff is one day too early. PENDING confirmations after midnight are bucketed into yesterday for the visual calendar.
**Impact:** Cross-midnight stale state on a PWA designed to stay open.
**Fix:** Wrap `now` in a `useEffect`-tracked state that re-evaluates on a `setInterval` (every minute) or on `visibilitychange`.

### BUG-MNY-005: Quick-add money parsing uses `parseFloat` (float arithmetic)
**Location:** `src/app/(app)/tasks/page.tsx:280-285`
**Description:** `Math.round(parseFloat(moneyMatch[1].replace(/,/g,'')) * 100)` — uses `parseFloat` and floating-point multiplication for monetary input. Although `Math.round` mitigates 99% of cases, this directly violates the project rule "Monetary amounts: store as integer cents". Inputs like `$0.10` get converted via `0.1 * 100 = 10.000000000000002 → round → 10`. Edge case `$2.675` → `267.5 → round → 268` (banker's-round expectation differs).
**Impact:** Style violation; latent rounding edge cases. Quick-add on tasks is the only money path NOT using `parseCurrencyInput()`.
**Fix:** Add a string-based parser that matches the modal's behavior, or reuse `parseCurrencyInput`. Example:
```ts
function parseMoneyToCents(s: string): number {
  const m = s.replace(/[^0-9.]/g, '')
  const [d, c = ''] = m.split('.')
  const dollars = parseInt(d || '0', 10)
  const cents = parseInt((c + '00').slice(0, 2), 10) || 0
  return dollars * 100 + cents
}
```

### BUG-MNY-006: `formatCurrencyShort` always uses `$`
**Location:** `src/lib/utils.ts:25-30`
**Description:** `formatCurrencyShort(cents)` hardcodes `$` symbol; ignores currency. Used nowhere yet (grep returns 0 callers in `src/`), but it's exported and likely to be used; ship-blocker is the chart Y-axis using the same anti-pattern (BUG-MNY-001).
**Impact:** Latent landmine for non-USD users.
**Fix:** Accept a `currency` parameter and use `Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 })`. Update all callers (currently FinanceChart should use this).

### BUG-EDG-002: Currency change mid-month silently breaks all aggregations
**Location:** Interaction of `src/app/(app)/settings/page.tsx:115-122` (currency change) with all aggregator hooks.
**Description:** User starts with USD, accumulates txns. Switches to RUB in Settings. New txns have `currency: 'RUB'`, but `formatCurrency(income, currency)` formats the same raw cents as if they were RUB cents. So a user with $1,000 of historical USD income who switches to RUB will see "₽10.00" (because 100,000 cents formatted as RUB 2-decimal yields 1000.00 ₽, not what's intended).
**Impact:** Switching currency silently corrupts every total displayed.
**Fix:** Either lock currency post-first-transaction, or implement an FX-conversion layer. At minimum, on currency switch show a confirmation: "Existing transactions stay in their original currency. Mixed-currency totals are not supported."

---

## MEDIUM (fix soon)

### BUG-MNY-007: SpendCalendar heatmap thresholds hardcoded in dollars
**Location:** `src/modules/finance/components/SpendCalendar.tsx:27-34, 103`
**Description:** `bgFor(cents)` switches color based on `dollars <= 30 / 100 / 300`. A user in JPY (which has 100x larger nominal values) gets the entire calendar painted the darkest color from day 1. Likewise, the white-text threshold `cents > 10000` ($100) hardcoded.
**Impact:** Heatmap looks broken for non-USD currencies.
**Fix:** Compute thresholds as percentiles of the month's per-day spend, not absolute dollar cuts.

### BUG-MNY-008: Currency mixing in TxnGroup day total
**Location:** `src/modules/finance/components/TransactionList.tsx:71-73, 79`
**Description:** Day-group total sums `amount` cents across rows ignoring per-row currency, then formats with global `currency`. Same pattern as BUG-MNY-003 for a smaller surface.
**Impact:** Daily totals wrong on multi-currency days.
**Fix:** Match the resolution chosen for BUG-MNY-003.

### BUG-OFF-008: Custom category creation can theoretically collide on slug
**Location:** `src/app/(app)/categories/page.tsx:51, 69`
**Description:** Slug is `custom-${slug}-${Date.now()}`. Two creations within the same millisecond produce the same slug. Combined with no unique constraint in Dexie (`stores()` doesn't include `slug` as `&slug` unique), a duplicate could be inserted. Prisma has `@@unique([slug, userId])` so server would reject — meaning sync would fail later.
**Impact:** Very unlikely in practice; latent sync failure if it happens.
**Fix:** Use `crypto.randomUUID()` (or a short nanoid) as the slug suffix instead of `Date.now()`.

### BUG-OFF-009: CategoryModal edit drops `type` and `dayOfWeek` fields
**Location:** `src/app/(app)/categories/page.tsx:46-48, 63-65` (only saves name/icon/color); `src/modules/finance/components/RecurringModal.tsx:82-92` (edit doesn't write `dayOfWeek` and never updates `active`).
**Description:** Editing a finance category cannot change its `type` (EXPENSE/INCOME/BOTH) — the modal shows the type-tab selector, but `handleSave`'s `update` partial omits `type`. Similarly RecurringModal's edit path omits `dayOfWeek` (so a WEEKLY frequency can't be re-targeted to a different day) and `active` (which is OK since pause is handled elsewhere).
**Impact:** UI suggests a change is possible; save silently no-ops.
**Fix:** Include all editable fields in the update partial; if `slug` should remain stable, document that explicitly.

### BUG-RCT-004: `useLiveQuery` returns implicit `any[]` in three hooks
**Location:** `src/modules/finance/hooks/useFinanceData.ts:18-23, 26-28`; `src/modules/tasks/hooks/useTasks.ts:8-10`
**Description:** Default value `[]` (no cast) widens to `any[]`. Project rule: "no `any`". Other hooks (`useAllTransactions`, `useMonthTransactions`) correctly cast. See also BUG-TS-001 in the merged TS audit.
**Fix:** `[] as DTransactionCategory[]` etc. on all three.

### BUG-RCT-005: Settings export silently exports empty file during loading
**Location:** `src/app/(app)/settings/page.tsx:22-25, 27-42`
**Description:** `useLiveQuery(..., [], [])` returns `[]` while loading. If the user clicks Export immediately after entering the Settings page (before Dexie streams complete), the exported JSON contains 4 empty arrays.
**Impact:** Confusing "empty" backup file; user thinks data is lost.
**Fix:** Disable the Export button until all four queries return non-default values, or always re-fetch synchronously inside `exportData()` via `await db.transactions.toArray()`.

### BUG-RCT-006: Settings reset races: `deleteDatabase` doesn't await
**Location:** `src/app/(app)/settings/page.tsx:168-173`
**Description:** `indexedDB.deleteDatabase('stayflow-v1')` is async; `localStorage.clear()` is sync; `window.location.reload()` fires immediately. The reload can happen before deletion settles, causing the next page load to either find old data (deletion didn't complete) or fail to upgrade (deletion in flight collides with new connection).
**Impact:** "Reset" sometimes doesn't reset; sometimes the next load throws a `VersionError`.
**Fix:**
```ts
const req = indexedDB.deleteDatabase('stayflow-v1')
req.onsuccess = req.onerror = req.onblocked = () => {
  localStorage.clear()
  window.location.reload()
}
```

### BUG-EDG-003: New-user first launch: race between seed and first render
**Location:** `src/app/(app)/dashboard/page.tsx:20-23`; `src/app/(app)/finance/page.tsx:26`; `src/app/(app)/tasks/page.tsx:197`; `src/app/(app)/recurring/page.tsx:17`; `src/app/(app)/categories/page.tsx:168-171`
**Description:** Each page calls `seedDefaultCategories()` (and/or task version) inside a `useEffect` with no dependency tracking and no awaiting. Pages load → `useLiveQuery` returns empty array → seed runs → `useLiveQuery` re-fires with the seeded data. There's a brief window where category pickers in modals are empty (TransactionModal opens with `cats[0]?.slug ?? ''` as default → empty string).
**Reproduction:** First-launch user immediately clicks "+ Add" on Finance before seed completes (~50 ms window) → TransactionModal shows no categories.
**Impact:** Edge case but visible to fast-clicking users.
**Fix:** Centralize seeding in a top-level layout effect, await it, then render children. Or use a global `seeded` flag in Zustand.

### BUG-RCT-007: ReactQueryDevtools rendered in production builds
**Location:** `src/components/providers/Providers.tsx:15`
**Description:** `<ReactQueryDevtools />` mounted unconditionally; ships ~50 KB to all users and exposes the query cache.
**Fix:** `{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}` or dynamic import.

### BUG-RCT-008: `tasksStore` and `financeStore` are not persisted
**Location:** `src/store/tasksStore.ts`; `src/store/financeStore.ts`
**Description:** Other Zustand stores (`uiStore`, `settingsStore`) use `persist`. These two don't. `activeMonth` reverts to current YM on every reload (debatable — may be intentional). `tasks.filter` and `tasks.activeDate` reset every reload. Inconsistent UX.
**Fix:** Decide intentionally. If tasks filter should persist, add `persist` middleware. Currently this looks accidental.

### BUG-EDG-004: Recurring `nextDueDate` timezone arithmetic
**Location:** `src/app/(app)/recurring/page.tsx:45, 65`; `src/components/layout/Sidebar.tsx:34`
**Description:** `(new Date(r.nextDueDate).getTime() - Date.now()) / 86400000` — `r.nextDueDate` is `YYYY-MM-DD`. `new Date('2026-05-01')` parses as UTC midnight, `Date.now()` is local. For users west of UTC, this yields off-by-one results ("Due in -1d" or "Due now" a day early).
**Fix:** Use `parseISO(r.nextDueDate)` (the project's helper that uses local-tz constructor) and `differenceInCalendarDays` from `date-fns`.

### BUG-MNY-009: Edit transaction loses `status` on update
**Location:** `src/modules/finance/components/TransactionModal.tsx:83-92`
**Description:** Edit branch's update partial omits `status`, but in the modal `status` is held in local state and could be changed (the field exists in `ModalState`, defaulted from `initial?.status ?? 'CONFIRMED'`). Currently no UI control toggles it, so this is dormant. If a future "PENDING" toggle is added in the modal, edits will silently no-op the change. Document.
**Fix:** Include `status: state.status` in the update partial when modal exposes it.

### BUG-EDG-005: TaskModal saves `amount: 0` as `null`
**Location:** `src/modules/tasks/components/TaskModal.tsx:79, 97`
**Description:** `amount: state.amount || null` — entering `$0.00` is treated as "no amount". Edge case if a user deliberately wants to track a $0 task (e.g. "verify no overdraft fee").
**Fix:** Distinguish empty string from `0`: use `amount: amountDisplay === '' ? null : state.amount`.

---

## LOW (nice to have)

### BUG-PRF-001: Dashboard re-computes 12-month bestNet from `allTxns` every render
**Location:** `src/app/(app)/finance/page.tsx:50-56`
**Description:** Inside the render path, loops 12 months × `.filter(allTxns)` — O(12n) on every Zustand or Dexie change.
**Fix:** Wrap in `useMemo` keyed on `[allTxns, y]`.

### BUG-PRF-002: TransactionList not virtualized
**Location:** `src/modules/finance/components/TransactionList.tsx:127-141`
**Description:** Renders every row directly. With 1000+ transactions in a month, scroll/render cost spikes. Pre-launch users likely have <100 so OK.
**Fix:** When list exceeds ~200, switch to `@tanstack/react-virtual`.

### BUG-PRF-003: lucide-react `^1.8.0` is severely outdated
**Location:** `package.json`
**Description:** `lucide-react@^1.8.0` is years out of date (current ~0.477.0 — note that lucide-react versioning is `<1`). The `^1.8.0` constraint is suspect; verify what's actually installed and update to a maintained version. Older lucide may pin React 17 or have tree-shaking issues.
**Fix:** `npm install lucide-react@latest` and verify icons still resolve.

### BUG-RCT-009: TopNav `+ New` button label says "New" on /finance
**Location:** `src/components/layout/TopNav.tsx:16-20, 27`
**Description:** `NEW_LABEL_MAP` has entries for /recurring, /tasks, /categories — but not /finance. Falls through to the default "New" instead of "New transaction". Cosmetic.
**Fix:** Add `'/finance': 'New transaction', '/dashboard': 'New transaction'`.

### BUG-OFF-010: All tables auto-hard-delete; no soft delete = no sync deletion
**Location:** `delete` calls in: `src/modules/finance/components/TransactionModal.tsx:117`; `RecurringModal.tsx:119`; `TaskModal.tsx:110`; `categories/page.tsx:197, 201`; `tasks/page.tsx:270`.
**Description:** Once server sync is implemented, deletions performed offline will not propagate (sync engine has no record of the deleted row). Standard solution is soft-delete with a `_deleted: true` tombstone.
**Fix:** Add `_deleted: boolean` to all schemas, change deletes to `db.x.update(id, { _deleted: true, _dirty: true })`. Periodically purge tombstones older than the longest plausible offline duration after server confirms.

### BUG-RCT-010: No error boundary
**Location:** `src/app/layout.tsx`, `src/app/(app)/layout.tsx`
**Description:** Any uncaught render error crashes to a blank page. Next.js App Router supports `error.tsx`; none present.
**Fix:** Add `src/app/(app)/error.tsx` with a minimal "Something went wrong — Reload" UI; instrument with logger.

### BUG-RCT-011: `next-pwa` installed but never wired
**Location:** `package.json` has `@ducanh2912/next-pwa`; `next.config.mjs` does not import it.
**Description:** No service worker is generated. The app is not actually installable as a PWA in any meaningful sense beyond the manifest.
**Fix:**
```js
import withPWA from '@ducanh2912/next-pwa'
const nextConfig = {}
export default withPWA({ dest: 'public', disable: process.env.NODE_ENV === 'development' })(nextConfig)
```

### BUG-RCT-012: Manifest references `.png` icons but only `.svg` exist
**Location:** `src/app/manifest.ts:14-16`; `public/icons/icon-{192,512}.svg` exist; no `.png`.
**Description:** PWA install manifest declares PNG icons that don't exist. Lighthouse PWA score fails; install banner shows broken icon.
**Fix:** Generate PNGs (192, 512, maskable) or update manifest to declare SVG with `type: 'image/svg+xml'`.

### BUG-OFF-011: `DTask.createdAt` is `Date`, others are `string`
**Location:** `src/db/dexie.ts:66`
**Description:** Type inconsistency vs `DTransaction.createdAt: string`. Dexie serializes both, but JSON export and string-sort behave differently. Tests in `useTasks.test.ts` aren't affected because nothing sorts tasks by createdAt yet.
**Fix:** Standardize on ISO `string` everywhere; add a Dexie upgrade.

### BUG-SEC-001: NextAuth secret placeholder in `.env.local`
**Location:** `.env.local:2`
**Description:** `NEXTAUTH_SECRET="run: openssl rand -base64 32"` — the literal placeholder text is the value. If deployed with this env, NextAuth signs sessions with a guessable string.
**Fix:** Replace with a real secret. Add a startup guard rejecting anything starting with `"run:"`.

### BUG-SEC-002: Google OAuth env values un-validated; auth fails opaquely
**Location:** `src/lib/auth.ts:10-11`; `.env.local:4-5`
**Description:** Empty `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` make the Google provider initialize with `undefined`; sign-in 500s in production.
**Fix:** Add a typed env loader (e.g. small Zod schema in `src/lib/env.ts`) that validates required env vars at boot.

### BUG-SEC-003: Hardcoded `'demo'` userId on every write (auth not consumed)
**Location:** `src/modules/finance/components/TransactionModal.tsx:9, 96`; `RecurringModal.tsx:9, 96`; `TaskModal.tsx:7, 85`; `categories/page.tsx:11, 52, 70`; `tasks/page.tsx:304`
**Description:** Auth lib is wired but no code consumes the session. All writes go in as `userId: 'demo'`. Once auth is enabled this becomes a multi-tenant cross-leak: real users either see no data (filtered by real userId) or see *every* user's "demo" data.
**Fix:** Introduce `useCurrentUserId()`; block writes until resolved; migrate existing `'demo'` records on first signin.

### BUG-SEC-004: No `.env.example`; `.env.local` placeholder committed
**Location:** Repo root
**Description:** Convention is to commit `.env.example` and gitignore `.env.local`. Currently only `.env.local` exists with placeholder values; risk of someone adding real creds and committing.
**Fix:** Rename to `.env.example`, ensure `.env.local` is gitignored. Add CI hook to fail on staged `.env.local`.

### BUG-EDG-006: SpendCalendar tooltip uses global `currency`, not per-txn
**Location:** `src/modules/finance/components/SpendCalendar.tsx:124`
**Description:** Tooltip rows always format with the global currency, even if the underlying txn has a different currency. Cosmetic mismatch in mixed-currency data.
**Fix:** Use `t.currency || currency` when mapping items.

### BUG-EDG-007: Long transaction notes / titles not truncated
**Location:** `src/modules/finance/components/TransactionList.tsx:39`; `src/app/(app)/tasks/page.tsx:54`
**Description:** No `text-ellipsis` / `line-clamp` on `.sf-txn-name` or `.sf-task-title`. A 500-character note will wrap and break the row layout. (The CSS may already handle this; verify in `globals.css`.)
**Fix:** Add `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` to the relevant CSS classes if missing.

### BUG-EDG-008: First-launch sparkline shows zero line
**Location:** `src/app/(app)/dashboard/page.tsx:54-57, 78-96`
**Description:** A new user with 0 transactions: `last6Months` returns 6 entries; `sparkData` is `[0,0,0,0,0,0]`; `min = max = 0`; `range = max(0,1) = 1`; renders a flat line at the bottom of the SVG. Visually unsurprising but the "+0% vs prev" math also degenerates.
**Fix:** Hide the sparkline when all values are 0; show an empty-state pill instead.

### BUG-EDG-009: `parseISO` produces local-tz Date, but `task.dueDate` compared with strings AND Dates inconsistently
**Location:** `src/app/(app)/tasks/page.tsx:222-244` (uses `parseISO(t.dueDate)` then `setHours(0,0,0,0)` then `getTime()` compares); `src/modules/tasks/hooks/useTasks.ts:32` (uses `Date` math).
**Description:** Two date-comparison patterns coexist: string compare (`activeDateStr === todayStr`) and Date object compare. Both are local-tz, so functionally equivalent today, but a single bug in one path could diverge silently (e.g. a future feature mixing UTC strings).
**Fix:** Standardize on string compare for date-only fields; reserve Date math only for true datetime values.

### BUG-EDG-010: Streak computation walks 365 days every render
**Location:** `src/app/(app)/tasks/page.tsx:138-151`
**Description:** Inside `ProductivitySection`, the for-loop runs up to 365 iterations on every render. Inside each it calls `dayCompletion()` which `.filter()`s pinned tasks. For 5 pinned tasks × 365 days × every render, ~1825 ops per render. Negligible but worth memoizing.
**Fix:** Wrap in `useMemo` keyed on `[pinned, todayStr]`.

### BUG-EDG-011: First-launch `useTransactionCategories` returns `[] as any[]` → TransactionModal `cats[0]?.slug ?? ''` saves with empty slug
**Location:** `src/modules/finance/components/TransactionModal.tsx:42`
**Description:** If categories haven't seeded yet (race with effect), `filteredCats` returns `[]`, and `initCat = ''`. If the user types an amount and clicks Save fast, the txn is saved with `categorySlug: ''`. Recovers when seed completes (categories appear) but the orphan persists.
**Fix:** Block Save when `state.categorySlug === ''`; show a helpful error.

### BUG-OFF-012: All Dexie queries unscoped by `userId`
**Location:** Every `useLiveQuery` and direct Dexie call (e.g. `src/modules/finance/hooks/useFinanceData.ts:6, 15, 20, 27`; `src/modules/tasks/hooks/useTasks.ts:5, 9`; `src/app/(app)/categories/page.tsx:182-185`).
**Description:** No query filters by `userId`. Today this is fine (single demo user) but the schema indexes `userId` and the app intends multi-user via auth. When auth lands, every query needs a `where('userId').equals(currentUserId)` clause; if not added, users will see each other's local data on shared devices.
**Fix:** Centralize Dexie queries through helpers that bake in `userId`. Add lint rule / test that fails if `db.X.toArray()` is called without a userId filter outside seed code.

### BUG-EDG-012: All recurring paused → `monthlyCommit = 0`, but trend label says "Recurring expenses normalized"
**Location:** `src/app/(app)/recurring/page.tsx:117-120`
**Description:** When `active = []`, `monthlyCommit = 0` is shown with a green-ish trend label. Slightly misleading.
**Fix:** Show "All paused" when `active.length === 0`.

### BUG-EDG-013: `getCategory` orphan fallback uses `slug` as `name`
**Location:** `src/modules/finance/components/TransactionList.tsx:16-22`
**Description:** Returns `{ name: slug, ... }` so an orphan slug shows like `custom-coffee-1714000000000` to the user. Better fallback: "Unknown".
**Fix:** `name: 'Unknown'`. Combined with BUG-OFF-006 fix.

### BUG-EDG-014: `bgFor(0)` returns `'transparent'` causing today's empty cell to be invisible against today highlight
**Location:** `src/modules/finance/components/SpendCalendar.tsx:27`
**Description:** When today has no expense, the cell is `transparent` background, but the `.today` class CSS may apply a highlight. If both transparent and highlight conflict, today might look empty. Cosmetic.
**Fix:** Verify `.sf-cal-day.today` styling overrides background correctly.

---

## VERIFIED CORRECT

- **`monthStats` correctly excludes PENDING** from income/expense totals — covered by tests in `src/modules/finance/hooks/useFinanceData.test.ts:60-76`.
- **`parseCurrencyInput`** correctly converts a string like `"$12.50"` → `1250` cents (digit-only path, no float math).
- **`TransactionModal.handleAmountInput`** keeps amount as integer cents throughout — no display↔storage round-trip bug. The displayed `formatAmountDisplay` is purely visual; the saved `state.amount` is the integer.
- **`RecurringModal.handleAmountInput`** mirrors the safe path.
- **TaskModal save path** correctly sets `_dirty: true` on both add and update.
- **TransactionModal save path** correctly sets `_dirty: true` on both add and update.
- **RecurringModal save path** correctly sets `_dirty: true` on both add and update.
- **CategoryModal save path** correctly sets reasonable defaults but **does NOT set `_dirty: true`** on `db.categories.add` or `.update` — actually this is a finding, see BUG-OFF-013 below. Move to MEDIUM.

> Correction: re-checking `src/app/(app)/categories/page.tsx:46-48, 50-58, 63-65, 67-77` — none of the four category writes include `_dirty: true`. This is another offline-sync gap. Adding as **BUG-OFF-013** (MEDIUM) with cross-reference.

- **`useFinanceData.test.ts`** has thorough coverage of `sumAmount`, `monthStats`, `prevYM`, `nextYM`, `last6Months`.
- **`useTasks.test.ts`** correctly verifies priority sort order (URGENT > HIGH > MEDIUM > LOW), incomplete-before-complete, null-due-date sort to end.
- **`taskDueInfo`** correctly returns `due-overdue` / `due-today` / `due-soon` / month label per range — tested in `taskDueInfo.test.ts`.
- **No `console.log/warn/error`** calls anywhere in production source.
- **No `any` keyword** in `src/` (one `'any'` string literal in manifest is a PWA enum value).
- **No `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`** anywhere.
- **No `as unknown` casts** anywhere.
- **No raw API routes** that accept `userId` from request body — only NextAuth's catch-all.
- **`prisma.ts`** uses the standard global-singleton pattern guarded by `NODE_ENV`.
- **Cascade deletes** correctly defined on User → Transactions/Recurring/Categories/Sessions/Accounts in Prisma schema.
- **`Prisma TransactionCategory` `@@unique([slug, userId])`** prevents server-side duplicate slugs (Dexie does not — see BUG-OFF-008).
- **`useLiveQuery` is used everywhere** for Dexie reads in pages and components — no stale-snapshot pattern (`useEffect` + `db.toArray()`) found in production code.
- **Modal forms initialize from props** — `TransactionModal`, `RecurringModal`, `TaskModal` all derive initial state from `initial?.X ?? default`. Re-opening a modal with a different `initial` correctly remounts (key implicit via parent state).
- **Date helpers in `src/lib/utils.ts`** (`parseISO`, `formatISO`, `pad`, `todayISO`) all use local-tz `Date` constructor consistently — no UTC vs local mix in helpers themselves.

### BUG-OFF-013 (added during verification): Category writes don't set `_dirty: true`
**Location:** `src/app/(app)/categories/page.tsx:46-48, 50-58, 63-65, 67-77` and `DTransactionCategory` schema lacks `_dirty` field entirely.
**Description:** `db.categories.update(...)` and `db.categories.add(...)` calls don't pass `_dirty: true`. Also, `DTransactionCategory` interface in `src/db/dexie.ts:37-48` does not declare a `_dirty` field at all (compared to `DTransaction`, `DRecurringTransaction`, `DTask`, `DNote`, `DHabit` which all have it). Categories cannot be marked dirty even if you wanted to. So custom-category creation will not sync.
**Severity:** **HIGH** (re-classify) — blocks category sync entirely.
**Fix:** Add `_dirty: boolean` to `DTransactionCategory` (and `DTaskCategory`), bump Dexie version with an upgrade that defaults existing rows to `_dirty: false`, then set `_dirty: true` on every category write.

---

## SUMMARY

- Critical: **8** (BUG-MNY-001, BUG-OFF-001, BUG-OFF-002, BUG-OFF-003, BUG-MNY-002, BUG-OFF-004, BUG-MNY-003, plus implicitly BUG-MNY-001 already counted)
- High: **10** (BUG-OFF-005, BUG-MNY-004, BUG-OFF-006, BUG-RCT-001, BUG-RCT-002, BUG-OFF-007, BUG-RCT-003, BUG-EDG-001, BUG-MNY-005, BUG-MNY-006, BUG-EDG-002, plus BUG-OFF-013 promoted from "verified correct")
- Medium: **9** (BUG-MNY-007, BUG-MNY-008, BUG-OFF-008, BUG-OFF-009, BUG-RCT-004, BUG-RCT-005, BUG-RCT-006, BUG-EDG-003, BUG-RCT-007, BUG-RCT-008, BUG-EDG-004, BUG-MNY-009, BUG-EDG-005)
- Low: **18** (BUG-PRF-001..003, BUG-RCT-009..012, BUG-OFF-010..011, BUG-SEC-001..004, BUG-EDG-006..014)
- **Total issues: 45**

### Top recommendations before launch
1. **Fix the chart Y-axis** (BUG-MNY-001) — single-line fix, eliminates the most visible wrong number.
2. **Add `_dirty: true` to every Dexie write** (BUG-OFF-001..003, BUG-OFF-013) — non-negotiable for the offline-first promise.
3. **Implement the recurring processor** (BUG-MNY-002) — the recurring feature is currently a UI without backend.
4. **Replace the Sidebar `equals(1)` boolean query** (BUG-OFF-005) — Sidebar widget is broken today.
5. **Decide currency policy** (BUG-MNY-003, BUG-EDG-002) — single-currency lock or mixed-currency support; either way, stop showing wrong totals.
6. **Add Dexie schema upgrade callback** (BUG-OFF-004) — protect any user with a v1 install.
7. **Wire NextAuth session into write paths** (BUG-SEC-003) — before launch, every write needs the real userId.
8. **Wire `next-pwa` and fix manifest icons** (BUG-RCT-011, BUG-RCT-012) — currently the app is not actually a PWA.
