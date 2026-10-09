import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEMO_DATA_KEY,
  DEMO_MODE_KEY,
  isDemoModeEnabled,
  mutateDemoResource,
  readDemoResource,
  setDemoModeEnabled,
  updateDemoOpeningBalance,
} from './demoData.js'
import {
  createTransaction,
  deleteTransaction,
  fetchCashFlowForecast,
  fetchDashboardSummary,
  fetchOpeningBalance,
  fetchPayables,
  fetchReceivables,
  fetchTransactions,
  saveOpeningBalance,
  updateTransaction,
} from './api.js'

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
const values = new Map()

globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
}
globalThis.window = { dispatchEvent: () => true }

after(() => {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage)
  else delete globalThis.localStorage
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
  else delete globalThis.window
})

test('seeds realistic demo records and summary totals in local storage', () => {
  setDemoModeEnabled(true)

  const transactions = readDemoResource('transactions')
  const receivables = readDemoResource('receivables')
  const payables = readDemoResource('payables')
  const summary = readDemoResource('dashboard/summary')

  assert.equal(isDemoModeEnabled(), true)
  assert.equal(transactions.length, 20)
  assert.equal(receivables.length, 10)
  assert.equal(payables.length, 10)
  assert.ok(new Set(transactions.map(({ transactionDate }) => transactionDate)).size > 10)
  assert.ok(transactions.some(({ type }) => type === 'income'))
  assert.ok(transactions.some(({ type }) => type === 'expense'))
  assert.ok(receivables.some(({ status }) => status === 'paid'))
  assert.ok(receivables.some(({ status }) => status === 'pending'))
  assert.ok(receivables.some(({ status }) => status === 'overdue'))
  assert.ok(payables.some(({ status }) => status === 'paid'))
  assert.ok(payables.some(({ status }) => status === 'pending'))
  assert.ok(payables.some(({ status }) => status === 'overdue'))
  assert.ok(summary.totalIncome > 0)
  assert.ok(summary.totalExpenses > 0)
  assert.ok(summary.totalReceivables > 0)
  assert.ok(summary.totalPayables > 0)
  assert.ok(JSON.parse(values.get(DEMO_DATA_KEY)))
  assert.equal(values.get(DEMO_MODE_KEY), 'true')
})

test('routes application API operations to persistent demo storage while demo mode is enabled', async () => {
  assert.equal((await fetchTransactions()).length, 20)
  assert.equal((await fetchReceivables()).length, 10)
  assert.equal((await fetchPayables()).length, 10)
  assert.ok((await fetchDashboardSummary()).currentCashBalance > 0)
  assert.equal((await fetchCashFlowForecast(undefined, 60)).days.length, 60)
  assert.ok((await fetchOpeningBalance()).amount > 0)

  const created = await createTransaction({
    type: 'income',
    amount: 5000,
    category: 'API test',
    description: 'Saved demo record',
    transactionDate: '2026-10-09',
  })
  await updateTransaction(created.id, { amount: 7000 })
  assert.equal((await fetchTransactions()).find(({ id }) => id === created.id).amount, 7000)
  await deleteTransaction(created.id)
  assert.equal((await fetchTransactions()).length, 20)
  await saveOpeningBalance({ amount: 900000 })
  assert.equal((await fetchOpeningBalance()).amount, 900000)
})

test('provides 30, 60, and 90 day cash-flow forecasts with daily records', () => {
  for (const horizon of [30, 60, 90]) {
    const forecast = readDemoResource('dashboard/forecast', { params: { days: horizon } })
    assert.equal(forecast.days.length, horizon)
    assert.ok(forecast.expectedInflow > 0)
    assert.ok(forecast.expectedOutflow > 0)
    assert.ok(forecast.days.some(({ incoming }) => incoming > 0))
    assert.ok(forecast.days.some(({ outgoing }) => outgoing > 0))
    assert.equal(
      forecast.projectedBalance,
      forecast.openingBalance + forecast.expectedInflow - forecast.expectedOutflow,
    )
  }
  assert.throws(
    () => readDemoResource('dashboard/forecast', { params: { days: 7 } }),
    /30, 60, or 90/,
  )
})

test('persists create, update, delete, and opening-balance edits', () => {
  const created = mutateDemoResource('transactions', 'create', undefined, {
    type: 'expense',
    amount: 1234,
    category: 'Demo test',
    description: 'Temporary record',
    transactionDate: '2026-10-09',
  })
  assert.ok(created.id)
  assert.equal(readDemoResource('transactions').length, 21)

  const updated = mutateDemoResource('transactions', 'update', created.id, { amount: 2345 })
  assert.equal(updated.amount, 2345)
  assert.equal(readDemoResource('transactions').find(({ id }) => id === created.id).amount, 2345)

  mutateDemoResource('transactions', 'delete', created.id)
  assert.equal(readDemoResource('transactions').length, 20)

  updateDemoOpeningBalance({ amount: 975000 })
  assert.equal(readDemoResource('opening-balance').amount, 975000)
  assert.equal(isDemoModeEnabled(), true)
})

test('preserves demo records when demo mode is turned off', () => {
  const before = readDemoResource('receivables')
  setDemoModeEnabled(false)
  assert.equal(isDemoModeEnabled(), false)
  assert.equal(readDemoResource('receivables').length, before.length)
})

test('reports corrupt or unsupported local demo data instead of silently resetting it', () => {
  values.set(DEMO_DATA_KEY, '{broken json')
  assert.throws(() => readDemoResource('transactions'), /invalid/)

  values.set(DEMO_DATA_KEY, JSON.stringify({ version: 2 }))
  assert.throws(() => readDemoResource('transactions'), /unsupported format/)
})
