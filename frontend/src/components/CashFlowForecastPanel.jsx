import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import ResourceState from './ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchCashFlowForecast } from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'

function ForecastChart({ days, language, chartLabel, dateOptions }) {
  const width = 900
  const top = 12
  const bottom = 178
  const balances = days.map((day) => Number(day.projectedBalance) || 0)
  const minBalance = Math.min(0, ...balances)
  const maxBalance = Math.max(0, ...balances)
  const range = maxBalance - minBalance || 1
  const yForBalance = (balance) => bottom - ((balance - minBalance) / range) * (bottom - top)
  const points = balances.map((balance, index) => ({
    x: 14 + (index * (width - 28)) / Math.max(days.length - 1, 1),
    y: yForBalance(balance),
  }))
  const pointString = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const areaString = points.length
    ? `${points[0].x},${yForBalance(0)} ${pointString} ${points[points.length - 1].x},${yForBalance(0)}`
    : ''
  const lastPoint = points[points.length - 1]

  return (
    <div className="cash-flow-chart-wrap">
      <svg
        aria-label={chartLabel}
        className="cash-flow-chart"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${width} 190`}
      >
        {[top, (top + bottom) / 2, bottom].map((y) => (
          <line className="cash-flow-gridline" key={y} x1="8" x2={width - 8} y1={y} y2={y} />
        ))}
        <line className="cash-flow-zero-line" x1="8" x2={width - 8} y1={yForBalance(0)} y2={yForBalance(0)} />
        {areaString && <polygon className="cash-flow-area" points={areaString} />}
        {pointString && <polyline className="cash-flow-line" points={pointString} />}
        {lastPoint && <circle className="cash-flow-endpoint" cx={lastPoint.x} cy={lastPoint.y} r="4" />}
      </svg>
      <div className="cash-flow-date-range"><span>{formatDate(days[0].date, language, dateOptions)}</span><span>{formatDate(days[days.length - 1].date, language, dateOptions)}</span></div>
    </div>
  )
}

export default function CashFlowForecastPanel() {
  const { t, language, currency } = useTranslation()
  const forecast = useApiResource(fetchCashFlowForecast)
  const days = forecast.data?.days ?? []

  return (
    <section className="workspace-panel cash-flow-forecast">
      <div className="panel-heading">
        <div><span className="panel-eyebrow">{t('forecast.eyebrow')}</span><h2>{t('forecast.title')}</h2></div>
        <span className="forecast-horizon">{t('forecast.horizon')}</span>
      </div>
      <p className="forecast-description">{t('forecast.description')}</p>
      <ResourceState
        loading={forecast.loading}
        error={forecast.error}
        retry={forecast.retry}
        empty={!days.length}
        emptyTitle={t('forecast.empty')}
      />
      {!forecast.loading && !forecast.error && days.length > 0 && (
        <>
          <div className="forecast-totals">
            <div className="forecast-total"><span>{t('forecast.openingCash')}</span><strong>{formatCurrency(forecast.data.openingBalance, language, currency)}</strong></div>
            <div className="forecast-total forecast-inflow"><span><ArrowDownLeft size={13} /> {t('forecast.expectedIn')}</span><strong>{formatCurrency(forecast.data.expectedInflow, language, currency)}</strong></div>
            <div className="forecast-total forecast-outflow"><span><ArrowUpRight size={13} /> {t('forecast.expectedOut')}</span><strong>{formatCurrency(forecast.data.expectedOutflow, language, currency)}</strong></div>
            <div className="forecast-total forecast-projected"><span>{t('forecast.projectedEnd')}</span><strong>{formatCurrency(forecast.data.projectedBalance, language, currency)}</strong></div>
          </div>
          <ForecastChart days={days} language={language} chartLabel={t('forecast.chartLabel')} dateOptions={{ month: 'short', day: 'numeric' }} />
        </>
      )}
    </section>
  )
}