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

// Demo data complete-ah remove seiyappattathu (Empty state)
function makeSeedData() {
  return {
    version: 1,
    openingBalance: { amount: 0 },
    transactions: [],
    receivables: [],
    payables: [],
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

// Demo data complete-ah clear seiyum function
export function clearDemoData() {
  if (typeof globalThis.localStorage !== 'undefined') {
    globalThis.localStorage.removeItem(DEMO_MODE_KEY)
    globalThis.localStorage.removeItem(DEMO_DATA_KEY)
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DEMO_MODE_CHANGED_EVENT))
    window.dispatchEvent(new Event('nexfi:resource-changed'))
    window.location.reload()
  }
}