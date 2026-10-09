import { useCallback, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, TriangleAlert } from 'lucide-react'
import ResourceState from './ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchCashFlowForecast } from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'

const horizons = [30, 60, 90]
const chart = { width: 720, height: 260, left: 76, right: 14, top: 18, bottom: 222 }

function splitArea(points, zeroY) {
  if (!points.length) return ''
  return `M ${points[0].x} ${zeroY} ${points.map(({ x, y }) => `L ${x} ${y}`).join(' ')} L ${points[points.length - 1].x} ${zeroY} Z`
}

function CashFlowChart({ days, language, currency, safetyBuffer, chartLabel, t }) {
  const balances = days.map((day) => Number(day.projectedBalance) || 0)
  const minBalance = Math.min(-safetyBuffer, ...balances)
  const maxBalance = Math.max(safetyBuffer, ...balances)
  const padding = Math.max((maxBalance - minBalance) * 0.12, 100)
  const min = minBalance - padding
  const max = maxBalance + padding
  const plotWidth = chart.width - chart.left - chart.right
  const plotHeight = chart.bottom - chart.top
  const xForIndex = (index) => chart.left + (index * plotWidth) / Math.max(days.length - 1, 1)
  const yForBalance = (balance) => chart.top + ((max - balance) / (max - min)) * plotHeight
  const points = balances.map((balance, index) => ({ x: xForIndex(index), y: yForBalance(balance) }))
  const zeroY = yForBalance(0)
  const bufferY = yForBalance(safetyBuffer)
  const area = splitArea(points, zeroY)
  const firstShortageIndex = balances.findIndex((balance) => balance < 0)
  const tickValues = [0, 1, 2, 3].map((index) => min + ((max - min) * index) / 3)
  const dateOptions = { month: 'short', day: 'numeric' }
  const dateTicks = [0, Math.floor((days.length - 1) / 2), days.length - 1]

  return (
    <div className="forecast-chart" role="group" aria-label={chartLabel}>
      <svg
        aria-label={chartLabel}
        className="forecast-chart-svg"
        role="img"
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id="forecast-positive-area">
            <rect x={chart.left} y={chart.top} width={plotWidth} height={Math.max(0, zeroY - chart.top)} />
          </clipPath>
          <clipPath id="forecast-negative-area">
            <rect x={chart.left} y={zeroY} width={plotWidth} height={Math.max(0, chart.bottom - zeroY)} />
          </clipPath>
        </defs>
        {tickValues.map((value) => {
          const y = yForBalance(value)
          return (
            <g key={value}>
              <line className="forecast-grid-line" x1={chart.left} x2={chart.width - chart.right} y1={y} y2={y} />
              <text className="forecast-axis-label" x={chart.left - 9} y={y + 4} textAnchor="end">
                {formatCurrency(value, language, currency)}
              </text>
            </g>
          )
        })}
        <line className="forecast-zero-line" x1={chart.left} x2={chart.width - chart.right} y1={zeroY} y2={zeroY} />
        <line className="forecast-buffer-line" x1={chart.left} x2={chart.width - chart.right} y1={bufferY} y2={bufferY} />
        <path d={area} fill="#2f8055" opacity=".2" clipPath="url(#forecast-positive-area)" />
        <path d={area} fill="#c2493d" opacity=".25" clipPath="url(#forecast-negative-area)" />
        <polyline className="forecast-balance-line" points={points.map(({ x, y }) => `${x},${y}`).join(' ')} />
        {firstShortageIndex >= 0 && (
          <g>
            <line
              className="forecast-shortage-marker"
              x1={points[firstShortageIndex].x}
              x2={points[firstShortageIndex].x}
              y1={chart.top}
              y2={chart.bottom}
            />
            <circle
              className="forecast-shortage-dot"
              cx={points[firstShortageIndex].x}
              cy={points[firstShortageIndex].y}
              r="5"
            >
              <title>
                {t('home.shortageMarker', {
                  date: formatDate(days[firstShortageIndex].date, language, dateOptions),
                  amount: formatCurrency(Math.abs(balances[firstShortageIndex]), language, currency),
                })}
              </title>
            </circle>
          </g>
        )}
      </svg>
      <div className="forecast-date-ticks" aria-hidden="true">
        {dateTicks.map((index) => <span key={index}>{formatDate(days[index].date, language, dateOptions)}</span>)}
      </div>
      <div className="forecast-chart-legend">
        <span><i className="legend-green" />{t('home.balance')}</span>
        <span><i className="legend-zero" />{t('home.zeroBalance')}</span>
        <span><i className="legend-buffer" />{t('home.safetyBuffer', { amount: formatCurrency(safetyBuffer, language, currency) })}</span>
      </div>
    </div>
  )
}

export default function CashFlowForecastPanel({ onShortageAction }) {
  const { t, language, currency } = useTranslation()
  const [horizon, setHorizon] = useState(30)
  const loadForecast = useCallback((signal) => fetchCashFlowForecast(signal, horizon), [horizon])
  const forecast = useApiResource(loadForecast)
  const data = forecast.data
  const days = data?.days ?? []
  const safetyBuffer = Math.max(0, Number(data?.expectedOutflow ?? 0) * 0.1)
  const shortage = data?.shortageAlert
  const lastDate = days.length ? formatDate(days[days.length - 1].date, language) : ''

  return (
    <section className="home-card forecast-card" aria-labelledby="forecast-heading">
      <div className="home-section-heading forecast-heading">
        <div>
          <span className="home-kicker">{t('forecast.eyebrow')}</span>
          <h2 id="forecast-heading">{t('forecast.title')}</h2>
          <p>{t('home.forecastSubtitle')}</p>
        </div>
        <div className="horizon-switch" role="group" aria-label={t('home.forecastRange')}>
          {horizons.map((value) => (
            <button
              aria-pressed={horizon === value}
              className={horizon === value ? 'horizon-selected' : ''}
              key={value}
              onClick={() => setHorizon(value)}
              type="button"
            >
              {t('home.days', { count: value })}
            </button>
          ))}
        </div>
      </div>

      {shortage ? (
        <div className={`home-alert home-alert-${String(shortage.severity).toLowerCase()}`} role="alert">
          <span className="home-alert-icon"><TriangleAlert size={19} /></span>
          <div className="home-alert-copy">
            <strong>{t('home.shortageNotice', {
              date: formatDate(shortage.shortageDate, language),
              amount: formatCurrency(shortage.shortageAmount, language, currency),
            })}</strong>
            <button className="home-alert-action" onClick={onShortageAction} type="button">
              {t('home.avoidShortage')}
            </button>
          </div>
        </div>
      ) : (
        !forecast.loading && !forecast.error && days.length > 0 && (
          <div className="home-alert home-alert-safe">
            <span className="home-alert-icon"><CheckCircle2 size={19} /></span>
            <strong>{t('home.safeThrough', { date: lastDate })}</strong>
          </div>
        )
      )}

      <ResourceState loading={forecast.loading} error={forecast.error} retry={forecast.retry} empty={!days.length} emptyTitle={t('forecast.empty')} />
      {!forecast.loading && !forecast.error && days.length > 0 && (
        <>
          <CashFlowChart
            chartLabel={t('home.forecastChartLabel', { count: horizon })}
            currency={currency}
            days={days}
            language={language}
            safetyBuffer={safetyBuffer}
            t={t}
          />
          <div className="forecast-summary-grid">
            <div><span>{t('forecast.openingCash')}</span><strong>{formatCurrency(data.openingBalance, language, currency)}</strong></div>
            <div className="forecast-summary-in"><span><ArrowDownLeft size={14} />{t('forecast.expectedIn')}</span><strong>{formatCurrency(data.expectedInflow, language, currency)}</strong></div>
            <div className="forecast-summary-out"><span><ArrowUpRight size={14} />{t('forecast.expectedOut')}</span><strong>{formatCurrency(data.expectedOutflow, language, currency)}</strong></div>
            <div><span>{t('forecast.projectedEnd')}</span><strong className={Number(data.projectedBalance) < 0 ? 'forecast-negative-value' : ''}>{formatCurrency(data.projectedBalance, language, currency)}</strong></div>
          </div>
        </>
      )}
    </section>
  )
}
