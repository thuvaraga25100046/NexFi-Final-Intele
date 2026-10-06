import axios from 'axios'
import { normalizeApiError, resolveApiBaseUrl, resolveRequestTimeout } from './apiConfig.js'

export const API_BASE_URL = resolveApiBaseUrl()
export const REQUEST_TIMEOUT_MS = resolveRequestTimeout()

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
  (error) => Promise.reject(normalizeApiError(error)),
)

export { normalizeApiError } from './apiConfig.js'
