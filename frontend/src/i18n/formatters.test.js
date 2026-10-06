import test from 'node:test'
import assert from 'node:assert/strict'

import { formatCurrency } from './formatters.js'

test('formats the default currency as Sri Lankan rupees', () => {
  assert.equal(formatCurrency(15000, 'en'), 'Rs. 15,000')
  assert.equal(formatCurrency(125000, 'en'), 'Rs. 125,000')
})

test('formats an explicit LKR preference as Sri Lankan rupees', () => {
  assert.equal(formatCurrency(15000, 'en', 'LKR'), 'Rs. 15,000')
})
