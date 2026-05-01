# StayFlow — Session Coordination
# Claude: READ THIS FIRST. Update before ending every session.

## Status
Phase: 4 — COMPLETE  |  Session: 2
Last commit: ab13685  |  Health: ✅

## Checklist
- [x] Phase 0 — Git init + GitHub repo + develop branch
- [x] Phase 1 — Next.js scaffold + all dependencies
- [x] Phase 2 — Config files (CLAUDE.md, ECOSYSTEM.md, skills, agents, commands)
- [x] Phase 3 — Core infrastructure (Dexie, Prisma, app shell skeleton)
- [x] Phase 4 — GitHub Actions CI/CD
- [ ] STOP HERE — wait for Pencil Dev designs

## In Progress
Infrastructure complete. Design ready in DESIGN_HANDOFF.md.

## Next Session — Start Here
1. Read DESIGN_HANDOFF.md, then implement Phase 5 — Finance module
2. Run: npm run typecheck && git status
3. Scaffold src/modules/finance/ using /new-module command

## Architectural Decisions
- Local-first: Dexie writes first, Prisma sync secondary
- Amounts as integer cents, never floats
- Recurring transactions auto-create as PENDING status
- develop branch daily, PRs to main
- Light + dark theme from day 1 (next-themes CSS variables)
- Widget registry pattern for dashboard extensibility
- TransactionCategory uses slug IDs for defaults ("food", "salary" etc)
- vitest.config.ts excluded from tsconfig (vite version incompatibility)
- Inter font used instead of Geist (not available in Next.js 14 google fonts)

## Blockers
none

## Key Files Created
- src/db/dexie.ts — StayFlowDatabase (transactions, categories, recurring, tasks+full schema, taskCategories, notes, habits)
- src/db/seeds.ts — 14 finance categories + 5 task categories
- prisma/schema.prisma — full schema with NextAuth models
- src/lib/utils.ts — cn, formatCurrency, parseCurrencyInput, formatDate
- src/lib/prisma.ts — Prisma singleton
- src/lib/auth.ts — NextAuth v5 with Google provider
- src/store/uiStore.ts — sidebar state
- src/store/settingsStore.ts — user preferences
- src/components/providers/Providers.tsx — QueryClient + ThemeProvider + Toaster
- src/components/layout/ — AppShell, Sidebar, TopNav (placeholders)
- src/app/(app)/ — dashboard, finance, settings pages
- src/app/(marketing)/ — landing page
- src/app/manifest.ts — PWA manifest
- .claude/ — settings, commands, agents, skills
- .github/workflows/ — CI + Claude review
