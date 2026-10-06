import test from 'node:test'
import assert from 'node:assert/strict'

import { shouldRetryRequest } from './apiConfig.js'

test('retries transient network failures', () => {
  assert.equal(shouldRetryRequest({ code: 'ERR_NETWORK' }, 0), true)
})

test('retries timeout and server-side failures', () => {
  assert.equal(shouldRetryRequest({ code: 'ECONNABORTED' }, 0), true)
  assert.equal(shouldRetryRequest({ response: { status: 503 } }, 0), true)
})

test('does not retry permanent request failures', () => {
  assert.equal(shouldRetryRequest({ response: { status: 400 } }, 0), false)
})

test('limits retries to the configured maximum', () => {
  assert.equal(shouldRetryRequest({ response: { status: 502 } }, 1, 1), false)
})
