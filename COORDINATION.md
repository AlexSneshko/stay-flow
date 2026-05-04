# StayFlow — Session Coordination
# Claude: READ THIS FIRST. Update before ending every session.

## Status
Phase: 10 — DEEP CODE AUDIT  |  Session: 10
Last commit: 20cfc44  |  Health: ✅ (149/149 tests pass)

## Checklist
- [x] Phase 0 — Git init + GitHub repo + develop branch
- [x] Phase 1 — Next.js scaffold + all dependencies
- [x] Phase 2 — Config files (CLAUDE.md, ECOSYSTEM.md, skills, agents, commands)
- [x] Phase 3 — Core infrastructure (Dexie, Prisma, app shell skeleton)
- [x] Phase 4 — GitHub Actions CI/CD
- [x] Phase 5 — Finance module (transactions, chart, spend calendar, recurring modal)
- [x] Phase 6 — Dashboard (greeting, sparkline, finance card, task card, recent txns)
- [x] Phase 7 — App Shell (Sidebar, TopNav, BottomNav, AppShell, globals.css, tokens)
- [x] Phase 8 — Tasks module (task list, TaskModal, filters, productivity section)
- [x] Phase 9 — Recurring, Categories, Settings pages
- [x] Phase 10 — Deep code audit (docs/audit/code-audit.md)

## In Progress
Code audit complete (session 10). Report at `docs/audit/code-audit.md`.
45 findings: 8 critical, 10+ high, 9 medium, 18 low.

## Next Session — Start Here
1. Review `docs/audit/code-audit.md` and triage fixes.
2. Top fix priorities (from audit summary):
   - BUG-MNY-001: FinanceChart Y-axis off by 100× (one-line fix)
   - BUG-OFF-001..003, BUG-OFF-013: Add `_dirty: true` to all writes
   - BUG-MNY-002: Implement `useRecurringProcessor`
   - BUG-OFF-005: Sidebar `equals(1)` boolean query is broken
   - BUG-MNY-003: Decide multi-currency policy (lock or convert)
   - BUG-OFF-004: Add Dexie schema upgrade callback for v1→v2
   - BUG-SEC-003: Wire NextAuth session into write paths
   - BUG-RCT-011..012: Wire next-pwa, fix manifest icons

## Architectural Decisions
- Local-first: Dexie writes first, Prisma sync secondary
- Amounts as integer cents, never floats
- Recurring transactions auto-create as PENDING status
- develop branch daily, PRs to main
- Light + dark theme from day 1 (next-themes CSS variables)
- TransactionCategory uses slug IDs for defaults ("food", "salary" etc)
- vitest.config.ts excluded from tsconfig (vite version incompatibility)
- Outfit font (replaced Inter — matches design)
- All StayFlow CSS classes prefixed sf- to avoid shadcn conflicts
- TopNav dispatches sf:new CustomEvent; pages listen to open modals
- Dexie schema bumped to v2 (categorySlug rename, DTask redesign)
- FinanceChart uses dangerouslySetInnerHTML (CSS vars don't resolve in SVG attrs)
- DEMO_USER_ID = 'demo' until auth is wired

## Blockers
none

## Key Files
- src/app/globals.css — all StayFlow CSS variables + sf- component classes
- src/db/dexie.ts — StayFlowDatabase v2 (transactions, categories, recurring, tasks, taskCategories)
- src/db/seeds.ts — 13 finance categories + 5 task categories (seeds.ts boolean guard fixed for fake-indexeddb)
- src/store/financeStore.ts — activeMonth, prevMonth/nextMonth
- src/store/tasksStore.ts — filter, activeDate
- src/store/settingsStore.ts — currency, accentColor, weekStartsOn, roundToNearestDollar
- src/modules/finance/ — types, hooks, StatCards, FinanceChart, SpendCalendar, TransactionList, TransactionModal, RecurringModal
- src/modules/tasks/ — hooks/useTasks, components/TaskModal
- src/components/layout/ — AppShell, Sidebar, TopNav, BottomNav
- src/app/(app)/ — dashboard, finance, tasks, recurring, categories, settings
