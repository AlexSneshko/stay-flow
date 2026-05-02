export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionStatus = 'CONFIRMED' | 'PENDING'

export interface Category {
  slug: string
  name: string
  icon: string
  color: string
  type: 'INCOME' | 'EXPENSE' | 'BOTH'
  isDefault: boolean
  order: number
}

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'] as const
export type Currency = typeof CURRENCIES[number]

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', RUB: '₽', JPY: '¥',
  CAD: 'C$', AUD: 'A$', CHF: 'Fr', CNY: '¥',
}

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
