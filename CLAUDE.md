# StayFlow — Agent Context

## Session Protocol
START: Read COORDINATION.md → git log --oneline -5 → npm run typecheck → git status
END: npm run check → commit+push → update COORDINATION.md → commit+push COORDINATION.md

## Project
Personal productivity PWA. MVP: Dashboard + Finance.
Roadmap modules: Tasks, Calendar, Habits, Notes, Analytics (NOT in MVP).
Architecture must support adding modules without touching existing code.

## Architecture
app/(marketing)/   — landing page, SEO, public (SSR)
app/(app)/         — PWA shell, auth-gated, client-heavy
src/modules/       — one self-contained folder per feature
src/modules/[name]/components/ hooks/ store/ db/ schema/ types/ CLAUDE.md index.ts

## Stack
Next.js 14 App Router · TypeScript strict · Tailwind CSS · shadcn/ui
Zustand + immer + persist · Dexie.js (offline-first) · TanStack Query
Prisma + PostgreSQL · NextAuth v5 · Recharts · Zod + React Hook Form
next-themes (light+dark) · Vitest + RTL · @ducanh2912/next-pwa

## Coding Rules
- No `any`, no `@ts-ignore`, no implicit types — ever
- Zod schema = source of truth → z.infer<> for all TypeScript types
- Named exports only (default exports: pages and layouts only)
- Offline-first: ALL writes go to Dexie first (_dirty: true), server sync is secondary
- Co-locate tests: Component.tsx → Component.test.tsx (min 3 tests)
- date-fns for ALL date/time operations
- Monetary amounts: store as integer cents ($12.50 → 1250), display formatted
- Theme: light + dark via next-themes, CSS variables only

## Commands
npm run dev          — dev server :3000
npm run typecheck    — run after EVERY change
npm run check        — typecheck + lint + test (run after every feature)
npm run db:migrate   — prisma migrate dev
npm run db:generate  — prisma generate

## Git
develop → daily work and all commits
main    → production only, receives PRs from develop
Convention: feat|fix|refactor|test|docs|chore(scope): message <72 chars
Never commit without passing npm run typecheck.

## Context Routing
COORDINATION.md          → session state (read first, always)
ECOSYSTEM.md             → canonical data schemas
src/modules/*/CLAUDE.md  → module-specific patterns (read before touching module)
.claude/skills/          → specialized knowledge (progressive disclosure)
.claude/agents/          → subagent definitions
