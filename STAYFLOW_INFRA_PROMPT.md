# StayFlow — Claude Code Prompt · Phase 0–4 (Infrastructure Only)
---

## IDENTITY & MISSION

You are the lead engineer on **StayFlow** — a personal productivity PWA.
MVP scope: Dashboard overview + Finance tracker.
Architecture must be ready to add: Tasks, Calendar, Habits, Notes, Analytics — later.

Work autonomously through Phase 0–4 only.
After each phase: typecheck → commit → push → update COORDINATION.md.
Stop after Phase 4 and print a clear summary of what was set up.

---

## ══ SESSION PROTOCOL ═══════════════════════════════════════════

### START of every session
```
1. READ COORDINATION.md           ← your only memory between sessions
2. RUN: git log --oneline -5
3. RUN: npm run typecheck
4. RUN: git status
5. CONTINUE from "Next Session" in COORDINATION.md
```

### END of every session
```
1. RUN: npm run check
2. git add . && git commit -m "..." && git push
3. UPDATE COORDINATION.md
4. git add COORDINATION.md && git commit -m "docs: session handoff" && git push
```

---

## ══ CONTEXT & TOKEN RULES ══════════════════════════════════════

| Context | Action |
|---|---|
| 0–50% | Work normally |
| 50–70% | /compact |
| 70–80% | Finish current file, commit, prepare handoff |
| 80%+ | /handoff and end session |

- Read files surgically — never scan the whole project
- COORDINATION.md = your external memory between sessions
- Use subagents for any investigation requiring 5+ file reads

---

## ══ PHASE 0 — Git & GitHub ════════════════════════════════════

```bash
# Убедись что ты в папке stay-flow
pwd

# Инициализация git (папка уже создана, репозитория нет)
git init
git add .
git commit -m "chore: initial commit"

# Создать репозиторий на GitHub
gh repo create stay-flow --public --source=. --push \
  --description "StayFlow — personal productivity PWA"

# Настроить ветки
git checkout -b develop
git push -u origin develop

# Commit template
printf '# <type>(<scope>): <subject>\n# Types: feat|fix|refactor|test|docs|chore|ci\n# Scopes: dashboard|finance|tasks|habits|notes|pwa|db|auth|ui|ci\n' > .gitmessage
git config commit.template .gitmessage
```

After: `git add . && git commit -m "chore: init git, GitHub repo, develop branch" && git push`

---

## ══ PHASE 1 — Project Scaffold ════════════════════════════════

```bash
# Scaffold Next.js (мы в папке stay-flow)
npx create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir \
  --no-git --import-alias "@/*"

# Core dependencies
npm install zustand dexie dexie-react-hooks
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form zod @hookform/resolvers
npm install recharts date-fns lucide-react next-themes clsx tailwind-merge

# Auth + DB
npm install next-auth@beta @auth/prisma-adapter @prisma/client

# PWA
npm install @ducanh2912/next-pwa

# Dev dependencies
npm install -D prisma vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D fake-indexeddb @playwright/test
npm install -D prettier eslint-config-prettier
npm install -D husky lint-staged

# shadcn/ui
npx shadcn@latest init --defaults
npx shadcn@latest add button input label card dialog sheet \
  dropdown-menu popover select separator badge avatar \
  sonner table tabs scroll-area skeleton progress \
  tooltip command checkbox switch
```

### `package.json` scripts (добавить/заменить):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "test": "vitest run",
    "test:watch": "vitest",
    "check": "npm run typecheck && npm run lint && npm run test",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "prepare": "husky"
  }
}
```

### `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

### `src/tests/setup.ts`:
```typescript
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
```

After: `git add . && git commit -m "chore: scaffold Next.js with full dependency stack" && git push`

---

## ══ PHASE 2 — Project Config Files ════════════════════════════

Create ALL files below exactly as specified.

---

### `/CLAUDE.md` (root — 70 lines max, loaded every session)

```markdown
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
```

---

### `/ECOSYSTEM.md` (canonical data schemas — read before any DB/API work)

```markdown
# StayFlow — Canonical Data Schemas
# Read this before any DB, API, sync, or TypeScript type work.
# These field names are canonical. Never invent alternatives.

## Transaction
id: string (cuid)
userId: string
amount: number  ← ALWAYS positive integer in cents. $12.50 = 1250. Never floats.
type: INCOME | EXPENSE
category: string  ← references TransactionCategory.id
currency: string  ← ISO 4217 code (e.g. "USD", "RUB", "EUR")
note: string (default "")
date: Date
status: CONFIRMED | PENDING  ← PENDING for auto-created recurring transactions
recurringId: string | null  ← links to RecurringTransaction if auto-created
createdAt: Date
updatedAt: Date
_dirty: boolean  ← Dexie only: true = not yet synced to server

## RecurringTransaction
id: string (cuid)
userId: string
title: string  ← e.g. "Netflix", "Gym membership"
amount: number  ← cents, always positive
type: INCOME | EXPENSE
category: string
currency: string
frequency: DAILY | WEEKLY | MONTHLY | YEARLY
dayOfMonth: number | null  ← for MONTHLY (1–31)
dayOfWeek: number | null   ← for WEEKLY (0=Sun..6=Sat)
nextDueDate: Date          ← when to auto-create next transaction
active: boolean (default true)
createdAt: Date
_dirty: boolean

## TransactionCategory
id: string (cuid or slug for defaults)
userId: string | null  ← null = system default, string = user-created
name: string
icon: string  ← emoji, e.g. "🍕"
color: string  ← hex, e.g. "#f7971e"
type: INCOME | EXPENSE | BOTH  ← which transaction types it applies to
isDefault: boolean
order: number  ← for display sorting

## Default Categories (seed data — create on first launch)
EXPENSE: 🍕 Food #f7971e | 🚗 Transport #6c63ff | 🏠 Housing #43e97b
         💊 Health #ff6584 | 🎬 Entertainment #4fc3f7 | 🛍 Shopping #ab47bc
         📚 Education #26a69a | 📱 Subscriptions #ffa726 | 🔧 Other #78909c
INCOME:  💼 Salary #66bb6a | 💻 Freelance #42a5f5 | 📈 Investment #ec407a
         🎁 Gift #26c6da | 💰 Other Income #8d6e63

## UserSettings
userId: string (PK — one row per user)
currency: string  ← ISO 4217, default "USD"
theme: 'light' | 'dark' | 'system' (default 'system')
language: string (default 'en')
weekStartsOn: 0 | 1  ← 0=Sunday, 1=Monday (default 1)
timezone: string  ← IANA (default 'UTC')

## DashboardWidget (future — not in MVP schema, just document the concept)
# Each widget is a React component registered in a widget registry.
# The dashboard layout is a fixed grid in MVP.
# Future: allow user to reorder/hide widgets via a widgetConfig JSON in UserSettings.

## API Response Envelope
Success: { data: T }
Error:   { error: string, code?: string }
Never return raw Prisma objects. Always select only needed fields.
```

---

### `/COORDINATION.md` (initial — Claude updates every session)

```markdown
# StayFlow — Session Coordination
# Claude: READ THIS FIRST. Update before ending every session.

## Status
Phase: 0 — Not started  |  Session: 0
Last commit: —  |  Health: ⬜

## Checklist
- [ ] Phase 0 — Git init + GitHub repo + develop branch
- [ ] Phase 1 — Next.js scaffold + all dependencies
- [ ] Phase 2 — Config files (CLAUDE.md, ECOSYSTEM.md, skills, agents, commands)
- [ ] Phase 3 — Core infrastructure (Dexie, Prisma, app shell skeleton)
- [ ] Phase 4 — GitHub Actions CI/CD
- [ ] STOP HERE — wait for Pencil Dev designs

## In Progress
Starting Phase 0

## Next Session — Start Here
1. git status — check current state
2. Continue with Phase 0: git init, gh repo create, develop branch

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
(updated each session)
```

---

### `/.env.local` (template — no real secrets)

```
DATABASE_URL="postgresql://user:pass@localhost:5432/stayflow"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### `/.gitignore` additions

```
CLAUDE.local.md
.env
.env.local
.env.*.local
docs/reviews/
```

After Phase 2: `git add . && git commit -m "chore: CLAUDE.md, ECOSYSTEM.md, COORDINATION.md, env template" && git push`

---

## ══ PHASE 3 — Core Infrastructure ════════════════════════════

### 3a. Directory skeleton

Create all directories and empty placeholder files:

```
src/
  app/
    (marketing)/
      layout.tsx          ← minimal header/footer, no sidebar
      page.tsx            ← landing page placeholder (SSR)
    (app)/
      layout.tsx          ← AppShell wrapper (sidebar + topnav)
      dashboard/
        page.tsx          ← dashboard placeholder
      finance/
        page.tsx          ← finance placeholder
      settings/
        page.tsx          ← settings placeholder
    api/
      auth/
        [...nextauth]/
          route.ts
    layout.tsx            ← root layout: html, body, Providers
    manifest.ts           ← PWA manifest
  components/
    layout/
      Sidebar.tsx         ← placeholder
      TopNav.tsx          ← placeholder
      AppShell.tsx        ← placeholder
    providers/
      Providers.tsx       ← QueryProvider + ThemeProvider combined
    ui/                   ← shadcn (already exists)
  modules/
    dashboard/            ← will hold dashboard widgets
      widgets/            ← each widget is an isolated component
    finance/              ← Finance module (fully built in Phase 5+)
    tasks/                ← FUTURE — empty for now
    habits/               ← FUTURE — empty for now
    notes/                ← FUTURE — empty for now
  db/
    dexie.ts              ← LifeOS DB class
    seeds.ts              ← default category seed data
  store/
    uiStore.ts            ← sidebar open/close, theme
    settingsStore.ts      ← user settings (currency, language etc)
  lib/
    auth.ts               ← NextAuth config
    prisma.ts             ← Prisma singleton
    utils.ts              ← cn(), formatCurrency(), formatDate()
  hooks/
    useMediaQuery.ts      ← responsive breakpoint hook
    useDebounce.ts
  types/
    global.d.ts
  tests/
    setup.ts
```

### 3b. `src/db/dexie.ts` — full Dexie database

```typescript
import Dexie, { type Table } from 'dexie'

// Interfaces match ECOSYSTEM.md exactly
export interface DTransaction {
  id?: number
  remoteId: string | null
  userId: string
  amount: number          // always positive cents
  type: 'INCOME' | 'EXPENSE'
  category: string        // category id/slug
  currency: string        // ISO 4217
  note: string
  date: Date
  status: 'CONFIRMED' | 'PENDING'
  recurringId: string | null
  createdAt: Date
  updatedAt: Date
  _dirty: boolean
}

export interface DRecurringTransaction {
  id?: number
  remoteId: string | null
  userId: string
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  currency: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  dayOfMonth: number | null
  dayOfWeek: number | null
  nextDueDate: Date
  active: boolean
  createdAt: Date
  _dirty: boolean
}

export interface DTransactionCategory {
  id?: number
  remoteId: string | null
  slug: string            // unique identifier
  userId: string | null   // null = system default
  name: string
  icon: string            // emoji
  color: string           // hex
  type: 'INCOME' | 'EXPENSE' | 'BOTH'
  isDefault: boolean
  order: number
}

// FUTURE TABLES — declared now, used later
export interface DTask {
  id?: number
  remoteId: string | null
  userId: string
  title: string
  _dirty: boolean
  // Full schema added when Tasks module is built
}

export interface DNote {
  id?: number
  remoteId: string | null
  userId: string
  title: string
  _dirty: boolean
  // Full schema added when Notes module is built
}

export interface DHabit {
  id?: number
  remoteId: string | null
  userId: string
  name: string
  _dirty: boolean
  // Full schema added when Habits module is built
}

export class StayFlowDatabase extends Dexie {
  transactions!: Table<DTransaction>
  recurringTransactions!: Table<DRecurringTransaction>
  categories!: Table<DTransactionCategory>
  tasks!: Table<DTask>           // future
  notes!: Table<DNote>           // future
  habits!: Table<DHabit>         // future

  constructor() {
    super('stayflow-v1')
    this.version(1).stores({
      transactions:
        '++id, remoteId, userId, type, category, date, status, recurringId, _dirty',
      recurringTransactions:
        '++id, remoteId, userId, type, frequency, nextDueDate, active, _dirty',
      categories:
        '++id, slug, userId, type, isDefault, order',
      tasks:   '++id, remoteId, userId, _dirty',
      notes:   '++id, remoteId, userId, _dirty',
      habits:  '++id, remoteId, userId, _dirty',
    })
  }
}

export const db = new StayFlowDatabase()
```

### 3c. `src/db/seeds.ts` — default categories

```typescript
import { db } from './dexie'
import type { DTransactionCategory } from './dexie'

const DEFAULT_CATEGORIES: Omit<DTransactionCategory, 'id'>[] = [
  // Expenses
  { remoteId: null, slug: 'food',          userId: null, name: 'Food',          icon: '🍕', color: '#f7971e', type: 'EXPENSE', isDefault: true, order: 1 },
  { remoteId: null, slug: 'transport',     userId: null, name: 'Transport',     icon: '🚗', color: '#6c63ff', type: 'EXPENSE', isDefault: true, order: 2 },
  { remoteId: null, slug: 'housing',       userId: null, name: 'Housing',       icon: '🏠', color: '#43e97b', type: 'EXPENSE', isDefault: true, order: 3 },
  { remoteId: null, slug: 'health',        userId: null, name: 'Health',        icon: '💊', color: '#ff6584', type: 'EXPENSE', isDefault: true, order: 4 },
  { remoteId: null, slug: 'entertainment', userId: null, name: 'Entertainment', icon: '🎬', color: '#4fc3f7', type: 'EXPENSE', isDefault: true, order: 5 },
  { remoteId: null, slug: 'shopping',      userId: null, name: 'Shopping',      icon: '🛍', color: '#ab47bc', type: 'EXPENSE', isDefault: true, order: 6 },
  { remoteId: null, slug: 'education',     userId: null, name: 'Education',     icon: '📚', color: '#26a69a', type: 'EXPENSE', isDefault: true, order: 7 },
  { remoteId: null, slug: 'subscriptions', userId: null, name: 'Subscriptions', icon: '📱', color: '#ffa726', type: 'EXPENSE', isDefault: true, order: 8 },
  { remoteId: null, slug: 'other-expense', userId: null, name: 'Other',         icon: '🔧', color: '#78909c', type: 'EXPENSE', isDefault: true, order: 9 },
  // Income
  { remoteId: null, slug: 'salary',        userId: null, name: 'Salary',        icon: '💼', color: '#66bb6a', type: 'INCOME',  isDefault: true, order: 10 },
  { remoteId: null, slug: 'freelance',     userId: null, name: 'Freelance',     icon: '💻', color: '#42a5f5', type: 'INCOME',  isDefault: true, order: 11 },
  { remoteId: null, slug: 'investment',    userId: null, name: 'Investment',    icon: '📈', color: '#ec407a', type: 'INCOME',  isDefault: true, order: 12 },
  { remoteId: null, slug: 'gift',          userId: null, name: 'Gift',          icon: '🎁', color: '#26c6da', type: 'INCOME',  isDefault: true, order: 13 },
  { remoteId: null, slug: 'other-income',  userId: null, name: 'Other Income',  icon: '💰', color: '#8d6e63', type: 'INCOME',  isDefault: true, order: 14 },
]

export async function seedDefaultCategories(): Promise<void> {
  const existing = await db.categories.where('isDefault').equals(1).count()
  if (existing > 0) return // already seeded
  await db.categories.bulkAdd(DEFAULT_CATEGORIES)
}
```

### 3d. `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())

  settings             UserSettings?
  transactions         Transaction[]
  recurringTransactions RecurringTransaction[]
  categories           TransactionCategory[]
  accounts             Account[]
  sessions             Session[]
}

model UserSettings {
  userId       String @id
  currency     String @default("USD")
  theme        String @default("system")
  language     String @default("en")
  weekStartsOn Int    @default(1)
  timezone     String @default("UTC")
  user         User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Transaction {
  id          String            @id @default(cuid())
  userId      String
  amount      Int               // cents, always positive
  type        TransactionType
  category    String            // slug/id reference
  currency    String            @default("USD")
  note        String            @default("")
  date        DateTime
  status      TransactionStatus @default(CONFIRMED)
  recurringId String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user      User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  recurring RecurringTransaction? @relation(fields: [recurringId], references: [id])
}

model RecurringTransaction {
  id          String            @id @default(cuid())
  userId      String
  title       String
  amount      Int
  type        TransactionType
  category    String
  currency    String            @default("USD")
  frequency   Frequency
  dayOfMonth  Int?
  dayOfWeek   Int?
  nextDueDate DateTime
  active      Boolean           @default(true)
  createdAt   DateTime          @default(now())

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
}

model TransactionCategory {
  id        String          @id @default(cuid())
  slug      String
  userId    String?         // null = system default
  name      String
  icon      String
  color     String
  type      CategoryType
  isDefault Boolean         @default(false)
  order     Int             @default(0)

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([slug, userId])
}

// NextAuth
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

enum TransactionType   { INCOME EXPENSE }
enum TransactionStatus { CONFIRMED PENDING }
enum Frequency         { DAILY WEEKLY MONTHLY YEARLY }
enum CategoryType      { INCOME EXPENSE BOTH }
```

After prisma schema: `npx prisma format && npx prisma generate`

### 3e. `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, startOfMonth, endOfMonth } from 'date-fns'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

// Amount: cents → formatted string
export const formatCurrency = (
  cents: number,
  currency = 'USD',
  locale = 'en-US'
): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)

// Parse user input (e.g. "12.50") → cents (1250)
export const parseCurrencyInput = (value: string): number => {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''))
  return isNaN(num) ? 0 : Math.round(num * 100)
}

export const formatDate = (date: Date): string => {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d, yyyy')
}

export const getMonthRange = (date: Date) => ({
  start: startOfMonth(date),
  end: endOfMonth(date),
})
```

### 3f. `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'
declare global { var prisma: PrismaClient | undefined }
export const prisma = globalThis.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
```

### 3g. `src/store/uiStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'ui-store' }
  )
)
```

### 3h. `src/store/settingsStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  currency: string
  theme: 'light' | 'dark' | 'system'
  language: string
  weekStartsOn: 0 | 1
  timezone: string
  setCurrency: (currency: string) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: string) => void
  setWeekStartsOn: (day: 0 | 1) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'USD',
      theme: 'system',
      language: 'en',
      weekStartsOn: 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setWeekStartsOn: (weekStartsOn) => set({ weekStartsOn }),
    }),
    { name: 'settings-store' }
  )
)
```

### 3i. `src/app/layout.tsx` — root layout with providers

```typescript
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'StayFlow', template: '%s — StayFlow' },
  description: 'Personal productivity dashboard',
  applicationName: 'StayFlow',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f18' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### 3j. `src/components/providers/Providers.tsx`

```typescript
'use client'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
```

### 3k. Placeholder pages

Create minimal placeholder for each app page:

`src/app/(app)/layout.tsx` — returns AppShell wrapper (placeholder sidebar + topnav)
`src/app/(app)/dashboard/page.tsx` — `<h1>Dashboard</h1>` placeholder
`src/app/(app)/finance/page.tsx` — `<h1>Finance</h1>` placeholder
`src/app/(app)/settings/page.tsx` — `<h1>Settings</h1>` placeholder
`src/app/(marketing)/page.tsx` — `<h1>StayFlow — coming soon</h1>` (SSR, no 'use client')

### 3l. `src/app/manifest.ts`

```typescript
import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StayFlow',
    short_name: 'StayFlow',
    description: 'Personal productivity dashboard',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
```

Create `public/icons/` with placeholder SVG icons at 192×192 and 512×512.

After Phase 3:
```bash
npm run typecheck
git add .
git commit -m "feat(db): Dexie DB, Prisma schema, stores, providers, app skeleton"
git push
```

---

## ══ PHASE 4 — Claude Config + GitHub Actions ═══════════════════

### `.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(gh *)",
      "Bash(npm run *)",
      "Bash(npx prisma *)",
      "Bash(npx shadcn *)",
      "Bash(npx tsc *)"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(rm -rf ~)",
      "Bash(curl * | bash)",
      "Bash(wget * | sh)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [{
          "type": "command",
          "command": "npx tsc --noEmit 2>&1 | grep 'error TS' | head -5 || echo '✅ TypeScript OK'"
        }]
      }
    ],
    "Stop": [
      {
        "hooks": [{
          "type": "command",
          "command": "echo '⚠️  Session ending — did you update COORDINATION.md and push?'"
        }]
      }
    ]
  }
}
```

### `.claude/commands/handoff.md`

```markdown
---
description: End session — typecheck, commit, push, update COORDINATION.md
---
1. npm run typecheck — fix errors first
2. npm run lint:fix  — auto-fix lint issues
3. git add . && git commit -m "chore: session checkpoint" && git push
4. Update COORDINATION.md: mark done ✅, write "Next Session" (3 concrete steps)
5. git add COORDINATION.md && git commit -m "docs: session handoff" && git push
6. Print: "Done. Next session: [step 1 from COORDINATION.md]"
```

### `.claude/commands/resume.md`

```markdown
---
description: Resume from last session — read COORDINATION.md and continue
---
1. Read COORDINATION.md
2. git log --oneline -5
3. npm run typecheck
4. git status
5. Say: "Resuming. Last done: [X]. Next: [Y]."
6. Start immediately.
```

### `.claude/commands/commit.md`

```markdown
---
description: Typecheck → stage → conventional commit → push
---
1. npm run typecheck — abort if errors
2. git diff --stat
3. Write conventional commit: type(scope): message <72 chars
4. git add . && git commit -m "[message]" && git push
5. Print commit hash.
```

### `.claude/commands/new-module.md`

```markdown
---
description: Scaffold a new feature module (tasks, habits, notes, etc.)
---
Create src/modules/$ARGUMENTS/ with:
- components/.gitkeep
- hooks/.gitkeep
- store/[name]Store.ts     ← Zustand with persist + devtools + immer
- db/[name].dexie.ts       ← useLiveQuery hooks
- schema/[name].schema.ts  ← Zod schemas matching ECOSYSTEM.md
- types/[name].types.ts    ← z.infer<> exports
- CLAUDE.md                ← module context (10 lines)
- index.ts                 ← barrel exports

Then: git add . && git commit -m "chore($ARGUMENTS): scaffold module" && git push
```

### `.claude/agents/code-reviewer.md`

```markdown
---
name: code-reviewer
description: Reviews code for StayFlow quality standards. Triggers: "review", "audit", "check quality".
tools: Read, Grep, Glob
model: claude-opus-4-5
---
Senior TypeScript engineer reviewing StayFlow code.

Check:
1. TypeScript strict violations (any, @ts-ignore)
2. Missing Zod validation before DB writes
3. Default exports outside pages/layouts
4. Server calls without Dexie write first
5. Missing error + loading states
6. Amounts not stored as integer cents
7. userId not scoped in DB queries

Write findings to docs/reviews/[module]-review.md.
Return 5-line summary to main context.
```

### `.claude/agents/test-writer.md`

```markdown
---
name: test-writer
description: Writes co-located unit tests. Triggers: "write tests", "add tests", "TDD".
tools: Read, Write, Bash, Grep
model: claude-sonnet-4-5
---
Test engineer for StayFlow.
Stack: Vitest + React Testing Library + fake-indexeddb

Rules:
- Co-locate: Component.tsx → Component.test.tsx
- AAA pattern. Min 3 tests per component.
- Mock factories typed per ECOSYSTEM.md schemas.
- Test behavior, not implementation.
- Run npm run test after writing. Report N passing.
```

### `.claude/skills/finance-patterns/SKILL.md`

```markdown
---
name: finance-patterns
description: Finance module patterns for StayFlow.
  Triggers: "finance", "transaction", "budget", "expense", "income", "recurring", "chart".
---

# Finance Patterns

## Amount Rule
Store: positive integer cents. $12.50 → 1250. NEVER floats.
Display: use formatCurrency() from src/lib/utils.ts
Input: use parseCurrencyInput() to convert user decimal → cents

## Recurring Transaction Flow
1. RecurringTransaction created (nextDueDate set)
2. Cron/background check: if nextDueDate <= today AND active
3. Create Transaction with status: PENDING, recurringId: recurrence.id
4. Update nextDueDate to next occurrence
5. User sees PENDING badge → clicks Confirm → status becomes CONFIRMED

## Frequency → nextDueDate calculation
DAILY:   addDays(today, 1)
WEEKLY:  addWeeks(today, 1) — respect dayOfWeek
MONTHLY: addMonths(today, 1) — respect dayOfMonth
YEARLY:  addYears(today, 1)
(use date-fns: addDays, addWeeks, addMonths, addYears)

## Summary Hook Pattern
export const useFinanceSummary = (userId: string, year: number, month: number) => {
  const txns = useLiveQuery(
    () => db.transactions
      .where('userId').equals(userId)
      .filter(t => {
        const d = new Date(t.date)
        return d.getFullYear() === year && d.getMonth() === month - 1
          && t.status === 'CONFIRMED'
      }).toArray(),
    [userId, year, month]
  )
  const income  = (txns ?? []).filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = (txns ?? []).filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  return { income, expense, balance: income - expense, isLoading: !txns, txns: txns ?? [] }
}

## Category Colors (match seeds.ts)
food:#f7971e transport:#6c63ff housing:#43e97b health:#ff6584
entertainment:#4fc3f7 shopping:#ab47bc education:#26a69a
subscriptions:#ffa726 other-expense:#78909c
salary:#66bb6a freelance:#42a5f5 investment:#ec407a gift:#26c6da
```

### `.claude/skills/git-workflow/SKILL.md`

```markdown
---
name: git-workflow
description: Git workflow for StayFlow.
  Triggers: "commit", "push", "PR", "branch", "merge", "git".
---

# Git Workflow

## Commit Sequence
npm run typecheck     ← must pass
git add .
git commit -m "type(scope): message <72 chars"
git push origin develop
# then update COORDINATION.md

## Types × Scopes
feat(dashboard|finance|tasks|habits|notes|pwa|db|auth|ui|ci): new feature
fix|refactor|test|docs|chore|perf — same scopes

## Branches
develop → daily commits (all work goes here)
main    → PRs from develop only (production releases)

## PR
gh pr create --base main --head develop \
  --title "feat: description" \
  --body "$(cat .github/PR_TEMPLATE.md)"
```

### `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: http://localhost:3000
          GOOGLE_CLIENT_ID: placeholder
          GOOGLE_CLIENT_SECRET: placeholder
```

### `.github/workflows/claude-review.yml`

```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]
permissions:
  contents: read
  pull-requests: write
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@beta
        with:
          claude_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          direct_prompt: |
            Review this StayFlow PR. Stack: Next.js 14, TypeScript strict,
            Zustand, Dexie.js, Prisma, Zod, Recharts, Vitest.
            Check: TS violations, missing Zod validation, amounts not in cents,
            server calls before Dexie write, missing auth in API routes,
            tests not co-located, ECOSYSTEM.md field inconsistencies.
            Format: ## ❌ Blocking | ## ⚠️ Warnings | ## ✅ Passed
```

### `.github/PR_TEMPLATE.md`

```markdown
## Summary
[What this PR does]

## Changes
- [ ]

## Checklist
- [ ] npm run check passes
- [ ] TypeScript strict (no any)
- [ ] Amounts in cents
- [ ] Dexie writes before server calls
- [ ] Co-located tests
- [ ] COORDINATION.md updated
```

After Phase 4:
```bash
npm run typecheck
git add .
git commit -m "chore: Claude config, skills, agents, commands, GitHub Actions CI"
git push
```

---

## ══ FINAL STEP ══════════════════════════════════════════════════

After Phase 4 is complete:

1. Run `npm run check` — must pass
2. Update COORDINATION.md:
   - Mark all 4 phases ✅
   - Set status: "Infrastructure complete. Waiting for Pencil Dev designs."
   - Write Next Session as: "Read designs from DESIGN_HANDOFF.md, then implement Phase 5 — Finance module"
3. Commit + push COORDINATION.md
4. Print this summary:

```
══════════════════════════════════════
StayFlow Infrastructure — COMPLETE ✅
══════════════════════════════════════
GitHub repo:    https://github.com/[user]/stay-flow
Branch:         develop
Last commit:    [hash]

What's set up:
✅ Next.js 14 + TypeScript strict + Tailwind + shadcn/ui
✅ Dexie.js offline DB (transactions, categories, recurring)
✅ Prisma schema (Transaction, RecurringTransaction, Category, User, NextAuth)
✅ Zustand stores (ui, settings)
✅ Light + dark theme (next-themes)
✅ PWA manifest
✅ GitHub Actions CI (typecheck + lint + test + build)
✅ Claude automated PR review
✅ CLAUDE.md + ECOSYSTEM.md + COORDINATION.md
✅ Skills: finance-patterns, git-workflow
✅ Agents: code-reviewer, test-writer
✅ Commands: handoff, resume, commit, new-module

Next step:
→ Design screens in Pencil Dev using DESIGN_REQUIREMENTS.md
→ Then: claude "read COORDINATION.md and continue" to implement Phase 5+
══════════════════════════════════════
```

---

## ══ EXECUTION RULES ════════════════════════════════════════════

1. Work phase by phase — never skip, never merge phases
2. `npm run typecheck` before every commit — abort if it fails
3. Commit + push after EVERY phase
4. Update COORDINATION.md at end of every session
5. At 70%+ context: finish current file → commit → /handoff
6. This prompt covers Phase 0–4 ONLY — stop after Phase 4

**Start with Phase 0 now.**