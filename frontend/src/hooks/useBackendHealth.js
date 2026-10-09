import { useEffect, useState } from 'react'
import { checkBackendHealth } from '../services/api.js'
import { isBackendUnreachable } from '../services/apiConfig.js'
import { DEMO_MODE_CHANGED_EVENT, DEMO_MODE_KEY, isDemoModeEnabled } from '../services/demoData.js'

export default function useBackendHealth({ intervalMs = 30000 } = {}) {
  const [status, setStatus] = useState(() => isDemoModeEnabled() ? 'demo' : 'checking')
  const [lastCheckedAt, setLastCheckedAt] = useState(null)

  useEffect(() => {
    let active = true
    let interval
    let controller

    async function check() {
      if (isDemoModeEnabled()) {
        if (active) setStatus('demo')
        return
      }

      const requestController = new AbortController()
      controller = requestController
      try {
        await checkBackendHealth(requestController.signal)
        if (active && !requestController.signal.aborted) setStatus('healthy')
      } catch (error) {
        const wasCanceled = requestController.signal.aborted || error?.code === 'ERR_CANCELED' || error?.name === 'AbortError'
        if (active && !wasCanceled) {
          setStatus(isBackendUnreachable(error) ? 'unavailable' : 'healthy')
        }
      } finally {
        if (active && !requestController.signal.aborted) {
          setLastCheckedAt(new Date())
          interval = window.setTimeout(check, intervalMs)
        }
      }
    }

    function updateMode() {
      window.clearTimeout(interval)
      controller?.abort()
      if (isDemoModeEnabled()) {
        setStatus('demo')
      } else {
        setStatus('checking')
        check()
      }
    }
    const updateModeForStorage = (event) => {
      if (event.key === DEMO_MODE_KEY) updateMode()
    }

    window.addEventListener(DEMO_MODE_CHANGED_EVENT, updateMode)
    window.addEventListener('storage', updateModeForStorage)
    check()
    return () => {
      active = false
      window.clearTimeout(interval)
      controller?.abort()
      window.removeEventListener(DEMO_MODE_CHANGED_EVENT, updateMode)
      window.removeEventListener('storage', updateModeForStorage)
    }
  }, [intervalMs])

  return { status, lastCheckedAt }
}
