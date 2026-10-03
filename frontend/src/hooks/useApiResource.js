import { useEffect, useState } from 'react'

export default function useApiResource(loader) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ attempt: -1, data: [], error: '' })

  useEffect(() => {
    const controller = new AbortController()

    loader(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ attempt, data, error: '' })
      })
      .catch((requestError) => {
        if (!controller.signal.aborted && requestError.name !== 'AbortError') {
          setResult({ attempt, data: [], error: requestError.message || 'Unable to load this data.' })
        }
      })

    return () => controller.abort()
  }, [loader, attempt])

  return {
    data: result.attempt === attempt ? result.data : [],
    loading: result.attempt !== attempt,
    error: result.attempt === attempt ? result.error : '',
    retry: () => setAttempt((value) => value + 1),
  }
}