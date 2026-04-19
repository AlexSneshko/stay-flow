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
