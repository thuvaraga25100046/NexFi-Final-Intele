const DEFAULT_API_BASE_URL = 'http://localhost:8080'
const DEFAULT_REQUEST_TIMEOUT_MS = 15000

export function resolveApiBaseUrl(env = import.meta.env ?? {}) {
  const baseUrl = env.VITE_API_BASE_URL?.trim()
  return baseUrl || DEFAULT_API_BASE_URL
}

export function resolveRequestTimeout(env = import.meta.env ?? {}) {
  const timeout = Number(env.VITE_API_TIMEOUT_MS)
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_REQUEST_TIMEOUT_MS
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
