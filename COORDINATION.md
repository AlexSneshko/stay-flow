# StayFlow — Session Coordination
# Claude: READ THIS FIRST. Update before ending every session.

## Status
Phase: 9 — APP SHELL POLISHED  |  Session: 8
Last commit: 87d2490  |  Health: ✅

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
App Shell polished (session 8). Recurring, Categories, Settings need design-match pass.

## Next Session — Start Here
1. npm run dev → verify Sidebar (gradient logo, accent left-border active), TopNav (Light/Dark/Auto pill), BottomNav (sf- CSS classes)
2. Apply design-match pass to remaining pages: Recurring, Categories, Settings
3. Key remaining gaps per design:
   - Recurring: rec-row is a surface card (bg-surface + border), not hover-only; rec-stats grid
   - Categories: cat-row grid (40px 1fr auto auto) confirmed; check system label badge
   - Settings: section headers, toggle-row styles, select widths

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
