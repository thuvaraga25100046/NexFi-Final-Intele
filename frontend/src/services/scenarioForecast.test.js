import assert from 'node:assert/strict'
import test from 'node:test'
import { buildScenarioForecast } from './scenarioForecast.js'

const forecast = {
  days: [
    { date: '2026-10-15', projectedBalance: 1000 },
    { date: '2026-10-16', projectedBalance: 1600 },
    { date: '2026-10-17', projectedBalance: 1400 },
    { date: '2026-10-18', projectedBalance: 1900 },
  ],
}

test('one-time expense reduces balances on and after its payment day', () => {
  const result = buildScenarioForecast(forecast, {
    type: 'expense',
    amount: 500,
    day: 2,
  })

  assert.deepEqual(result.comparison.map(({ scenario }) => scenario), [1000, 1100, 900, 1400])
  assert.equal(result.baselineClosing, 1900)
  assert.equal(result.scenarioClosing, 1400)
  assert.equal(result.scenarioLowest.amount, 900)
})

test('delayed receivable moves its inflow to the new date', () => {
  const result = buildScenarioForecast(forecast, {
    type: 'delay-receivable',
    receivable: { amount: 600, dueDate: '2026-10-16' },
    delayDays: 2,
  })

  assert.deepEqual(result.comparison.map(({ scenario }) => scenario), [1000, 1000, 800, 1900])
  assert.equal(result.baselineClosing, result.scenarioClosing)
})

test('delayed receivable beyond the forecast horizon remains outside the forecast', () => {
  const result = buildScenarioForecast(forecast, {
    type: 'delay-receivable',
    receivable: { amount: 600, dueDate: '2026-10-18' },
    delayDays: 7,
  })

  assert.equal(result.scenarioClosing, 1300)
})

test('rejects invalid scenario inputs', () => {
  assert.throws(
    () => buildScenarioForecast(forecast, { type: 'expense', amount: 0, day: 1 }),
    /greater than zero/,
  )
  assert.throws(
    () => buildScenarioForecast(forecast, {
      type: 'delay-receivable',
      receivable: { amount: 600, dueDate: '2026-10-16' },
      delayDays: 0,
    }),
    /1 to 60 days/,
  )
})
