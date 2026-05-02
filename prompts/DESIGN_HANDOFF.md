# StayFlow — Design Handoff
# Извлечено из Claude Design автоматически
# Дата: 2026-04-21
# ══════════════════════════════════════════════════════════════
# Claude Code: читай этот файл перед реализацией любого экрана.
# Это финальный источник правды по дизайну.
# ══════════════════════════════════════════════════════════════

---

## СТАТУС ЭКРАНОВ

- [x] Dashboard (desktop + mobile)
- [x] Finance (desktop + mobile)
- [x] Recurring (desktop + mobile)
- [x] Categories (desktop + mobile)
- [x] Settings (desktop + mobile)
- [x] Add Transaction Modal
- [ ] Add Recurring Modal (нужно реализовать по паттерну)

---

## DESIGN TOKENS — ТОЧНЫЕ ЗНАЧЕНИЯ ИЗ ДИЗАЙНА

### Шрифты
```
font-family: 'Outfit', sans-serif;   ← основной (body, UI, labels)
```
Установить в globals.css как дефолт для всего приложения.
Заголовки страниц (Dashboard, Finance и т.д.) — тот же Outfit, bold.
Числа/суммы — тоже Outfit, но можно JetBrains Mono для amount input.

### Цвета — Light Theme

```css
/* Backgrounds */
--bg-page:          #f0eee9;   /* тёплый бежевый — фон всего приложения */
--bg-surface:       #ffffff;   /* карточки, модальные, sidebar */
--bg-surface-2:     #fafaf7;   /* вторичные поверхности */
--bg-surface-3:     #f3f3ee;   /* hover state, мягкие разделители */
--bg-input:         #f0f0ea;   /* фон инпутов */

/* Sidebar */
--bg-sidebar:       #1a1612;   /* тёмный sidebar в светлой теме! */
--sidebar-text:     rgba(250, 250, 247, 0.85);
--sidebar-text-dim: rgba(250, 250, 247, 0.55);
--sidebar-active-bg: rgba(255,255,255,0.08);
--sidebar-active-indicator: #2d4dff; /* синяя вертикальная полоса */

/* Text */
--text-primary:     #1a1612;   /* почти чёрный с тёплым оттенком */
--text-secondary:   rgba(40, 30, 20, 0.65);
--text-tertiary:    rgba(40, 30, 20, 0.45);
--text-disabled:    rgba(40, 30, 20, 0.30);
--text-on-dark:     #faf4a8;   /* светло-жёлтый для текста на тёмном */

/* Accent */
--color-accent:     #2d4dff;   /* основной синий — кнопки, active state */
--color-accent-bg:  #e7efff;   /* светлый фон для accent badges */

/* Semantic */
--color-income:     #0f8f5a;   /* тёмно-зелёный */
--color-income-bg:  #e8f7ef;
--color-expense:    #c73e3e;   /* тёмно-красный */
--color-expense-bg: #fbeee7;
--color-pending:    #d97757;   /* тёплый оранжевый — PENDING статус */
--color-pending-bg: #fbeee7;

/* Categories (из дизайна) */
--cat-food:         #e8a44a;   /* тёплый оранжевый */
--cat-transport:    #5b8def;   /* голубой */
--cat-housing:      #2f9d8a;   /* бирюзовый */
--cat-subscriptions:#8a6bc8;   /* фиолетовый */
--cat-shopping:     #c73e3e;   /* красный */
--cat-health:       #47a373;   /* зелёный */
--cat-leisure:      #c7943e;   /* золотой */
--cat-salary:       #0f8f5a;   /* тёмно-зелёный */
--cat-other:        #6b6a63;   /* серый */

/* Borders */
--border:           rgba(40, 30, 20, 0.10);
--border-strong:    rgba(40, 30, 20, 0.18);

/* Shadows */
--shadow-card:      0 1px 3px rgba(26,22,18,0.07), 0 1px 2px rgba(26,22,18,0.04);
--shadow-modal:     0 8px 40px rgba(26,22,18,0.18), 0 2px 8px rgba(26,22,18,0.08);
```

### Цвета — Dark Theme ("Night owl")

```css
/* Backgrounds */
--bg-page:          #1a1612;   /* тёмный тёплый */
--bg-surface:       #26221e;
--bg-surface-2:     #2e2a26;
--bg-surface-3:     #343028;
--bg-input:         #302c28;

/* Sidebar */
--bg-sidebar:       #111009;   /* ещё темнее чем bg-page */
--sidebar-text:     rgba(250, 250, 247, 0.85);
--sidebar-text-dim: rgba(250, 250, 247, 0.45);

/* Text */
--text-primary:     #fafaf7;
--text-secondary:   rgba(250, 248, 240, 0.70);
--text-tertiary:    rgba(250, 248, 240, 0.45);

/* Accent — те же значения, работают в обеих темах */
--color-accent:     #2d4dff;
--color-income:     #0f8f5a;
--color-expense:    #c73e3e;
--color-pending:    #d97757;

/* Borders */
--border:           rgba(255,255,255,0.08);
--border-strong:    rgba(255,255,255,0.14);
```

### Spacing & Radius

```css
/* Border Radius */
--radius-sm:    4px;
--radius-md:    8px;
--radius-lg:    12px;
--radius-xl:    16px;
--radius-full:  9999px;

/* Layout */
--sidebar-width:        220px;
--topnav-height:        52px;
--page-padding-x:       32px;   /* desktop */
--page-padding-x-mob:   16px;   /* mobile */
--card-padding:         20px;
--card-gap:             12px;
```

---

## КОМПОНЕНТЫ — ТОЧНОЕ ОПИСАНИЕ ИЗ ДИЗАЙНА

### Sidebar (Desktop)
- Ширина: 220px, фиксированная, тёмная (`#1a1612` в light теме тоже!)
- Логотип: квадратная иконка + "stayflow" текст + версия "V0.1"
- Секция "WORKSPACE" — label caps, затем nav items
- Nav item: иконка (Lucide) + label, padding 8px 12px, border-radius 8px
- Active: тонкая синяя вертикальная полоса слева (3px) + слегка светлый bg
- Внизу: "NEXT RECURRING" мини-блок (следующая подписка) + user avatar
- НЕТ кнопки collapse в MVP дизайне

### TopNav
- Высота ~52px, прозрачный фон (контент прокручивается под ним)
- Слева: заголовок страницы (крупный) + subtitle ("April 2025 · USD")
- Справа: Light/Dark toggle (pill с двумя кнопками) + синяя кнопка "+ New" + иконки (search, bell)
- Light/Dark toggle: маленький, встроен в nav, не в Settings

### Finance Stat Cards
- Три карточки в строку: INCOME (зелёный) / EXPENSES (красный) / NET (нейтральный)
- Каждая: label caps маленький + большое число (Outfit bold) + percentage vs last month
- Percentage: зелёный если положительный, красный если отрицательный
- NET карточка: "Best month YTD" или подобный insight текст

### Spend Calendar (уникальная фича дизайна)
- Правая колонка на Finance экране (рядом с Area Chart)
- Мини-календарь текущего месяца
- Дни с расходами — окрашены: чем больше потрачено, тем темнее цвет
- Клик на день — показывает детали расходов за тот день
- Реализация: Tailwind grid 7 колонок + opacity по сумме расходов

### Area Chart (Income vs Expenses)
- Recharts AreaChart + ResponsiveContainer
- 6 месяцев данных по X
- Две Area: income (зелёная, заливка 20% opacity) и expenses (красная)
- Линии тонкие, без dots
- Кастомный Tooltip в стиле дизайна
- Y-axis: форматированные суммы ($0k, $1.7k и т.д.)

### Transaction List Item
- Layout: [цветной аватар с инициалами] [название + категория · дата] [сумма]
- Аватар: круглый, цвет берётся из категории, 2 буквы
- Сумма: зелёная с + для income, красная с − для expense
- PENDING строки: оранжевый текст "(pending)" + маленькая кнопка Confirm рядом с суммой
- Grouped by date: заголовок-разделитель "THURSDAY, APR 10 · 1 item"

### Add Transaction Modal
- Белый overlay, border-radius xl, shadow-modal
- Заголовок: "New transaction" + крестик [×]
- Tab switcher: Income / Expense (pill style, active = filled)
- AMOUNT: по центру, крупный текст "-$0.00", prefix цвет меняется по табу
- CATEGORY: row пилюль с цветными бейджами (Food, Transport, Privacy, Selected...)
- DATE: слева, CURRENCY: справа — одна строка
- NOTE: textarea с placeholder "Tell me..."
- Footer: [Cancel] ghost btn + [+ New transaction] primary btn

### Recurring List Item
- Layout: [цветной квадрат с иконкой] [название + частота badge] [сумма] [edit/pause]
- Frequency badge: "● MONTHLY" маленький, серый текст
- Aggregate stats вверху: "MONTHLY COMMIT $1,892.97 · ACTIVE COUNT 5 subs · NEXT ITEM 2 upcoming"

### Categories Screen
- Две вкладки: Expense | Income
- Секция "SYSTEM (CANNOT EDIT)": сетка 2 колонки, каждая категория — [цветной кружок + название + count "N articles"]
- Секция "MY CATEGORIES": список с edit/delete кнопками

### Settings Screen
- Profile block вверху: цветной аватар AM + имя + email + Edit кнопка
- APPEARANCE: Theme toggle (Light/Auto/Dark) + Accent color (5 цветных кружков)
- FINANCE: Default currency (dropdown) + Week starts on (Sun/Mon) + Round to nearest dollar (toggle)
- DATA: Export all data (кликабельная строка)

---

## ОТКЛОНЕНИЯ ОТ DESIGN_REQUIREMENTS.md

1. **Sidebar тёмный даже в light теме** — это намеренно, создаёт контраст
2. **Light/Dark toggle в TopNav**, а не только в Settings
3. **Accent color picker в Settings** — 5 предустановленных цветов на выбор
4. **Spend Calendar** — дополнительная фича, не было в требованиях. Реализовать обязательно
5. **Transaction аватары** — цветные круги с инициалами, не emoji категорий
6. **Stat Cards** показывают % к прошлому месяцу — нужен computed hook
7. **"Round to nearest dollar" toggle** в Settings — добавить в UserSettings схему
8. **Sidebar внизу**: мини-блок "NEXT RECURRING" — показывает ближайшую подписку
9. **Фон**: `#f0eee9` тёплый бежевый (не белый)
10. **Accent**: `rgb(45,77,255)` = `#2d4dff` (не `#3b82f6` как в требованиях)
11. **Категории — 2 колонки** на Categories экране, не список
12. **Mobile**: bottom nav 3 таба (Home иконка домика, Finance кружок, Settings шестерёнка)

---

## ДОПОЛНЕНИЯ К ECOSYSTEM.md

Добавить в UserSettings:
```
roundToNearestDollar: boolean (default false)
accentColor: string (hex, default '#2d4dff')
```

Добавить в TransactionCategory:
```
txCount: number  ← computed, не хранить в DB, считать на лету
```

---

## ПРОМТ ДЛЯ PHASE 5 — Finance Module

```
Read COORDINATION.md, ECOSYSTEM.md, and DESIGN_HANDOFF.md carefully.

Implement the complete Finance module for StayFlow.
The design is a warm minimal aesthetic with these exact tokens (from DESIGN_HANDOFF.md):
- Page background: #f0eee9 (warm beige)
- Sidebar: dark #1a1612 even in light theme
- Accent: #2d4dff
- Font: Outfit (already in globals.css)
- Income green: #0f8f5a / Expense red: #c73e3e

Work in this order:

PHASE 5a — Types + Schemas
- src/modules/finance/types/finance.types.ts (from ECOSYSTEM.md)
- src/modules/finance/schema/transaction.schema.ts (Zod)
- src/modules/finance/schema/category.schema.ts (Zod)

PHASE 5b — Dexie hooks
- src/modules/finance/db/transactions.dexie.ts
  hooks: useTransactionsQuery(userId, year, month), useAddTransaction,
  useUpdateTransaction, useDeleteTransaction, useConfirmPending
- src/modules/finance/db/categories.dexie.ts
  hooks: useCategoriesQuery, useAddCategory, useDeleteCategory
- src/db/seeds.ts — seedDefaultCategories() called on first app load

PHASE 5c — Zustand store
- src/modules/finance/store/financeStore.ts
  state: selectedYear, selectedMonth (default today), selectedAccount ('all')
  computed: current month label (e.g. "April 2025 · USD")

PHASE 5d — Summary hooks
- src/modules/finance/hooks/useFinanceSummary.ts
  returns: { income, expense, net, incomePctVsLastMonth, expensePctVsLastMonth }
  PENDING transactions are EXCLUDED from totals (only CONFIRMED count)
- src/modules/finance/hooks/useSpendCalendar.ts
  returns: { [YYYY-MM-DD]: totalSpent } for current month
  Used to color-code calendar days by spend intensity
- src/modules/finance/hooks/useMonthlyChart.ts
  returns: last 6 months [{month: 'Nov', income: cents, expenses: cents}, ...]

PHASE 5e — Components (match design exactly)
- FinanceStatCards.tsx — 3 cards: Income/Expenses/Net with % vs last month
- FinanceAreaChart.tsx — Recharts 6-month income vs expenses
- SpendCalendar.tsx — 7-col grid, days colored by spend intensity (4 shades)
- TransactionListItem.tsx — colored initials avatar + name + category·date + amount
  PENDING items: orange "(pending)" label + small Confirm button
- TransactionListGroup.tsx — date header "THURSDAY, APR 10 · N items" + items
- TransactionList.tsx — grouped list + empty state
- AddTransactionModal.tsx — Income/Expense tab + amount input + category pills
  + date + currency + note + Cancel/Save buttons
- CategoryPill.tsx — colored pill with emoji + label, selectable state
- MonthSelector.tsx — "← April 2025 →" navigation

PHASE 5f — Finance page
- src/app/(app)/finance/page.tsx
  Layout: month selector + "+ Add" button in header
  3 stat cards row
  Two-column: [Area Chart] [Spend Calendar] — stacks on mobile
  Transaction list grouped by date

After each phase: npm run typecheck → commit → push
After all phases: npm run check → commit → update COORDINATION.md

KEY RULES:
- Amounts always in integer cents internally
- formatCurrency() from src/lib/utils.ts for display
- PENDING transactions excluded from income/expense totals
- Spend Calendar: opacity scale based on amount — 0=transparent, 1-2000=10%, 2001-5000=25%, 5001-10000=50%, 10001+=80%
- Category pills in modal: horizontal scroll, show top 5 + "more" button
- % vs last month: positive = green arrow up, negative = red arrow down
```

---

## ПРОМТ ДЛЯ PHASE 6 — Dashboard

```
Read COORDINATION.md and DESIGN_HANDOFF.md.

Implement the Dashboard screen. Match design exactly.

src/app/(app)/dashboard/page.tsx
src/modules/dashboard/widgets/

COMPONENTS:

1. DashboardGreeting
   "Good morning/afternoon/evening, [name]."  ← time-based greeting
   "You've kept $X,XXX.XX this month — that's N% more than [last month]"
   Use useFinanceSummary() for the balance number

2. FinanceSummaryWidget (card)
   Header: "FINANCES · APRIL" + "Open →" link to /finance
   Large NET balance (green if positive, red if negative)
   Two mini rows: ↑ INCOME $X,XXX + ↓ EXPENSES $X,XXX
   Small sparkline chart (last 6 months, income only, tiny)

3. ComingSoonWidget (card)
   For future modules (Tasks, Habits etc.)
   Shows title + "Coming soon" in muted style
   Props: { title: string, description: string, icon: LucideIcon }

4. RecentTransactionsWidget
   "Last N transactions" + "See all →" link
   Last 5 transactions using TransactionListItem component
   Empty state if no transactions

5. Widget Registry Pattern:
   src/modules/dashboard/registry.ts — array of widget configs
   Each: { id, component, colSpan (1 or 2), order }
   WidgetGrid.tsx renders widgets from registry
   Adding new widget = push to registry array only

LAYOUT (match design):
Desktop: 2-column grid. Finance widget colSpan=1, Coming Soon colSpan=1
         Recent Transactions: colSpan=2 (full width)
Mobile: single column, stacked

After: npm run check → commit → update COORDINATION.md
```

---

## ПРОМТ ДЛЯ PHASE 7 — App Shell

```
Read COORDINATION.md and DESIGN_HANDOFF.md.

Implement the complete App Shell. This is the most critical visual component.
Match the design EXACTLY — dark sidebar in light theme is intentional.

src/components/layout/Sidebar.tsx
- Width: 220px, background: var(--bg-sidebar) = #1a1612 in BOTH themes
- Logo: small square icon (S initial) + "stayflow" lowercase + "V0.1" muted
- Section label: "WORKSPACE" — tiny caps, very muted color
- Nav items: Dashboard / Finance / Recurring / Categories / Settings
  Icons from Lucide: LayoutDashboard / DollarSign / RefreshCcw / Tag / Settings
  Active: 3px left border accent + subtle bg highlight
- Bottom section:
  "NEXT RECURRING" label + one RecurringPreviewItem (title + days + amount)
  User avatar block: initials circle + name + email
- NO collapse button in MVP

src/components/layout/TopNav.tsx
- height: 52px, transparent background
- Left: page title (h1 style) + subtitle (month · currency, on Finance page)
- Right: Light/Dark/Auto pill toggle + blue "+ New" button + search icon + bell icon
- "+ New" button: opens AddTransactionModal when on Finance or Dashboard pages
  On other pages: context-aware (add category on Categories, etc.)

src/components/layout/BottomNav.tsx (mobile only, <768px)
- 3 tabs: Home (house icon) / Finance (circle icon) / Settings (gear icon)
- Active: accent color icon + label
- Fixed bottom, white/dark bg, border-top

src/components/layout/AppShell.tsx
- Desktop (≥768px): Sidebar (fixed left) + main content (margin-left 220px)
- Mobile (<768px): TopNav + content + BottomNav (no sidebar)
- Page background: var(--bg-page) = #f0eee9 light / #1a1612 dark

globals.css — CSS variables:
Add ALL tokens from DESIGN_HANDOFF.md as CSS variables.
.dark class overrides for dark theme (next-themes applies 'dark' to <html>).

tailwind.config.ts:
Add custom colors mapping to CSS variables:
  bg-page: 'var(--bg-page)'
  bg-surface: 'var(--bg-surface)'
  text-primary: 'var(--text-primary)'
  accent: 'var(--color-accent)'
  income: 'var(--color-income)'
  expense: 'var(--color-expense)'
  etc.

After: npm run check → commit → update COORDINATION.md
```

---

## ПРОМТ ДЛЯ PHASE 8 — Recurring

```
Read COORDINATION.md and DESIGN_HANDOFF.md.

Implement the Recurring module. Match design.

AGGREGATE STATS ROW (top of page, 3 stat pills):
- MONTHLY COMMIT: sum of all active EXPENSE recurring amounts
- ACTIVE COUNT: "N subs"
- NEXT ITEM: "N upcoming" (recurring whose nextDueDate <= today + 7 days)

RECURRING LIST ITEM:
[colored square avatar] [title + "● MONTHLY" frequency badge] [amount] [actions]
- Amount: green for INCOME, red for EXPENSE
- Actions: pause/resume icon + edit icon (··· menu on mobile)

SECTIONS: ACTIVE (list) + PAUSED (list, if any)

BACKGROUND JOB (useRecurringProcessor hook):
- Runs on app mount and every hour
- Checks all active RecurringTransactions where nextDueDate <= today
- For each: create Transaction with status PENDING + update nextDueDate
- Frequency calculation uses date-fns: addDays/addWeeks/addMonths/addYears

After: npm run check → commit → update COORDINATION.md
```

---

## ПРОМТ ДЛЯ PHASE 9 — Categories + Settings

```
Read COORDINATION.md and DESIGN_HANDOFF.md.

PHASE 9a — Categories page
src/app/(app)/categories/page.tsx

Tabs: Expense | Income
System categories section: 2-column grid
Each: [colored circle] [name] [transaction count]
System categories: no edit/delete buttons

My categories section: list
Each: [colored circle] [name] [count] [edit pencil] [delete trash]
Delete: confirm dialog

New category: modal with name input + emoji picker (text input) + color picker (6 swatches)

PHASE 9b — Settings page
src/app/(app)/settings/page.tsx

PROFILE: avatar (initials, colored) + name + email + Edit button (no-op in MVP)

APPEARANCE:
- Theme: pill toggle Light / Auto / Dark → updates next-themes + settingsStore
- Accent color: 5 colored circles (preset colors from design), click to select
  Presets: #2d4dff (blue) / #8a6bc8 (purple) / #d97757 (orange) / #0f8f5a (green) / #c73e3e (red)
  Selected: checkmark overlay

FINANCE:
- Default currency: searchable dropdown (ISO 4217)
- Week starts on: Sun | Mon pill toggle
- Round to nearest dollar: toggle switch

DATA:
- Export all data: click → downloads JSON of all Dexie tables
- Format: { exportedAt, transactions[], recurringTransactions[], categories[] }

After: npm run check → commit → update COORDINATION.md
```