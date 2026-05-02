'use client'

import { useMemo } from 'react'
import { MONTHS_SHORT } from '../types'

interface MonthData {
  ym: string
  income: number
  expense: number
}

interface FinanceChartProps {
  data: MonthData[]
}

function pathFor(values: number[], xFor: (i: number) => number, yFor: (v: number) => number, innerH: number, padT: number) {
  if (values.length < 2) return { line: '', area: '' }
  const pts = values.map((v, i) => [xFor(i), yFor(v)])
  let line = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i]
    const mx = (p0[0] + p1[0]) / 2
    line += ` C${mx.toFixed(1)},${p0[1].toFixed(1)} ${mx.toFixed(1)},${p1[1].toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`
  }
  const lastX = xFor(values.length - 1)
  const area = line + ` L${lastX.toFixed(1)},${(padT + innerH).toFixed(1)} L${xFor(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`
  return { line, area }
}

export function FinanceChart({ data }: FinanceChartProps) {
  const svgMarkup = useMemo(() => {
    const w = 560, h = 220, padL = 40, padR = 14, padT = 14, padB = 28
    const innerW = w - padL - padR
    const innerH = h - padT - padB

    const incVals = data.map(d => d.income)
    const expVals = data.map(d => d.expense)
    const maxVal = Math.max(...incVals, ...expVals, 100)
    const tickStep = Math.pow(10, Math.floor(Math.log10(maxVal / 100))) * 100
    const niceMax = Math.ceil(maxVal / tickStep) * tickStep

    const xFor = (i: number) => padL + (innerW * i) / (data.length - 1)
    const yFor = (v: number) => padT + innerH * (1 - v / niceMax)

    const inc = pathFor(incVals, xFor, yFor, innerH, padT)
    const exp = pathFor(expVals, xFor, yFor, innerH, padT)

    const ticks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax]
    const fmtShort = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`

    let html = ''

    for (const t of ticks) {
      const y = yFor(t)
      html += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="var(--border)" stroke-width="1" stroke-dasharray="2 3"/>`
      html += `<text x="${padL - 8}" y="${y + 3}" text-anchor="end" font-size="9.5" font-family="Outfit" fill="var(--text-tertiary)" letter-spacing="0.04em">${fmtShort(t)}</text>`
    }

    for (let i = 0; i < data.length; i++) {
      const [, mm] = data[i].ym.split('-').map(Number)
      const x = xFor(i)
      html += `<text x="${x}" y="${h - 8}" text-anchor="middle" font-size="10" font-family="Outfit" fill="var(--text-tertiary)">${MONTHS_SHORT[mm - 1]}</text>`
    }

    if (inc.area) html += `<path d="${inc.area}" fill="var(--income)" fill-opacity="0.14"/>`
    if (exp.area) html += `<path d="${exp.area}" fill="var(--expense)" fill-opacity="0.14"/>`
    if (inc.line) html += `<path d="${inc.line}" fill="none" stroke="var(--income)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
    if (exp.line) html += `<path d="${exp.line}" fill="none" stroke="var(--expense)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`

    for (let i = 0; i < data.length; i++) {
      html += `<circle cx="${xFor(i)}" cy="${yFor(incVals[i])}" r="2.5" fill="var(--income)"/>`
      html += `<circle cx="${xFor(i)}" cy="${yFor(expVals[i])}" r="2.5" fill="var(--expense)"/>`
    }

    return { markup: html, w, h }
  }, [data])

  return (
    <div className="sf-card" style={{ padding: '18px 20px' }}>
      <div className="sf-card-head">
        <div className="sf-card-label">Income vs Expenses · 6M</div>
        <div className="sf-chart-legend">
          <span><span className="sf-chart-dot" style={{ background: 'var(--income)' }} />Income</span>
          <span><span className="sf-chart-dot" style={{ background: 'var(--expense)' }} />Expense</span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${svgMarkup.w} ${svgMarkup.h}`}
        className="sf-chart-svg"
        preserveAspectRatio="none"
        dangerouslySetInnerHTML={{ __html: svgMarkup.markup }}
      />
    </div>
  )
}
