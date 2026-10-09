import { useCallback } from 'react'
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, TriangleAlert } from 'lucide-react'
import ResourceState from './ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchCashFlowForecast } from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'

const FORECAST_DAYS = 30
const chart = { width: 900, height: 290, left: 88, right: 86, top: 20, bottom: 236 }

function CashFlowChart({ days, openingBalance, language, currency, safetyBuffer, chartLabel, t }) {
  const balanceValues = [openingBalance, ...days.map((day) => Number(day.projectedBalance) || 0)]
  const minBalance = Math.min(0, safetyBuffer, ...balanceValues)
  const maxBalance = Math.max(safetyBuffer, ...balanceValues)
  const padding = Math.max((maxBalance - minBalance) * 0.12, 100)
  const min = minBalance - padding
  const max = maxBalance + padding
  const plotWidth = chart.width - chart.left - chart.right
  const plotHeight = chart.bottom - chart.top
  const xForIndex = (index) => chart.left + (index * plotWidth) / Math.max(days.length, 1)
  const yForBalance = (balance) => chart.top + ((max - balance) / (max - min)) * plotHeight
  const maxDailyFlow = Math.max(1, ...days.flatMap((day) => [Number(day.incoming) || 0, Number(day.outgoing) || 0]))
  const yForFlow = (value) => chart.bottom - ((Number(value) || 0) / maxDailyFlow) * plotHeight
  const balancePoints = [
    { x: chart.left, value: openingBalance },
    ...days.map((day, index) => ({ x: xForIndex(index + 1), value: Number(day.projectedBalance) || 0 })),
  ].map(({ x, value }) => ({ x, y: yForBalance(value), value }))
  const incomePoints = [{ x: chart.left, y: chart.bottom, value: 0 }, ...days.map((day, index) => ({
    x: xForIndex(index + 1),
    y: yForFlow(day.incoming),
    value: Number(day.incoming) || 0,
  }))]
  const expensePoints = [{ x: chart.left, y: chart.bottom, value: 0 }, ...days.map((day, index) => ({
    x: xForIndex(index + 1),
    y: yForFlow(day.outgoing),
    value: Number(day.outgoing) || 0,
  }))]
  const zeroY = yForBalance(0)
  const bufferY = yForBalance(safetyBuffer)
  const projectionArea = `M ${balancePoints[0].x} ${balancePoints[0].y} ${balancePoints.slice(1).map(({ x, y }) => `L ${x} ${y}`).join(' ')} L ${balancePoints.at(-1).x} ${yForBalance(openingBalance)} Z`
  const balanceLine = balancePoints.map(({ x, y }) => `${x},${y}`).join(' ')
  const incomeLine = incomePoints.map(({ x, y }) => `${x},${y}`).join(' ')
  const expenseLine = expensePoints.map(({ x, y }) => `${x},${y}`).join(' ')
  const firstShortageIndex = balancePoints.findIndex(({ value }) => value < 0)
  const tickValues = [0, 1, 2, 3].map((index) => min + ((max - min) * index) / 3)
  const dateOptions = { month: 'short', day: 'numeric' }
  const dateTicks = [0, 7, 14, 21, 30]
  const flowTicks = [0, maxDailyFlow / 2, maxDailyFlow]
  const compactCurrency = new Intl.NumberFormat(language === 'ta' ? 'ta-IN' : language === 'si' ? 'si-LK' : 'en-LK', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })

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
            <linearGradient id="forecast-projection-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#7367d8" stopOpacity=".22" />
              <stop offset="100%" stopColor="#7367d8" stopOpacity=".015" />
            </linearGradient>
          </defs>
          <rect
            className="forecast-projection-window"
            x={chart.left}
            y={chart.top}
            width={plotWidth}
            height={plotHeight}
            rx="7"
          />
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
        <path className="forecast-projection-area" d={projectionArea} fill="url(#forecast-projection-gradient)" />
        <polyline className="forecast-income-line" points={incomeLine} />
        <polyline className="forecast-expense-line" points={expenseLine} />
        <polyline className="forecast-balance-line" points={balanceLine} />
        {incomePoints.slice(1).map((point, index) => point.value > 0 && (
          <circle className="forecast-income-point" cx={point.x} cy={point.y} key={`income-${days[index].date}`} r="3">
            <title>{`${formatDate(days[index].date, language, dateOptions)} · ${t('forecast.expectedIn')}: ${formatCurrency(point.value, language, currency)}`}</title>
          </circle>
        ))}
        {expensePoints.slice(1).map((point, index) => point.value > 0 && (
          <circle className="forecast-expense-point" cx={point.x} cy={point.y} key={`expense-${days[index].date}`} r="3">
            <title>{`${formatDate(days[index].date, language, dateOptions)} · ${t('forecast.expectedOut')}: ${formatCurrency(point.value, language, currency)}`}</title>
          </circle>
        ))}
        {flowTicks.map((value) => (
          <text className="forecast-flow-axis-label" key={value} x={chart.width - chart.right + 8} y={yForFlow(value) + 4}>
            {compactCurrency.format(value)}
          </text>
        ))}
        {firstShortageIndex >= 0 && (
          <g>
            <line
              className="forecast-shortage-marker"
              x1={balancePoints[firstShortageIndex].x}
              x2={balancePoints[firstShortageIndex].x}
              y1={chart.top}
              y2={chart.bottom}
            />
            <circle
              className="forecast-shortage-dot"
              cx={balancePoints[firstShortageIndex].x}
              cy={balancePoints[firstShortageIndex].y}
              r="5"
            >
              <title>
                {t('home.shortageMarker', {
                  date: firstShortageIndex === 0 ? t('home.forecastToday') : formatDate(days[firstShortageIndex - 1].date, language, dateOptions),
                  amount: formatCurrency(Math.abs(balancePoints[firstShortageIndex].value), language, currency),
                })}
              </title>
            </circle>
          </g>
        )}
      </svg>
      <div className="forecast-date-ticks" aria-hidden="true">
        {dateTicks.map((offset) => {
          const date = offset === 0
            ? new Date(`${days[0].date}T00:00:00`)
            : new Date(`${days[Math.min(offset - 1, days.length - 1)].date}T00:00:00`)
          if (offset === 0) date.setDate(date.getDate() - 1)
          return <span key={offset}>{offset === 0 ? t('home.forecastToday') : formatDate(date, language, dateOptions)}</span>
        })}
      </div>
      <div className="forecast-chart-legend">
        <span><i className="legend-green" />{t('home.balance')}</span>
        <span><i className="legend-income" />{t('forecast.expectedIn')}</span>
        <span><i className="legend-expense" />{t('forecast.expectedOut')}</span>
        <span><i className="legend-projection" />30-day projection</span>
        <span><i className="legend-zero" />{t('home.zeroBalance')}</span>
        <span><i className="legend-buffer" />{t('home.safetyBuffer', { amount: formatCurrency(safetyBuffer, language, currency) })}</span>
      </div>
    </div>
  )
}

export default function CashFlowForecastPanel({ onShortageAction }) {
  const { t, language, currency } = useTranslation()
  const loadForecast = useCallback((signal) => fetchCashFlowForecast(signal, FORECAST_DAYS), [])
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
        <span className="forecast-range-badge">{t('home.forecastNext30Days')}</span>
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
            chartLabel={t('home.forecastChartLabel', { count: FORECAST_DAYS })}
            currency={currency}
            days={days}
            openingBalance={data.openingBalance}
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
