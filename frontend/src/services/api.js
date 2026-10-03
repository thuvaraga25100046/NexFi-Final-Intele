const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function getResource(path, signal) {
  const response = await fetch(`${API_BASE_URL}/api/${path}`, { signal })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const message = result?.message || (response.status >= 500
      ? 'NexFi could not reach the server. Check the backend and try again.'
      : `Request failed (${response.status})`)
    throw new Error(message)
  }

  if (!result?.success) {
    throw new Error(result?.message || 'NexFi returned an invalid response. Try again.')
  }

  return result.data
}

export const fetchTransactions = (signal) => getResource('transactions', signal)
export const fetchReceivables = (signal) => getResource('receivables', signal)