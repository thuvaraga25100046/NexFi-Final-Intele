import { useEffect, useState } from 'react'
import { checkBackendHealth } from '../services/api.js'
import { isBackendUnreachable } from '../services/apiConfig.js'

export default function useBackendHealth({ intervalMs = 30000 } = {}) {
  const [status, setStatus] = useState('checking')
  const [lastCheckedAt, setLastCheckedAt] = useState(null)

  useEffect(() => {
    let active = true
    let interval
    let controller

    async function check() {
      controller = new AbortController()
      try {
        await checkBackendHealth(controller.signal)
        if (active) setStatus('healthy')
      } catch (error) {
        const wasCanceled = controller.signal.aborted || error?.code === 'ERR_CANCELED' || error?.name === 'AbortError'
        if (active && !wasCanceled) {
          setStatus(isBackendUnreachable(error) ? 'unavailable' : 'healthy')
        }
      } finally {
        if (active) {
          setLastCheckedAt(new Date())
          interval = window.setTimeout(check, intervalMs)
        }
      }
    }

    check()
    return () => {
      active = false
      window.clearTimeout(interval)
      controller.abort()
    }
  }, [intervalMs])

  return { status, lastCheckedAt }
}
