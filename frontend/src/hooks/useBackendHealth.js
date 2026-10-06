import { useEffect, useState } from 'react'
import { checkBackendHealth } from '../services/apiClient.js'

export default function useBackendHealth({ intervalMs = 30000 } = {}) {
  const [status, setStatus] = useState('checking')
  const [lastCheckedAt, setLastCheckedAt] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function check() {
      try {
        await checkBackendHealth(controller.signal)
        setStatus('healthy')
      } catch (error) {
        if (error.name !== 'AbortError') setStatus('unavailable')
      } finally {
        if (!controller.signal.aborted) setLastCheckedAt(new Date())
      }
    }

    check()
    const interval = window.setInterval(check, intervalMs)
    return () => {
      controller.abort()
      window.clearInterval(interval)
    }
  }, [intervalMs])

  return { status, lastCheckedAt }
}
