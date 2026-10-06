import { apiClient } from './apiClient.js'

export const RESOURCE_CHANGED_EVENT = 'nexfi:resource-changed'

async function getResource(path, signal) {
  const response = await apiClient.get(`/api/${path}`, { signal })
  const result = response.data

  if (!result?.success) {
    throw new Error(result?.message || 'NexFi returned an invalid response. Try again.')
  }

  return result.data
}

async function createResource(path, payload) {
  const response = await apiClient.post(`/api/${path}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  const result = response.data

  if (!result?.success) {
    throw new Error(result?.message || 'NexFi returned an invalid response. Try again.')
  }

  window.dispatchEvent(new Event(RESOURCE_CHANGED_EVENT))
  return result.data
}

export const fetchTransactions = (signal) => getResource('transactions', signal)
export const fetchReceivables = (signal) => getResource('receivables', signal)
export const fetchPayables = (signal) => getResource('payables', signal)
export const fetchDashboardSummary = (signal) => getResource('dashboard/summary', signal)
export const fetchCashFlowForecast = (signal) => getResource('dashboard/forecast', signal)
export const createTransaction = (payload) => createResource('transactions', payload)
export const createReceivable = (payload) => createResource('receivables', payload)
export const createPayable = (payload) => createResource('payables', payload)