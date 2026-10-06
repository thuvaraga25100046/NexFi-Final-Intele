import test from 'node:test'
import assert from 'node:assert/strict'

import {
  normalizeApiError,
  resolveApiBaseUrl,
} from './apiConfig.js'

test('uses the Spring Boot URL by default', () => {
  assert.equal(resolveApiBaseUrl({}), 'http://localhost:8080')
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

test('preserves backend-provided API messages', () => {
  const error = normalizeApiError({
    response: {
      status: 400,
      data: { message: 'Invalid request body' },
    },
  })

  assert.equal(error.message, 'Invalid request body')
})
