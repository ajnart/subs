import { useCallback, useEffect, useRef, useState } from 'react'
import { api, collectionApi, errorMessage, revisionHeaders } from '@/lib/api'
import { isDemo } from '@/lib/mode'
import type { AppData, ExchangeRates, Preferences, Status, Subscription, SubscriptionInput } from '@/lib/types'

export function useSubs() {
  const [status, setStatus] = useState<Status | null>(null)
  const [data, setData] = useState<AppData | null>(null)
  const [rates, setRates] = useState<ExchangeRates>()
  const [error, setError] = useState('')
  const [ratesError, setRatesError] = useState('')
  const [loading, setLoading] = useState(true)
  const generation = useRef(0)
  const revisionRef = useRef<string | null>(null)
  const [revision, setRevision] = useState<string | null>(null)
  const updateRevision = useCallback((value: string | null) => {
    revisionRef.current = value
    setRevision(value)
  }, [])

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const current = ++generation.current
      setLoading(true)
      setError('')
      try {
        const nextStatus = await api<Status>('/status', { signal })
        if (current !== generation.current) return
        setStatus(nextStatus)
        if (!nextStatus.authenticated && !nextStatus.authDisabled) {
          setData(null)
          updateRevision(null)
          return
        }
        const nextData = await collectionApi<AppData>('/data', { signal })
        if (current !== generation.current) return
        setData(nextData.data)
        updateRevision(nextData.revision)
        setLoading(false)
        try {
          const nextRates = await api<ExchangeRates>('/rates', { signal })
          if (current === generation.current) {
            setRates(nextRates)
            setRatesError('')
          }
        } catch (cause) {
          if (!signal?.aborted && current === generation.current) setRatesError(errorMessage(cause))
        }
      } catch (cause) {
        if (!signal?.aborted && current === generation.current) setError(errorMessage(cause))
      } finally {
        if (!signal?.aborted && current === generation.current) setLoading(false)
      }
    },
    [updateRevision],
  )

  useEffect(() => {
    const controller = new AbortController()
    const lock = () => {
      generation.current += 1
      setData(null)
      updateRevision(null)
      setRates(undefined)
      setStatus((previous) => ({ setupRequired: false, authDisabled: false, ...previous, authenticated: false }))
      setLoading(false)
    }
    window.addEventListener('subs:locked', lock)
    void refresh(controller.signal)
    return () => {
      controller.abort()
      window.removeEventListener('subs:locked', lock)
    }
  }, [refresh, updateRevision])

  useEffect(() => {
    if (!isDemo) return
    const controller = new AbortController()
    const reset = async () => {
      try {
        const headers = new Headers()
        if (revisionRef.current) headers.set('If-Match', revisionRef.current)
        await api('/demo/reset', { method: 'POST', headers, signal: controller.signal })
        if (!controller.signal.aborted) await refresh(controller.signal)
      } catch (cause) {
        if (!controller.signal.aborted) setError(errorMessage(cause))
      }
    }
    const changed = (event: StorageEvent) => {
      if (event.key !== 'subs-demo-v3' && event.key !== null) return
      setError(
        'The demo collection changed in another tab. Refresh to review it before making changes; your open draft has not been replaced.',
      )
    }
    const handleReset = () => void reset()
    window.addEventListener('subs:demo-reset', handleReset)
    window.addEventListener('storage', changed)
    return () => {
      controller.abort()
      window.removeEventListener('subs:demo-reset', handleReset)
      window.removeEventListener('storage', changed)
    }
  }, [refresh])

  const save = async (
    input: SubscriptionInput | Pick<SubscriptionInput, 'status'>,
    id?: string,
    expectedRevision = revisionRef.current,
  ) => {
    const current = generation.current
    const result = await collectionApi<Subscription>(
      id ? `/subscriptions/${encodeURIComponent(id)}` : '/subscriptions',
      {
        method: id ? 'PATCH' : 'POST',
        headers: revisionHeaders(expectedRevision),
        body: JSON.stringify(input),
      },
    )
    const subscription = result.data
    if (current === generation.current) {
      updateRevision(result.revision)
      setData((previous) => {
        if (!previous) return previous
        const subscriptions = previous.subscriptions.filter((item) => item.id !== subscription.id)
        return { ...previous, subscriptions: [...subscriptions, subscription] }
      })
    }
    return result.revision
  }

  const remove = async (id: string, expectedRevision = revisionRef.current) => {
    const current = generation.current
    const result = await collectionApi(`/subscriptions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: revisionHeaders(expectedRevision),
    })
    if (current !== generation.current) return result.revision
    updateRevision(result.revision)
    setData(
      (previous) => previous && { ...previous, subscriptions: previous.subscriptions.filter((item) => item.id !== id) },
    )
    return result.revision
  }

  const preferences = async (input: Preferences, expectedRevision: string | null) => {
    const current = generation.current
    const result = await collectionApi<Preferences>('/preferences', {
      method: 'PATCH',
      body: JSON.stringify(input),
      headers: revisionHeaders(expectedRevision),
    })
    if (current === generation.current) {
      updateRevision(result.revision)
      setData((previous) => previous && { ...previous, preferences: result.data })
    }
    return result.revision
  }

  const review = async () => {
    const current = generation.current
    const result = await collectionApi<AppData>('/data')
    if (current === generation.current) {
      updateRevision(result.revision)
      setData(result.data)
    }
    return result
  }

  return { status, data, revision, rates, error, ratesError, loading, refresh, review, save, remove, preferences }
}
