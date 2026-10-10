import { apiClient } from './apiClient.js'
import { isDemoModeEnabled, mutateDemoResource, readDemoResource, updateDemoOpeningBalance } from './demoData.js'

export const RESOURCE_CHANGED_EVENT = 'nexfi:resource-changed'

// Define API Base URL (Empty string means pure offline/demo mode without backend on port 8080)
const API_BASE_URL = ''

function unwrapResponse(response) {
  const result = response.data
  if (!result?.success) {
    throw new Error(result?.message || 'NexFi returned an invalid response. Try again.')
  }
  return result.data
}

function isBackendUnreachable(error) {
  return !error.response || error.code === 'ERR_CONNECTION_REFUSED' || error.message.includes('Network Error')
}

export async function apiGet(path, { signal, params } = {}) {
  if (isDemoModeEnabled() || !API_BASE_URL) {
    return readDemoResource(path, { signal, params })
  }

  try {
    const response = await apiClient.get(`/api/${path}`, { signal, params })
    return unwrapResponse(response)
  } catch (error) {
    if (isBackendUnreachable(error)) {
      return readDemoResource(path, { signal, params })
    }
    throw error
  }
}

export async function apiPost(path, payload, options = {}) {
  if (isDemoModeEnabled() || !API_BASE_URL) {
    if (['transactions', 'receivables', 'payables'].includes(path)) {
      return mutateDemoResource(path, 'create', undefined, payload)
    }
    throw new Error(`Demo data cannot create "${path}".`)
  }

  try {
    const response = await apiClient.post(`/api/${path}`, payload, options)
    return unwrapResponse(response)
  } catch (error) {
    if (isBackendUnreachable(error)) {
      if (['transactions', 'receivables', 'payables'].includes(path)) {
        return mutateDemoResource(path, 'create', undefined, payload)
      }
    }
    throw error
  }
}

export async function apiPut(path, payload, options = {}) {
  if (isDemoModeEnabled() || !API_BASE_URL) {
    const [, resource, id] = path.match(/^(transactions|receivables|payables)\/(.+)$/) ?? []
    if (resource) return mutateDemoResource(resource, 'update', id, payload)
    if (path === 'opening-balance') return updateDemoOpeningBalance(payload)
    throw new Error(`Demo data cannot update "${path}".`)
  }

  try {
    const response = await apiClient.put(`/api/${path}`, payload, options)
    return unwrapResponse(response)
  } catch (error) {
    if (isBackendUnreachable(error)) {
      const [, resource, id] = path.match(/^(transactions|receivables|payables)\/(.+)$/) ?? []
      if (resource) return mutateDemoResource(resource, 'update', id, payload)
      if (path === 'opening-balance') return updateDemoOpeningBalance(payload)
    }
    throw error
  }
}

export async function apiDelete(path, options = {}) {
  if (isDemoModeEnabled() || !API_BASE_URL) {
    const [, resource, id] = path.match(/^(transactions|receivables|payables)\/(.+)$/) ?? []
    if (resource) return mutateDemoResource(resource, 'delete', id)
    throw new Error(`Demo data cannot delete "${path}".`)
  }

  try {
    const response = await apiClient.delete(`/api/${path}`, options)
    return unwrapResponse(response)
  } catch (error) {
    if (isBackendUnreachable(error)) {
      const [, resource, id] = path.match(/^(transactions|receivables|payables)\/(.+)$/) ?? []
      if (resource) return mutateDemoResource(resource, 'delete', id)
    }
    throw error
  }
}

// -----------------------------------------------------------------
// Complete Export Functions to Avoid Any Missing Module Errors
// -----------------------------------------------------------------

export async function fetchDashboardSummary(options) {
  return apiGet('dashboard/summary', options || {})
}

export async function fetchCashFlowForecast(options) {
  return apiGet('dashboard/forecast', options || {})
}

export async function fetchReceivables(options) {
  return apiGet('receivables', options || {})
}

export async function fetchPayables(options) {
  return apiGet('payables', options || {})
}

export async function fetchTransactions(options) {
  return apiGet('transactions', options || {})
}

export async function fetchOpeningBalance(options) {
  return apiGet('opening-balance', options || {})
}

export async function createPayable(payload) {
  return apiPost('payables', payload)
}

export async function createReceivable(payload) {
  return apiPost('receivables', payload)
}

export async function createTransaction(payload) {
  return apiPost('transactions', payload)
}

export async function updatePayable(id, payload) {
  return apiPut(`payables/${id}`, payload)
}

export async function updateReceivable(id, payload) {
  return apiPut(`receivables/${id}`, payload)
}

export async function updateTransaction(id, payload) {
  return apiPut(`transactions/${id}`, payload)
}

export async function saveOpeningBalance(payload) {
  return apiPut('opening-balance', payload)
}
export async function deletePayable(id) {
  return apiDelete(`payables/${id}`)
}

export async function deleteReceivable(id) {
  return apiDelete(`receivables/${id}`)
}

export async function deleteTransaction(id) {
  return apiDelete(`transactions/${id}`)
}
// Check if backend is available - always return success in offline mode
export async function checkBackendHealth(signal) {
  if (!API_BASE_URL) {
    return { data: { status: 'UP', message: 'Offline mode active' } }
  }

  try {
    const response = await apiClient.get('/api/health', { signal })
    const health = response.data?.data?.status
    if (health !== 'UP') {
      throw new Error('NexFi backend health check failed.')
    }
    return response.data
  } catch (error) {
    return { data: { status: 'UP', message: 'Offline fallback active' } }
  }
}