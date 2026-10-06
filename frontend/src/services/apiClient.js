import axios from 'axios'
import {
  normalizeApiError,
  resolveApiBaseUrl,
  resolveMaxRetries,
  resolveRetryDelay,
  resolveRequestTimeout,
  shouldRetryRequest,
} from './apiConfig.js'

export const API_BASE_URL = resolveApiBaseUrl()
export const REQUEST_TIMEOUT_MS = resolveRequestTimeout()
export const MAX_RETRIES = resolveMaxRetries()
export const RETRY_DELAY_MS = resolveRetryDelay()

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  config.headers.Accept = 'application/json'
  config.headers['Content-Type'] = config.data ? 'application/json' : config.headers['Content-Type']
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config
    const method = config?.method?.toLowerCase()
    const retryAttempt = Number(config?.retryAttempt ?? 0)
    const isIdempotent = method === 'get' || method === 'head' || method === 'options'

    if (isIdempotent && shouldRetryRequest(error, retryAttempt, MAX_RETRIES)) {
      const nextAttempt = retryAttempt + 1
      const delayMs = Math.min(RETRY_DELAY_MS * 2 ** retryAttempt, 8000)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      return apiClient.request({
        ...config,
        retryAttempt: nextAttempt,
      })
    }

    return Promise.reject(normalizeApiError(error))
  },
)

export { normalizeApiError } from './apiConfig.js'
