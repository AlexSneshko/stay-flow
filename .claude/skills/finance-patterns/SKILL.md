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
