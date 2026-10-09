export const DEMO_MODE_KEY = 'nexfi.demo-mode'
export const DEMO_DATA_KEY = 'nexfi.demo-data.v1'
export const DEMO_MODE_CHANGED_EVENT = 'nexfi:demo-mode-changed'

const DAY_MS = 86_400_000

function storage() {
  if (!globalThis.localStorage) {
    throw new Error('Local storage is unavailable; NexFi demo mode cannot save your data.')
  }
  return globalThis.localStorage
}

function dateAtOffset(offset) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function dayOffset(value) {
  const date = parseDate(value)
  const today = parseDate(dateAtOffset(0))
  return Math.round((date.getTime() - today.getTime()) / DAY_MS)
}

function makeSeedData() {
  const transactions = [
    ['income', 385000, 'Client payment', 'Northstar Studio retainer', -1],
    ['expense', 18400, 'Groceries', 'Weekly market and pantry', -2],
    ['expense', 62500, 'Utilities', 'Electricity and water', -4],
    ['income', 215000, 'Consulting', 'Product strategy workshop', -5],
    ['expense', 32000, 'Transport', 'Fuel and ride share', -7],
    ['expense', 12800, 'Dining', 'Team lunch', -9],
    ['income', 148000, 'Salary', 'Monthly salary installment', -11],
    ['expense', 44900, 'Shopping', 'Home office supplies', -13],
    ['expense', 27500, 'Subscriptions', 'Software and services', -15],
    ['income', 96000, 'Freelance', 'Interface design milestone', -17],
    ['expense', 53500, 'Healthcare', 'Annual health check', -19],
    ['expense', 36200, 'Groceries', 'Household essentials', -22],
    ['income', 172000, 'Client payment', 'Cedar Labs project', -24],
    ['expense', 24000, 'Education', 'Design course', -27],
    ['expense', 78000, 'Travel', 'Weekend trip booking', -30],
    ['income', 135000, 'Consulting', 'Research and advisory', -33],
    ['expense', 19500, 'Dining', 'Dinner with friends', -37],
    ['income', 118000, 'Freelance', 'Brand identity delivery', -41],
    ['expense', 28500, 'Utilities', 'Internet and mobile', -45],
    ['income', 76000, 'Investment', 'Dividend distribution', -51],
  ].map(([type, amount, category, description, offset], index) => ({
    id: `demo-transaction-${String(index + 1).padStart(2, '0')}`,
    type,
    amount,
    category,
    description,
    transactionDate: dateAtOffset(offset),
  }))

  const receivableRows = [
    ['Northstar Studio', 285000, -12, 'paid', -10],
    ['Cedar Labs', 174000, -3, 'paid', -2],
    ['Bluebird Creative', 96000, -6, 'overdue', null],
    ['Fieldwork Co.', 132500, 2, 'pending', null],
    ['Orbit Health', 215000, 5, 'pending', null],
    ['Maple & Main', 84500, -2, 'overdue', null],
    ['Goodwell Partners', 320000, 11, 'pending', null],
    ['Studio Koru', 118000, -15, 'paid', -13],
    ['Harbor Analytics', 167500, 18, 'pending', null],
    ['Morrow Design', 72500, 27, 'pending', null],
  ]
  const receivables = receivableRows.map(([customerName, amount, dueOffset, status, paymentOffset], index) => ({
    id: `demo-receivable-${String(index + 1).padStart(2, '0')}`,
    customerName,
    amount,
    dueDate: dateAtOffset(dueOffset),
    status,
    paymentDate: paymentOffset === null ? null : dateAtOffset(paymentOffset),
  }))

  const payableRows = [
    ['Cloud Hosting', 42800, -8, 'paid', -8],
    ['Northside Workspace', 142000, -3, 'overdue', null],
    ['Bright Energy', 28600, 1, 'pending', null],
    ['Pixel Supply Co.', 54900, 4, 'pending', null],
    ['Atlas Insurance', 87500, -5, 'paid', -5],
    ['Metro Water', 12400, -1, 'overdue', null],
    ['Team Payroll', 238000, 7, 'pending', null],
    ['Signal Telecom', 18300, -14, 'paid', -14],
    ['Evergreen Logistics', 63500, 16, 'pending', null],
    ['Studio Tools', 32700, 25, 'pending', null],
  ]
  const payables = payableRows.map(([vendorName, amount, dueOffset, status, paymentOffset], index) => ({
    id: `demo-payable-${String(index + 1).padStart(2, '0')}`,
    vendorName,
    amount,
    dueDate: dateAtOffset(dueOffset),
    status,
    paymentDate: paymentOffset === null ? null : dateAtOffset(paymentOffset),
  }))

  return {
    version: 1,
    openingBalance: { amount: 850000 },
    transactions,
    receivables,
    payables,
  }
}

function readData() {
  const value = storage().getItem(DEMO_DATA_KEY)
  if (value === null) {
    const seeded = makeSeedData()
    storage().setItem(DEMO_DATA_KEY, JSON.stringify(seeded))
    return seeded
  }

  let data
  try {
    data = JSON.parse(value)
  } catch {
    throw new Error('Saved NexFi demo data is invalid. Clear the NexFi demo data from local storage to reset it.')
  }

  if (
    data?.version !== 1
    || !Array.isArray(data.transactions)
    || !Array.isArray(data.receivables)
    || !Array.isArray(data.payables)
    || !data.openingBalance
  ) {
    throw new Error('Saved NexFi demo data has an unsupported format. Clear the NexFi demo data from local storage to reset it.')
  }
  return data
}

function saveData(data) {
  storage().setItem(DEMO_DATA_KEY, JSON.stringify(data))
}

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nexfi:resource-changed'))
  }
}

export function isDemoModeEnabled() {
  return storage().getItem(DEMO_MODE_KEY) === 'true'
}

export function setDemoModeEnabled(enabled) {
  if (enabled) {
    readData()
    storage().setItem(DEMO_MODE_KEY, 'true')
  } else {
    storage().removeItem(DEMO_MODE_KEY)
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(DEMO_MODE_CHANGED_EVENT))
  emitChange()
}

function assertNotAborted(signal) {
  if (signal?.aborted) {
    const error = new Error('The request was cancelled.')
    error.name = 'AbortError'
    throw error
  }
}

function calculateSummary(data) {
  const totalIncome = data.transactions
    .filter(({ type }) => type === 'income')
    .reduce((total, { amount }) => total + Number(amount), 0)
  const totalExpenses = data.transactions
    .filter(({ type }) => type === 'expense')
    .reduce((total, { amount }) => total + Number(amount), 0)
  const totalReceivables = data.receivables
    .filter(({ status }) => status !== 'paid')
    .reduce((total, { amount }) => total + Number(amount), 0)
  const totalPayables = data.payables
    .filter(({ status }) => status !== 'paid')
    .reduce((total, { amount }) => total + Number(amount), 0)

  return {
    openingBalance: Number(data.openingBalance.amount),
    currentCashBalance: Number(data.openingBalance.amount) + totalIncome - totalExpenses + totalReceivables - totalPayables,
    totalIncome,
    totalExpenses,
    totalReceivables,
    totalPayables,
  }
}

function calculateForecast(data, horizon = 30) {
  const allowedHorizons = [30, 60, 90]
  if (!allowedHorizons.includes(Number(horizon))) {
    throw new Error('Forecast range must be 30, 60, or 90 days.')
  }

  const today = dateAtOffset(0)
  const lastDate = dateAtOffset(Number(horizon))
  const firstDate = dateAtOffset(1)
  const incomingByDate = new Map()
  const outgoingByDate = new Map()
  const addFlow = (flows, date, amount) => flows.set(date, (flows.get(date) ?? 0) + Number(amount))
  let openingBalance = Number(data.openingBalance.amount)

  data.transactions.forEach(({ type, amount, transactionDate }) => {
    if (transactionDate <= today) {
      openingBalance += type === 'income' ? Number(amount) : -Number(amount)
    } else if (transactionDate <= lastDate) {
      addFlow(type === 'income' ? incomingByDate : outgoingByDate, transactionDate, amount)
    }
  })

  data.receivables
    .filter(({ status, dueDate }) => status !== 'paid' && dueDate <= lastDate)
    .forEach(({ amount, dueDate }) => addFlow(incomingByDate, dueDate < firstDate ? firstDate : dueDate, amount))
  data.payables
    .filter(({ status, dueDate }) => status !== 'paid' && dueDate <= lastDate)
    .forEach(({ amount, dueDate }) => addFlow(outgoingByDate, dueDate < firstDate ? firstDate : dueDate, amount))

  let projectedBalance = openingBalance
  let expectedInflow = 0
  let expectedOutflow = 0
  const days = Array.from({ length: Number(horizon) }, (_, index) => {
    const date = dateAtOffset(index + 1)
    const incoming = incomingByDate.get(date) ?? 0
    const outgoing = outgoingByDate.get(date) ?? 0
    expectedInflow += incoming
    expectedOutflow += outgoing
    projectedBalance += incoming - outgoing
    return { date, incoming, outgoing, projectedBalance }
  })
  const shortageDay = days.find(({ projectedBalance: balance }) => balance < 0)
  const daysToShortage = shortageDay ? dayOffset(shortageDay.date) : null
  const shortageAlert = shortageDay ? {
    shortageAmount: Math.abs(shortageDay.projectedBalance),
    shortageDate: shortageDay.date,
    daysRemaining: daysToShortage,
    severity: daysToShortage <= 3 ? 'CRITICAL' : daysToShortage <= 7 ? 'HIGH' : 'MEDIUM',
  } : null

  return { openingBalance, expectedInflow, expectedOutflow, projectedBalance, days, shortageAlert }
}

export function readDemoResource(resource, { signal, params } = {}) {
  assertNotAborted(signal)
  const data = readData()
  switch (resource) {
    case 'transactions':
    case 'receivables':
    case 'payables':
      return data[resource]
    case 'dashboard/summary':
      return calculateSummary(data)
    case 'dashboard/forecast':
      return calculateForecast(data, params?.days ?? 30)
    case 'opening-balance':
      return data.openingBalance
    default:
      throw new Error(`Demo data is not available for "${resource}".`)
  }
}

const resources = {
  transactions: 'transactions',
  receivables: 'receivables',
  payables: 'payables',
}

export function mutateDemoResource(resource, operation, id, payload) {
  const collectionName = resources[resource]
  if (!collectionName) {
    throw new Error(`Demo data cannot update "${resource}".`)
  }
  const data = readData()
  const collection = data[collectionName]
  let result

  if (operation === 'create') {
    result = { id: `demo-${resource}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`, ...payload }
    collection.push(result)
  } else {
    const index = collection.findIndex((item) => String(item.id) === String(id))
    if (index < 0) throw new Error(`Demo ${resource.slice(0, -1)} record "${id}" was not found.`)
    if (operation === 'update') {
      result = { ...collection[index], ...payload, id: collection[index].id }
      collection[index] = result
    } else if (operation === 'delete') {
      result = collection.splice(index, 1)[0]
    } else {
      throw new Error(`Unsupported demo data operation "${operation}".`)
    }
  }

  saveData(data)
  return result
}

export function updateDemoOpeningBalance(payload) {
  const data = readData()
  data.openingBalance = { ...data.openingBalance, ...payload }
  saveData(data)
  return data.openingBalance
}
