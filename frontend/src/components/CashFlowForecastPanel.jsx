import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import ResourceState from './ResourceState.jsx'
import useApiResource from '../hooks/useApiResource.js'
import { fetchCashFlowForecast } from '../services/api.js'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const formatAmount = (amount) => currency.format(Number(amount) || 0)
const formatDate = (date) => dateFormat.format(new Date(`${date}T00:00:00`))

function ForecastChart({ days }) {
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
        aria-label="Projected cash balance for each of the next 30 days"
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
      <div className="cash-flow-date-range"><span>{formatDate(days[0].date)}</span><span>{formatDate(days[days.length - 1].date)}</span></div>
    </div>
  )
}

export default function CashFlowForecastPanel() {
  const forecast = useApiResource(fetchCashFlowForecast)
  const days = forecast.data?.days ?? []

  return (
    <section className="workspace-panel cash-flow-forecast">
      <div className="panel-heading">
        <div><span className="panel-eyebrow">PROJECTED POSITION</span><h2>Cash flow forecast</h2></div>
        <span className="forecast-horizon">NEXT 30 DAYS</span>
      </div>
      <p className="forecast-description">Recorded transactions and unpaid items projected by due date.</p>
      <ResourceState
        loading={forecast.loading}
        error={forecast.error}
        retry={forecast.retry}
        empty={!days.length}
        emptyTitle="No forecast data is available."
      />
      {!forecast.loading && !forecast.error && days.length > 0 && (
        <>
          <div className="forecast-totals">
            <div className="forecast-total"><span>Opening cash</span><strong>{formatAmount(forecast.data.openingBalance)}</strong></div>
            <div className="forecast-total forecast-inflow"><span><ArrowDownLeft size={13} /> Expected in</span><strong>{formatAmount(forecast.data.expectedInflow)}</strong></div>
            <div className="forecast-total forecast-outflow"><span><ArrowUpRight size={13} /> Expected out</span><strong>{formatAmount(forecast.data.expectedOutflow)}</strong></div>
            <div className="forecast-total forecast-projected"><span>Projected end</span><strong>{formatAmount(forecast.data.projectedBalance)}</strong></div>
          </div>
          <ForecastChart days={days} />
        </>
      )}
    </section>
  )
}