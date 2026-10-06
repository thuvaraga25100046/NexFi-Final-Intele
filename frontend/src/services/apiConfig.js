const DEFAULT_API_BASE_URL = 'http://localhost:8080'
const DEFAULT_REQUEST_TIMEOUT_MS = 15000
const DEFAULT_MAX_RETRIES = 2
const DEFAULT_RETRY_DELAY_MS = 1000

export function resolveApiBaseUrl(env = import.meta.env ?? {}) {
  const baseUrl = env.VITE_API_BASE_URL?.trim()
  return baseUrl || DEFAULT_API_BASE_URL
}

export function resolveRequestTimeout(env = import.meta.env ?? {}) {
  const timeout = Number(env.VITE_API_TIMEOUT_MS)
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_REQUEST_TIMEOUT_MS
}

export function resolveMaxRetries(env = import.meta.env ?? {}) {
  const retries = Number(env.VITE_API_MAX_RETRIES)
  return Number.isInteger(retries) && retries >= 0 ? retries : DEFAULT_MAX_RETRIES
}

export function resolveRetryDelay(env = import.meta.env ?? {}) {
  const delay = Number(env.VITE_API_RETRY_DELAY_MS)
  return Number.isFinite(delay) && delay >= 0 ? delay : DEFAULT_RETRY_DELAY_MS
}

export function shouldRetryRequest(error, retryAttempt = 0, maxRetries = DEFAULT_MAX_RETRIES) {
  if (retryAttempt >= maxRetries) return false

  const status = error?.response?.status
  const transientNetworkError =
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ETIMEDOUT' ||
    error?.name === 'TimeoutError' ||
    (!error?.response && error?.name === 'AxiosError')

  return transientNetworkError || status === 408 || status === 429 || (status >= 500 && status < 600)
}

export function normalizeApiError(error) {
  const responseMessage = error?.response?.data?.message
  if (responseMessage) {
    return new Error(String(responseMessage))
  }

  const status = error?.response?.status
  if (error?.code === 'ECONNABORTED' || error?.name === 'TimeoutError') {
    return new Error('The NexFi backend took too long to respond. Please try again.')
  }

  if (status === 408 || status === 429) {
    return new Error('The backend is temporarily unavailable. Please wait a moment and try again.')
  }

  if (error?.code === 'ERR_NETWORK' || error?.name === 'AxiosError' && !error.response) {
    return new Error(
      'NexFi could not reach the backend. Please check that Spring Boot is running on localhost:8080 and try again.',
    )
  }

  if (status >= 500) {
    return new Error('The backend is currently unavailable. Please try again shortly.')
  }

  return new Error(error?.message || 'NexFi could not complete the request.')
}
