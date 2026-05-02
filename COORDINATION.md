# StayFlow — Session Coordination
# Claude: READ THIS FIRST. Update before ending every session.

## Status
Phase: 5 — DESIGN MATCHED  |  Session: 4
Last commit: 72776a7  |  Health: ✅

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

## In Progress
Finance module design-matched (session 4). All other phases still need same treatment.

## Next Session — Start Here
1. npm run dev → open http://localhost:3000/finance to verify Finance page
2. Apply same design-match pass to remaining pages: Dashboard, Tasks, Recurring, Categories, Settings
3. Key remaining gaps per design:
   - Dashboard greeting/sparkline card (check font sizes, layout)
   - Tasks: task row uses bg-surface card style in design, not bare flex
   - Recurring: rec-row is a surface card (bg-surface + border), not hover-only
   - Categories: cat-row grid (40px 1fr auto auto) confirmed; check system label

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
- src/db/seeds.ts — 14 finance categories + 5 task categories
- src/store/financeStore.ts — activeMonth, prevMonth/nextMonth
- src/store/tasksStore.ts — filter, activeDate
- src/store/settingsStore.ts — currency, accentColor, weekStartsOn, roundToNearestDollar
- src/modules/finance/ — types, hooks, StatCards, FinanceChart, SpendCalendar, TransactionList, TransactionModal, RecurringModal
- src/modules/tasks/ — hooks/useTasks, components/TaskModal
- src/components/layout/ — AppShell, Sidebar, TopNav, BottomNav
- src/app/(app)/ — dashboard, finance, tasks, recurring, categories, settings
