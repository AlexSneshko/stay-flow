'use client'

interface StatCardProps {
  label: string
  value: string
  trend: string
  trendDir?: 'up' | 'dn' | 'neutral'
  valueColor?: string
}

export function StatCard({ label, value, trend, trendDir = 'neutral', valueColor }: StatCardProps) {
  return (
    <div className="sf-stat-card">
      <div className="sf-stat-label">{label}</div>
      <div className="sf-stat-value" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className={`sf-stat-trend${trendDir !== 'neutral' ? ` ${trendDir}` : ''}`}>
        {trend}
      </div>
    </div>
  )
}

interface StatRowProps {
  income: number
  expense: number
  net: number
  incomePct: number
  expensePct: number
  currency: string
  formatFn: (cents: number, currency?: string) => string
  bestMonthLabel: string
}

export function FinanceStatRow({
  income, expense, net, incomePct, expensePct, currency, formatFn, bestMonthLabel
}: StatRowProps) {
  const arrow = (pct: number) => pct === 0 ? '' : pct > 0 ? '▲' : '▼'
  const incUp = incomePct >= 0
  const expUp = expensePct > 0  // higher expense = bad (inverted)

  return (
    <div className="sf-stat-row">
      <StatCard
        label="Income"
        value={formatFn(income, currency)}
        trend={`${arrow(incomePct)} ${Math.abs(incomePct)}% vs last month`}
        trendDir={incomePct === 0 ? 'neutral' : incUp ? 'up' : 'dn'}
        valueColor="var(--income)"
      />
      <StatCard
        label="Expenses"
        value={formatFn(expense, currency)}
        trend={`${arrow(expensePct)} ${Math.abs(expensePct)}% vs last month`}
        trendDir={expensePct === 0 ? 'neutral' : expUp ? 'dn' : 'up'}
        valueColor="var(--expense)"
      />
      <StatCard
        label="Net"
        value={(net >= 0 ? '+' : '−') + formatFn(Math.abs(net), currency)}
        trend={bestMonthLabel}
        trendDir="neutral"
        valueColor={net >= 0 ? 'var(--income)' : 'var(--expense)'}
      />
    </div>
  )
}
