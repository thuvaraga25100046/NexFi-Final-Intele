import axios from 'axios'
import { normalizeApiError, resolveApiBaseUrl } from './apiConfig.js'

export const API_BASE_URL = resolveApiBaseUrl()

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  config.headers.Accept = 'application/json'
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error)),
)

export async function checkBackendHealth(signal) {
  const response = await apiClient.get('/api/health', { signal })
  const health = response.data?.data?.status
  if (health !== 'UP') {
    throw new Error('NexFi backend health check failed.')
  }
  return response.data
}
