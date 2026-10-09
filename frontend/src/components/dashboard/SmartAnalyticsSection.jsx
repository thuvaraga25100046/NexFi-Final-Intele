import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  PieChart,
  Percent,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { formatCurrency } from '../../i18n/formatters.js'

export default function SmartAnalyticsSection({ language = 'en', currency = 'LKR' }) {
  const [activeDonutIdx, setActiveDonutIdx] = useState(null)

  // 1. Income vs Expense 6-Month Data
  const monthlyFlowData = [
    { month: 'May', income: 34000, expense: 21000 },
    { month: 'Jun', income: 38500, expense: 24200 },
    { month: 'Jul', income: 41200, expense: 22800 },
    { month: 'Aug', income: 39000, expense: 25400 },
    { month: 'Sep', income: 44500, expense: 23100 },
    { month: 'Oct', income: 48600, expense: 24800 },
  ]
  const maxFlow = Math.max(...monthlyFlowData.flatMap((m) => [m.income, m.expense])) * 1.15

  // 2. Monthly Spending Breakdown Donut Data
  const spendingCategories = [
    { name: 'Cloud Infrastructure & IT', amount: 8430, percent: 34, color: '#6366f1' },
    { name: 'Payroll & Contractors', amount: 6940, percent: 28, color: '#10b981' },
    { name: 'Growth & Acquisition', amount: 4460, percent: 18, color: '#06b6d4' },
    { name: 'Office & Operations', amount: 2970, percent: 12, color: '#f59e0b' },
    { name: 'Software & SaaS Tools', amount: 1980, percent: 8, color: '#f43f5e' },
  ]
  const totalSpend = spendingCategories.reduce((sum, c) => sum + c.amount, 0)

  // Generate SVG Donut Path slices
  let cumulativeAngle = -Math.PI / 2
  const donutSlices = spendingCategories.map((cat, idx) => {
    const sliceAngle = (cat.percent / 100) * (2 * Math.PI)
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + sliceAngle
    cumulativeAngle = endAngle

    const cx = 80
    const cy = 80
    const rOuter = 70
    const rInner = 46

    const x1 = cx + rOuter * Math.cos(startAngle)
    const y1 = cy + rOuter * Math.sin(startAngle)
    const x2 = cx + rOuter * Math.cos(endAngle)
    const y2 = cy + rOuter * Math.sin(endAngle)

    const x3 = cx + rInner * Math.cos(endAngle)
    const y3 = cy + rInner * Math.sin(endAngle)
    const x4 = cx + rInner * Math.cos(startAngle)
    const y4 = cy + rInner * Math.sin(startAngle)

    const largeArc = sliceAngle > Math.PI ? 1 : 0

    const pathD = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`

    return { ...cat, pathD, idx }
  })

  // 3. Collection Rate Gauge calculation
  const collectionRate = 94.6
  const gaugeRadius = 40
  const gaugeCircumference = 2 * Math.PI * gaugeRadius
  const gaugeOffset = gaugeCircumference - (collectionRate / 100) * gaugeCircumference

  // 4. Payment Performance
  const paymentCompliance = 98.4

  return (
    <section aria-label="Smart Financial Analytics" className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="fintech-kicker">Deep Performance</span>
          <span className="text-slate-400">·</span>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Smart Analytics
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">Trailing 6-Month Rolling Analysis</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CHART 1: Income vs Expense (6 Cols) */}
        <article className="lg:col-span-6 fintech-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Income vs Expense Velocity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Monthly cash conversion & operating margin
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Inflow
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-rose-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Outflow
                </span>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 px-2">
              {monthlyFlowData.map((d, i) => {
                const incomeHeight = (d.income / maxFlow) * 100
                const expenseHeight = (d.expense / maxFlow) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full max-w-[36px] flex items-end justify-center gap-1.5 h-full">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incomeHeight}%` }}
                        className="w-1/2 bg-emerald-500 rounded-t-md group-hover:brightness-110 transition-all relative"
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                          {formatCurrency(d.income, language, currency)}
                        </span>
                      </div>
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expenseHeight}%` }}
                        className="w-1/2 bg-rose-500 rounded-t-md group-hover:brightness-110 transition-all relative"
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                          {formatCurrency(d.expense, language, currency)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 mt-2 block">
                      {d.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>Operating Profit Margin:</span>
            <strong className="text-emerald-500 font-extrabold">+48.9% (Oct peak)</strong>
          </div>
        </article>

        {/* CHART 2: Monthly Spending Breakdown (Donut) (6 Cols) */}
        <article className="lg:col-span-6 fintech-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Monthly Spending Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Categorical distribution of operational burn
                </p>
              </div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totalSpend, language, currency)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Donut SVG */}
              <div className="sm:col-span-5 flex items-center justify-center relative">
                <svg viewBox="0 0 160 160" className="w-36 h-36">
                  {donutSlices.map((slice) => (
                    <path
                      key={slice.idx}
                      d={slice.pathD}
                      fill={slice.color}
                      className="cursor-pointer transition-transform origin-center hover:scale-105"
                      opacity={activeDonutIdx === null || activeDonutIdx === slice.idx ? 1 : 0.45}
                      onMouseEnter={() => setActiveDonutIdx(slice.idx)}
                      onMouseLeave={() => setActiveDonutIdx(null)}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                    Total Out
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    100%
                  </span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="sm:col-span-7 space-y-1.5">
                {spendingCategories.map((cat, idx) => (
                  <div
                    key={cat.name}
                    className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                      activeDonutIdx === idx ? 'bg-slate-100 dark:bg-white/10' : ''
                    }`}
                    onMouseEnter={() => setActiveDonutIdx(idx)}
                    onMouseLeave={() => setActiveDonutIdx(null)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {cat.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>Primary cost driver:</span>
            <strong className="text-indigo-400 font-extrabold">Cloud Infrastructure (34%)</strong>
          </div>
        </article>

        {/* METRIC CARD 3: Receivables Collection Rate (6 Cols) */}
        <article className="lg:col-span-6 fintech-card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 90 90">
                <circle
                  cx="45"
                  cy="45"
                  r={gaugeRadius}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="45"
                  cy="45"
                  r={gaugeRadius}
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-slate-900 dark:text-white">
                {collectionRate}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Efficiency Gauge
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Receivables Collection Rate
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Days Sales Outstanding (DSO): <strong>18.2 Days</strong> vs 35D industry benchmark.
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Top 10% Decile
            </span>
          </div>
        </article>

        {/* METRIC CARD 4: Payment Performance (6 Cols) */}
        <article className="lg:col-span-6 fintech-card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={28} strokeWidth={2.3} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Compliance & Trust
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Payment Performance: {paymentCompliance}%
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero late penalty charges incurred. Average settlement velocity: <strong>1.8 days</strong>.
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Zero Penalties
            </span>
          </div>
        </article>
      </div>
    </section>
  )
}
