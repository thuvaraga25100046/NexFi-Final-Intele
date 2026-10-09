import { useId } from 'react'
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { formatCurrency } from '../../i18n/formatters.js'

function Sparkline({ data, color, height = 36, width = 110 }) {
  const gradientId = useId()
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 3
  const effectiveHeight = height - padding * 2
  const effectiveWidth = width - padding * 2

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * effectiveWidth
    const y = height - padding - ((val - min) / range) * effectiveHeight
    return { x, y }
  })

  // Create smooth bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const mx = (p0.x + p1.x) / 2
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="3"
        fill={color}
        className="animate-pulse"
      />
    </svg>
  )
}

export default function ExecutiveKPISection({
  summary,
  forecast,
  language = 'en',
  currency = 'LKR',
}) {
  const balance = Number(summary?.currentCashBalance ?? 148250)
  const income = Number(summary?.totalIncome ?? 42600)
  const expenses = Number(summary?.totalExpenses ?? 18340)
  
  // Compute 30-day forecasted balance
  const forecastEnd = forecast?.days?.length
    ? Number(forecast.days[forecast.days.length - 1].projectedBalance)
    : balance + (income - expenses) * 0.95

  const kpis = [
    {
      id: 'current-balance',
      label: 'Current Balance',
      value: balance,
      trend: '+18.4%',
      trendPositive: true,
      sublabel: 'vs last month · $24k buffer',
      icon: Wallet,
      iconColor: '#10b981',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      sparklineColor: '#10b981',
      sparklineData: [110, 115, 112, 128, 124, 138, 142, 148],
    },
    {
      id: 'monthly-income',
      label: 'Monthly Income',
      value: income,
      trend: '+12.8%',
      trendPositive: true,
      sublabel: 'Pace: +$1,420/day inflow',
      icon: TrendingUp,
      iconColor: '#06b6d4',
      iconBg: 'rgba(6, 182, 212, 0.12)',
      sparklineColor: '#06b6d4',
      sparklineData: [26, 29, 31, 30, 36, 38, 41, 42.6],
    },
    {
      id: 'monthly-expenses',
      label: 'Monthly Expenses',
      value: expenses,
      trend: '-3.4%',
      trendPositive: true, // Lower expenses is positive
      sublabel: '42 days burn buffer remaining',
      icon: CreditCard,
      iconColor: '#f43f5e',
      iconBg: 'rgba(244, 63, 94, 0.12)',
      sparklineColor: '#f43f5e',
      sparklineData: [22, 21, 19.5, 20.8, 19, 18.8, 18.5, 18.34],
    },
    {
      id: 'forecasted-balance',
      label: 'Forecasted End Balance',
      value: forecastEnd,
      trend: '+9.1%',
      trendPositive: true,
      sublabel: '95% confidence projection',
      icon: Sparkles,
      iconColor: '#818cf8',
      iconBg: 'rgba(129, 140, 248, 0.14)',
      sparklineColor: '#818cf8',
      sparklineData: [148, 151, 153, 158, 162, 166, 170, 172.5],
    },
  ]

  return (
    <section aria-label="Executive Financial Summary" className="w-full mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const TrendIcon = kpi.trendPositive ? ArrowUpRight : ArrowDownRight
          return (
            <article
              key={kpi.id}
              className="fintech-card fintech-kpi-card group cursor-default"
            >
              {/* Card Top: Icon & Trend */}
              <div className="fintech-kpi-top">
                <div
                  className="fintech-kpi-icon"
                  style={{ backgroundColor: kpi.iconBg, color: kpi.iconColor }}
                >
                  <Icon size={19} strokeWidth={2.2} />
                </div>
                <div
                  className={`fintech-kpi-trend ${
                    kpi.trendPositive ? 'positive' : 'negative'
                  }`}
                >
                  <TrendIcon size={13} strokeWidth={2.5} />
                  <span>{kpi.trend}</span>
                </div>
              </div>

              {/* Card Middle: Label & Big Value */}
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-400 block mb-1">
                  {kpi.label}
                </span>
                <div className="fintech-kpi-val group-hover:text-indigo-400 transition-colors">
                  {formatCurrency(kpi.value, language, currency)}
                </div>
              </div>

              {/* Card Bottom: Sparkline & Subtext */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                  {kpi.sublabel}
                </span>
                <div className="flex-shrink-0">
                  <Sparkline
                    data={kpi.sparklineData}
                    color={kpi.sparklineColor}
                    height={28}
                    width={84}
                  />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
