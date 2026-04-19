import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, startOfMonth, endOfMonth } from 'date-fns'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const formatCurrency = (
  cents: number,
  currency = 'USD',
  locale = 'en-US'
): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)

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
