import test from 'node:test'
import assert from 'node:assert/strict'

import {
  isBackendUnreachable,
  normalizeApiError,
  resolveApiBaseUrl,
  resolveMaxRetries,
  resolveRetryDelay,
  resolveRequestTimeout,
} from './apiConfig.js'

test('uses the Spring Boot URL by default', () => {
  assert.equal(resolveApiBaseUrl({}), 'http://localhost:8080')
})

test('uses the configured request timeout', () => {
  assert.equal(resolveRequestTimeout({ VITE_API_TIMEOUT_MS: '25000' }), 25000)
  assert.equal(resolveRequestTimeout({ VITE_API_TIMEOUT_MS: 'invalid' }), 15000)
})

test('uses the configured retry policy', () => {
  assert.equal(resolveMaxRetries({ VITE_API_MAX_RETRIES: '4' }), 4)
  assert.equal(resolveMaxRetries({ VITE_API_MAX_RETRIES: '-1' }), 2)
  assert.equal(resolveRetryDelay({ VITE_API_RETRY_DELAY_MS: '250' }), 250)
  assert.equal(resolveRetryDelay({ VITE_API_RETRY_DELAY_MS: 'invalid' }), 1000)
})

test('honors the Vite API base URL override', () => {
  assert.equal(
    resolveApiBaseUrl({ VITE_API_BASE_URL: 'http://backend.example.test:8080' }),
    'http://backend.example.test:8080',
  )
})

test('normalizes network failures to a stable backend-unavailable message', () => {
  const error = normalizeApiError({
    name: 'AxiosError',
    code: 'ERR_NETWORK',
    message: 'Network Error',
  })

  assert.equal(error.message, 'NexFi could not reach the backend. Please check that Spring Boot is running on localhost:8080 and try again.')
})

test('preserves request cancellation instead of reporting it as a backend failure', () => {
  const cancellation = Object.assign(new Error('canceled'), {
    name: 'CanceledError',
    code: 'ERR_CANCELED',
  })

  assert.equal(normalizeApiError(cancellation), cancellation)
})

test('only classifies transport failures as an unreachable backend', () => {
  const networkError = normalizeApiError({
    name: 'AxiosError',
    code: 'ERR_NETWORK',
    message: 'Network Error',
  })
  const serverResponseError = normalizeApiError({
    name: 'AxiosError',
    response: { status: 503 },
  })

  assert.equal(isBackendUnreachable(networkError), true)
  assert.equal(isBackendUnreachable(serverResponseError), false)
  assert.equal(isBackendUnreachable(new Error('Health status is DOWN')), false)
})

test('preserves backend-provided API messages', () => {
  const error = normalizeApiError({
    response: {
      status: 400,
      data: { message: 'Invalid request body' },
    },
  })

  assert.equal(error.message, 'Invalid request body')
})
