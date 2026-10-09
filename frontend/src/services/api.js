import { apiClient } from './apiClient.js'
import { isDemoModeEnabled, mutateDemoResource, readDemoResource, updateDemoOpeningBalance } from './demoData.js'

export const RESOURCE_CHANGED_EVENT = 'nexfi:resource-changed'

function unwrapResponse(response) {
  const result = response.data
  if (!result?.success) {
    throw new Error(result?.message || 'NexFi returned an invalid response. Try again.')
  }
  return result.data
}

export async function apiGet(path, { signal, params } = {}) {
  if (isDemoModeEnabled()) {
    return readDemoResource(path, { signal, params })
  }
  const response = await apiClient.get(`/api/${path}`, { signal, params })
  return unwrapResponse(response)
}

export async function apiPost(path, payload, options = {}) {
  if (isDemoModeEnabled()) {
    if (['transactions', 'receivables', 'payables'].includes(path)) {
      return mutateDemoResource(path, 'create', undefined, payload)
    }
    throw new Error(`Demo data cannot create "${path}".`)
  }
  const response = await apiClient.post(`/api/${path}`, payload, options)
  return unwrapResponse(response)
}

export async function apiPut(path, payload, options = {}) {
  if (isDemoModeEnabled()) {
    const [, resource, id] = path.match(/^(transactions|receivables|payables)\/(.+)$/) ?? []
    if (resource) return mutateDemoResource(resource, 'update', id, payload)
    if (path === 'opening-balance') return updateDemoOpeningBalance(payload)
    throw new Error(`Demo data cannot update "${path}".`)
  }
  const response = await apiClient.put(`/api/${path}`, payload, options)
  return unwrapResponse(response)
}

export async function apiDelete(path, options = {}) {
  if (isDemoModeEnabled()) {
    const [, resource, id] = path.match(/^(transactions|receivables|payables)\/(.+)$/) ?? []
    if (resource) return mutateDemoResource(resource, 'delete', id)
    throw new Error(`Demo data cannot delete "${path}".`)
  }
  const response = await apiClient.delete(`/api/${path}`, options)
  return unwrapResponse(response)
}

export async function checkBackendHealth(signal) {
  const response = await apiClient.get('/api/health', { signal })
  const health = response.data?.data?.status
  if (health !== 'UP') {
    throw new Error('NexFi backend health check failed.')
  }
  return response.data
}

export const fetchTransactions = (signal) => apiGet('transactions', { signal })
export const fetchReceivables = (signal) => apiGet('receivables', { signal })
export const fetchPayables = (signal) => apiGet('payables', { signal })
export const fetchDashboardSummary = (signal) => apiGet('dashboard/summary', { signal })
export const fetchCashFlowForecast = (signal, days) => apiGet('dashboard/forecast', {
  signal,
  params: days ? { days } : undefined,
})
export const fetchOpeningBalance = (signal) => apiGet('opening-balance', { signal })

export async function saveOpeningBalance(payload) {
  const result = await apiPut('opening-balance', payload)
  window.dispatchEvent(new Event(RESOURCE_CHANGED_EVENT))
  return result
}

async function createResource(path, payload) {
  const result = await apiPost(path, payload)
  window.dispatchEvent(new Event(RESOURCE_CHANGED_EVENT))
  return result
}

export const createTransaction = (payload) => createResource('transactions', payload)
export const createReceivable = (payload) => createResource('receivables', payload)
export const createPayable = (payload) => createResource('payables', payload)

async function updateResource(path, id, payload) {
  const result = await apiPut(`${path}/${id}`, payload)
  window.dispatchEvent(new Event(RESOURCE_CHANGED_EVENT))
  return result
}

async function deleteResource(path, id) {
  const result = await apiDelete(`${path}/${id}`)
  window.dispatchEvent(new Event(RESOURCE_CHANGED_EVENT))
  return result
}

export const updateTransaction = (id, payload) => updateResource('transactions', id, payload)
export const updateReceivable = (id, payload) => updateResource('receivables', id, payload)
export const updatePayable = (id, payload) => updateResource('payables', id, payload)
export const deleteTransaction = (id) => deleteResource('transactions', id)
export const deleteReceivable = (id) => deleteResource('receivables', id)
export const deletePayable = (id) => deleteResource('payables', id)