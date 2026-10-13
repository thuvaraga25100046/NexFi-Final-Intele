import React, { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDownLeft,
  Bot,
  CreditCard,
  PencilLine,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import CreateRecordForm from '../components/CreateRecordForm.jsx'
import OpeningBalanceModal from '../components/OpeningBalanceModal.jsx'
import AiChatCard from '../components/dashboard/AiChatCard.jsx'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency } from '../i18n/formatters.js'
import {
  fetchCashFlowForecast,
  fetchDashboardSummary,
  fetchOpeningBalance,
  fetchReceivables,
} from '../services/api.js'
import {
  DEMO_MODE_CHANGED_EVENT,
  isDemoModeEnabled,
} from '../services/demoData.js'

// Alert shows when cash goes below zero within this many days
const ALERT_WINDOW_DAYS = 30

// Alert texts: English, Tamil, Sinhala
const ALERT_TEXT = {
  en: {
    title: 'Cash shortage warning',
    now: 'right now',
    inDays: (n, date) => `in ${n} day${n === 1 ? '' : 's'} (${date})`,
    intro: (when) => `Your cash will run short ${when}.`,
    needPrefix: 'You may need up to',
    needSuffix: '.',
    collect: ' Collect from your pending receivables:',
    none: ' You have no pending receivables, so consider delaying payables or arranging short-term funds.',
    total: 'Total to collect:',
    view: 'View receivables',
    customer: 'Customer',
    atRisk: 'At risk',
    stable: 'Stable',
  },
  ta: {
    title: 'பணப் பற்றாக்குறை எச்சரிக்கை',
    now: 'இப்போதே',
    inDays: (n, date) => `${n} நாட்களில் (${date})`,
    intro: (when) => `${when} உங்கள் பணம் பற்றாக்குறையாகும்.`,
    needPrefix: 'உங்களுக்கு',
    needSuffix: 'வரை தேவைப்படலாம்.',
    collect: ' நிலுவையில் உள்ள பெறுதொகைகளை வசூலிக்கவும்:',
    none: ' நிலுவையில் பெறுதொகைகள் இல்லை, எனவே செலுத்த வேண்டிய தொகைகளை தாமதப்படுத்தவும் அல்லது குறுகியகால நிதியை ஏற்பாடு செய்யவும்.',
    total: 'மொத்தமாக வசூலிக்க வேண்டியது:',
    view: 'பெறுதொகைகளைப் பார்க்க',
    customer: 'வாடிக்கையாளர்',
    atRisk: 'ஆபத்தில்',
    stable: 'நிலையானது',
  },
  si: {
    title: 'මුදල් හිඟ අනතුරු ඇඟවීම',
    now: 'දැන්ම',
    inDays: (n, date) => `දින ${n}කින් (${date})`,
    intro: (when) => `${when} ඔබේ මුදල් හිඟ වනු ඇත.`,
    needPrefix: 'ඔබට',
    needSuffix: 'දක්වා අවශ්‍ය විය හැක.',
    collect: ' ලැබිය යුතු හිඟ මුදල් අයකර ගන්න:',
    none: ' ලැබිය යුතු හිඟ මුදල් නැත. එබැවින් ගෙවීම් කල් දැමීම හෝ කෙටි කාලීන අරමුදල් සකසා ගැනීම සලකා බලන්න.',
    total: 'අයකර ගත යුතු මුළු මුදල:',
    view: 'ලැබිය යුතු මුදල් බලන්න',
    customer: 'ගනුදෙනුකරු',
    atRisk: 'අවදානමේ',
    stable: 'ස්ථාවරයි',
  },
}

function getAlertText(language) {
  const code = String(language || 'en').toLowerCase().slice(0, 2)
  return ALERT_TEXT[code] || ALERT_TEXT.en
}

function CompactSparkline({ data = [0, 0, 0, 0, 0, 0, 0], color, width = 80, height = 24 }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (width - 4) + 2
    const y = height - 2 - ((v - min) / range) * (height - 4)
    return `${x},${y}`
  }).join(' ')

  return (
      <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
        <polyline
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
  )
}

// How long the "video" playback of the forecast takes (start -> end)
const PLAY_SECONDS = 6

function prefersReducedMotion() {
  return (
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function CompactForecastChart({ days = [], language, currency, t }) {
  const uid = useId().replace(/:/g, '')
  const [hoverIdx, setHoverIdx] = useState(null)
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0))
  const [replayTick, setReplayTick] = useState(0)
  const rafRef = useRef(null)

  const width = 540
  const height = 180
  const padding = { top: 15, right: 20, bottom: 25, left: 55 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const balances = days.length
      ? days.map((d) => Number(d.projectedBalance))
      : [0, 0, 0, 0, 0, 0, 0]
  const n = balances.length

  const min = Math.min(0, ...balances)
  const max = Math.max(...balances) || 1
  const range = max - min || 1

  const getX = (idx) => padding.left + (idx / Math.max(n - 1, 1)) * plotWidth
  const getY = (val) => padding.top + plotHeight - ((val - min) / range) * plotHeight

  const pts = balances.map((b, i) => `${getX(i)},${getY(b)}`).join(' ')
  const lastX = getX(n - 1)
  const firstX = getX(0)
  const bottomY = padding.top + plotHeight

  const pathSegments = balances.map((b, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(b)}`)
  const areaD = `${pathSegments.join(' ')} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`

  // Part of the line below zero turns red
  const zeroFrac = Math.min(1, Math.max(0, (getY(0) - padding.top) / plotHeight))
  const firstNegIdx = balances.findIndex((b) => b < 0)

  // Restart the playback whenever the data changes
  const animKey = `${n}-${balances[0]}-${balances[n - 1]}-${min}-${max}`

  useEffect(() => {
    if (prefersReducedMotion()) {
      setProgress(1)
      return undefined
    }
    const duration = PLAY_SECONDS * 1000
    let start = null
    setProgress(0)
    const step = (ts) => {
      if (start === null) start = ts
      const p = Math.min(1, (ts - start) / duration)
      setProgress(p)
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animKey, replayTick])

  // Moving "playhead" position (interpolated between two days)
  const pos = progress * (n - 1)
  const i0 = Math.floor(pos)
  const i1 = Math.min(n - 1, i0 + 1)
  const frac = pos - i0
  const headBalance = balances[i0] + (balances[i1] - balances[i0]) * frac
  const headX = padding.left + (pos / Math.max(n - 1, 1)) * plotWidth
  const headY = getY(headBalance)
  const playing = progress < 1
  const liveIdx = Math.min(n - 1, Math.round(pos))

  const dateFor = (idx) => {
    const raw = days[idx]?.date || days[idx]?.day
    let d = raw ? new Date(raw) : null
    if (!d || Number.isNaN(d.getTime())) d = new Date(Date.now() + idx * 86400000)
    return d.toLocaleDateString(language, { day: 'numeric', month: 'short' })
  }

  const handleMove = (e) => {
    if (!days.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * width
    const idx = Math.round(((x - padding.left) / plotWidth) * (n - 1))
    setHoverIdx(Math.min(n - 1, Math.max(0, idx)))
  }

  // Tooltip: follows the mouse when hovering, follows the playhead while playing
  let tip = null
  if (hoverIdx !== null) {
    tip = {
      x: getX(hoverIdx),
      y: getY(balances[hoverIdx]),
      value: balances[hoverIdx],
      label: dateFor(hoverIdx),
    }
  } else if (playing && days.length) {
    tip = { x: headX, y: headY, value: headBalance, label: dateFor(liveIdx) }
  }

  const boxW = 120
  const boxH = 36
  const boxX = tip ? (tip.x + 10 + boxW > width - 4 ? tip.x - boxW - 10 : tip.x + 10) : 0

  const dotX = hoverIdx !== null ? getX(hoverIdx) : headX
  const dotY = hoverIdx !== null ? getY(balances[hoverIdx]) : headY
  const dotValue = hoverIdx !== null ? balances[hoverIdx] : headBalance

  return (
      <div className="w-full relative">
        <style>{`
          @keyframes nfPop {
            0% { opacity: 0; transform: scale(0); }
            70% { opacity: 1; transform: scale(1.5); }
            100% { opacity: 1; transform: scale(1); }
          }
          .nf-pop {
            transform-box: fill-box;
            transform-origin: center;
            opacity: 0;
            animation: nfPop 0.45s ease-out forwards;
          }
        `}</style>

        <button
            type="button"
            onClick={() => setReplayTick((v) => v + 1)}
            aria-label="Replay"
            title="Replay"
            className="absolute right-0 -top-1 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
        </button>

        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto block select-none"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient
                id={`nf-line-${uid}`}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={padding.top}
                x2="0"
                y2={bottomY}
            >
              <stop offset="0" stopColor="#6366f1" />
              <stop offset={zeroFrac} stopColor="#6366f1" />
              <stop offset={zeroFrac} stopColor="#f43f5e" />
              <stop offset="1" stopColor="#f43f5e" />
            </linearGradient>
            <clipPath id={`nf-clip-${uid}`}>
              <rect x="0" y="0" width={playing ? headX : width} height={height} />
            </clipPath>
          </defs>

          <line
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + plotHeight}
              y2={padding.top + plotHeight}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-800"
          />
          <line
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + plotHeight / 2}
              y2={padding.top + plotHeight / 2}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-800"
              strokeDasharray="3 3"
          />

          {/* Line + area drawn up to the playhead */}
          <g clipPath={`url(#nf-clip-${uid})`}>
            <path d={areaD} fill={`url(#nf-line-${uid})`} fillOpacity="0.14" />
            <polyline
                points={pts}
                fill="none"
                stroke={`url(#nf-line-${uid})`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
          </g>

          {/* Playhead guide line */}
          {playing && hoverIdx === null && (
              <line
                  x1={headX}
                  x2={headX}
                  y1={padding.top}
                  y2={bottomY}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
              />
          )}

          {/* Pulsing danger marker once the playhead passes the first negative day */}
          {firstNegIdx >= 0 && pos >= firstNegIdx && (
              <g>
                <circle
                    cx={getX(firstNegIdx)}
                    cy={getY(balances[firstNegIdx])}
                    r="4"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    opacity="0"
                >
                  <animate attributeName="r" values="4;15" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0" dur="1.6s" repeatCount="indefinite" />
                </circle>
                <circle
                    className="nf-pop"
                    cx={getX(firstNegIdx)}
                    cy={getY(balances[firstNegIdx])}
                    r="4"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                />
              </g>
          )}

          {/* Axis labels */}
          <text
              x={padding.left - 8}
              y={getY(max) + 4}
              textAnchor="end"
              className="fill-slate-900 dark:fill-slate-100 text-[10px] font-mono font-bold"
          >
            {formatCurrency(max, language, currency)}
          </text>
          <text
              x={padding.left - 8}
              y={getY(min) - 2}
              textAnchor="end"
              className="fill-slate-900 dark:fill-slate-100 text-[10px] font-mono font-bold"
          >
            {formatCurrency(min, language, currency)}
          </text>
          <text
              x={padding.left}
              y={height - 6}
              textAnchor="start"
              className="fill-slate-900 dark:fill-slate-100 text-[10px] font-bold"
          >
            {t ? t('dashboard.chartToday') : 'Today'}
          </text>
          <text
              x={width - padding.right}
              y={height - 6}
              textAnchor="end"
              className="fill-slate-900 dark:fill-slate-100 text-[10px] font-bold"
          >
            {t ? t('dashboard.chart30Days') : '+30 Days'}
          </text>

          {/* Video-style progress bar */}
          <rect
              x={padding.left}
              y={height - 2}
              width={plotWidth}
              height="2"
              rx="1"
              fill="#94a3b8"
              opacity="0.25"
          />
          <rect
              x={padding.left}
              y={height - 2}
              width={plotWidth * progress}
              height="2"
              rx="1"
              fill={dotValue < 0 ? '#f43f5e' : '#6366f1'}
          />

          {/* Moving dot (playhead / hover point) */}
          <circle cx={dotX} cy={dotY} r="9" fill={dotValue < 0 ? '#f43f5e' : '#6366f1'} opacity="0.18" />
          <circle
              cx={dotX}
              cy={dotY}
              r="4.5"
              fill="#ffffff"
              stroke={dotValue < 0 ? '#f43f5e' : '#6366f1'}
              strokeWidth="2.5"
          />

          {/* Tooltip */}
          {tip && (
              <g pointerEvents="none">
                {hoverIdx !== null && (
                    <line
                        x1={tip.x}
                        x2={tip.x}
                        y1={padding.top}
                        y2={bottomY}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                    />
                )}
                <rect
                    x={boxX}
                    y={padding.top + 2}
                    width={boxW}
                    height={boxH}
                    rx="8"
                    fill="#0f172a"
                    stroke="#334155"
                />
                <text
                    x={boxX + 10}
                    y={padding.top + 16}
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="600"
                >
                  {tip.label}
                </text>
                <text
                    x={boxX + 10}
                    y={padding.top + 30}
                    fill={tip.value < 0 ? '#fb7185' : '#ffffff'}
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="monospace"
                >
                  {formatCurrency(tip.value, language, currency)}
                </text>
              </g>
          )}
        </svg>
      </div>
  )
}

// Finds the first day (within ALERT_WINDOW_DAYS) where projected cash goes below zero
function detectCashShortage(forecast) {
  const days = forecast?.days
  if (!days || !days.length) return null

  const limit = Math.min(days.length - 1, ALERT_WINDOW_DAYS)
  let firstIdx = -1
  for (let i = 0; i <= limit; i++) {
    if (Number(days[i].projectedBalance) < 0) {
      firstIdx = i
      break
    }
  }
  if (firstIdx === -1) return null

  // Lowest point in the whole forecast = how much cash is needed
  const lowest = Math.min(...days.map((d) => Number(d.projectedBalance)))

  // Use the forecast date if it exists, otherwise today + index
  const rawDate = days[firstIdx].date || days[firstIdx].day
  const date = rawDate ? new Date(rawDate) : new Date(Date.now() + firstIdx * 86400000)

  return {
    daysLeft: firstIdx,
    shortfall: Math.abs(lowest),
    date,
  }
}

function CashShortageAlert({ shortage, receivables, language, currency }) {
  const dateText = shortage.date.toLocaleDateString(language, {
    day: 'numeric',
    month: 'short',
  })

  const pending = receivables
      .filter((r) => !['paid', 'received'].includes(String(r.status).toLowerCase()))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  const pendingTotal = pending.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const topThree = pending.slice(0, 3)

  const txt = getAlertText(language)

  const whenText =
      shortage.daysLeft === 0 ? txt.now : txt.inDays(shortage.daysLeft, dateText)

  return (
      <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300">
              {txt.title}
            </h3>
            <p className="text-xs text-rose-700/90 dark:text-rose-200/90 mt-1">
              {txt.intro(whenText)} {txt.needPrefix}{' '}
              <strong>{formatCurrency(shortage.shortfall, language, currency)}</strong>{' '}
              {txt.needSuffix}
              {pending.length > 0 ? txt.collect : txt.none}
            </p>

            {topThree.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {topThree.map((r, idx) => (
                      <li
                          key={r.id ?? idx}
                          className="flex items-center justify-between gap-3 text-xs rounded-lg bg-white/70 dark:bg-slate-900/60 border border-rose-100 dark:border-rose-900/40 px-3 py-2"
                      >
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {r.customerName || r.clientName || r.customer || r.name || txt.customer}
                  </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(r.amount, language, currency)}
                  </span>
                      </li>
                  ))}
                </ul>
            )}

            {pending.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                {txt.total} {formatCurrency(pendingTotal, language, currency)}
              </span>
                  <Link
                      to="/receivables"
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  >
                    {txt.view}
                  </Link>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}

function ModalFrame({ title, onClose, children }) {
  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
      >
        <div
            role="dialog"
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 relative animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                type="button"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
  )
}

function KPICard({ title, value, trend, trendLabel, icon: IconProp, iconBg }) {
  return (
      <article className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400/40 transition-colors">
        <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-950 dark:text-slate-100">
          {title}
        </span>
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
            {typeof IconProp === 'function' ? <IconProp size={18} /> : <Bot size={18} />}
          </div>
        </div>
        <div>
          <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            {value}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-slate-950 dark:text-slate-100 font-extrabold">
          <TrendingUp size={12} className="text-emerald-500" /> {trend} {trendLabel}
        </span>
          <CompactSparkline data={[0, 0, 0, 0, 0, 0, 0]} color="#10b981" width={60} height={18} />
        </div>
      </article>
  )
}

export default function DashboardPage() {
  const { t, language, currency } = useTranslation()
  const [openingBalanceDialogOpen, setOpeningBalanceDialogOpen] = useState(false)
  const [recordKind, setRecordKind] = useState(null)
  const [demoMode, setDemoMode] = useState(() => isDemoModeEnabled())

  const [summary, setSummary] = useState(null)
  const [openingBalance, setOpeningBalance] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [receivables, setReceivables] = useState([])

  const loadData = async () => {
    try {
      const summaryRes = await fetchDashboardSummary()
      setSummary(summaryRes)
      const openingRes = await fetchOpeningBalance()
      setOpeningBalance(openingRes)
      const forecastRes = await fetchCashFlowForecast()
      setForecast(forecastRes)
    } catch (err) {
      console.error(err)
    }

    // Separate try so a receivables error never breaks the rest of the dashboard
    try {
      const receivablesRes = await fetchReceivables()
      setReceivables(Array.isArray(receivablesRes) ? receivablesRes : [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
    const syncDemoMode = () => setDemoMode(isDemoModeEnabled())
    window.addEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
    return () => window.removeEventListener(DEMO_MODE_CHANGED_EVENT, syncDemoMode)
  }, [])

  const balance = Number(summary?.currentCashBalance ?? openingBalance?.amount ?? 0)
  const income = Number(summary?.totalIncome ?? 0)
  const expenses = Number(summary?.totalExpenses ?? 0)

  const forecastEnd = forecast?.days?.length
      ? Number(forecast.days[forecast.days.length - 1].projectedBalance)
      : balance + income - expenses

  const shortage = detectCashShortage(forecast)

  const healthScore = balance === 0 && income === 0 && expenses === 0 ? 0 : Math.round(
      50 + (balance / 200000) * 20 + (income > 0 ? Math.min(10, Math.round(income / 5000)) : 0)
  )
  const healthColor = healthScore >= 80 ? 'emerald' : healthScore >= 60 ? 'indigo' : 'slate'

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm inline-block mb-2">
            Executive Command
          </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {t('dashboard.overviewTitle')}
            </h1>
            <p className="text-sm font-semibold mt-1 text-slate-600 dark:text-slate-400">
              {t('dashboard.overviewSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
                onClick={() => setOpeningBalanceDialogOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                type="button"
            >
              <PencilLine size={15} />
              <span>{t('dashboard.baseCapital')}</span>
            </button>
          </div>
        </div>

        <section aria-label="Executive KPIs" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
              title={t('dashboard.currentBalance')}
              value={formatCurrency(balance, language, currency)}
              trend="0.0"
              trendLabel="%"
              icon={Wallet}
              iconBg="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          />
          <KPICard
              title={t('dashboard.totalIncome')}
              value={formatCurrency(income, language, currency)}
              trend="0.0"
              trendLabel="%"
              icon={ArrowDownLeft}
              iconBg="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
          />
          <KPICard
              title={t('dashboard.totalExpenses')}
              value={formatCurrency(expenses, language, currency)}
              trend="0.0"
              trendLabel="%"
              icon={CreditCard}
              iconBg="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
          />
          <KPICard
              title={t('dashboard.forecastedEndBalance')}
              value={formatCurrency(forecastEnd, language, currency)}
              trend="0.0"
              trendLabel="%"
              icon={Sparkles}
              iconBg="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
          />
          <KPICard
              title={t('dashboard.financialHealthScore')}
              value={`${healthScore}/100`}
              trend="Initial"
              trendLabel=""
              icon={Bot}
              iconBg={`bg-${healthColor}-50 dark:bg-${healthColor}-950/40 text-${healthColor}-600 dark:text-${healthColor}-400`}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {t('dashboard.outlook30dTitle')}
              </span>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  {t('forecast.title')}
                </h2>
              </div>
              <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      shortage
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
              >
                {shortage ? getAlertText(language).atRisk : getAlertText(language).stable}
              </span>
            </div>

            {shortage && (
                <CashShortageAlert
                    shortage={shortage}
                    receivables={receivables}
                    language={language}
                    currency={currency}
                />
            )}

            <CompactForecastChart
                days={forecast?.days || []}
                language={language}
                currency={currency}
                t={t}
            />
          </div>

          <AiChatCard
              healthScore={healthScore}
              balance={balance}
              income={income}
              expenses={expenses}
              forecast={forecast}
          />
        </section>

        {openingBalanceDialogOpen && (
            <OpeningBalanceModal
                amount={openingBalance?.amount ?? 0}
                onClose={() => setOpeningBalanceDialogOpen(false)}
            />
        )}

        {recordKind && (
            <ModalFrame
                title={
                  recordKind === 'transaction'
                      ? t('dashboard.addTransactionModal')
                      : recordKind === 'receivable'
                          ? t('dashboard.addReceivableModal')
                          : t('dashboard.addPayableModal')
                }
                onClose={() => setRecordKind(null)}
            >
              <CreateRecordForm
                  kind={recordKind}
                  onCancel={() => setRecordKind(null)}
                  onCreated={() => {
                    setRecordKind(null)
                    loadData()
                  }}
              />
            </ModalFrame>
        )}
      </div>
  )
}