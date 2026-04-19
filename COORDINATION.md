# StayFlow — Session Coordination
# Claude: READ THIS FIRST. Update before ending every session.

## Status
Phase: 2 — In progress  |  Session: 1
Last commit: df14615  |  Health: 🟡

## Checklist
- [x] Phase 0 — Git init + GitHub repo + develop branch
- [x] Phase 1 — Next.js scaffold + all dependencies
- [ ] Phase 2 — Config files (CLAUDE.md, ECOSYSTEM.md, skills, agents, commands)
- [ ] Phase 3 — Core infrastructure (Dexie, Prisma, app shell skeleton)
- [ ] Phase 4 — GitHub Actions CI/CD
- [ ] STOP HERE — wait for Pencil Dev designs

## In Progress
Phase 2: Writing CLAUDE.md, ECOSYSTEM.md, COORDINATION.md, env template

## Next Session — Start Here
1. git status — check current state
2. npm run typecheck
3. Continue with Phase 3 if Phase 2 is complete

## Architectural Decisions
- Local-first: Dexie writes first, Prisma sync secondary
- Amounts as integer cents, never floats
- Recurring transactions auto-create as PENDING status
- develop branch daily, PRs to main
- Light + dark theme from day 1 (next-themes CSS variables)
- Widget registry pattern for dashboard extensibility
- TransactionCategory uses slug IDs for defaults ("food", "salary" etc)

## Blockers
none

## Key Files Created
- STAYFLOW_INFRA_PROMPT.md — infrastructure prompt
- vitest.config.ts — test config
- src/tests/setup.ts — test setup
- src/app/layout.tsx — root layout (Inter font)
- CLAUDE.md, ECOSYSTEM.md — agent context files
