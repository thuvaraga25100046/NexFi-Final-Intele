import { apiClient } from './apiClient.js'

export const RESOURCE_CHANGED_EVENT = 'nexfi:resource-changed'

function unwrapResponse(response) {
  const result = response.data
  if (!result?.success) {
    throw new Error(result?.message || 'NexFi returned an invalid response. Try again.')
  }
  return result.data
}

export async function apiGet(path, { signal, params } = {}) {
  const response = await apiClient.get(`/api/${path}`, { signal, params })
  return unwrapResponse(response)
}

export async function apiPost(path, payload, options = {}) {
  const response = await apiClient.post(`/api/${path}`, payload, options)
  return unwrapResponse(response)
}

export async function apiPut(path, payload, options = {}) {
  const response = await apiClient.put(`/api/${path}`, payload, options)
  return unwrapResponse(response)
}

export async function apiDelete(path, options = {}) {
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
export const fetchCashFlowForecast = (signal) => apiGet('dashboard/forecast', { signal })

async function createResource(path, payload) {
  const result = await apiPost(path, payload)
  window.dispatchEvent(new Event(RESOURCE_CHANGED_EVENT))
  return result
}

export const createTransaction = (payload) => createResource('transactions', payload)
export const createReceivable = (payload) => createResource('receivables', payload)
export const createPayable = (payload) => createResource('payables', payload)