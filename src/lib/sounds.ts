import { tiks } from '@rexa-developer/tiks'
import { useEffect, useSyncExternalStore } from 'react'

export type FeedbackKind = 'navigate' | 'open' | 'confirm' | 'error' | 'toggle'

const storageKey = 'subs-sound-muted'
const listeners = new Set<() => void>()
let muted = false
let initialized = false
let audioFailed = false

function withAudio(action: () => void) {
  if (typeof window === 'undefined' || audioFailed) return
  try {
    action()
  } catch (error) {
    audioFailed = true
    console.warn('Interaction audio is unavailable; visual feedback remains enabled.', error)
  }
}

function notify() {
  for (const listener of listeners) listener()
}

function applyMuted(value: boolean) {
  muted = value
  withAudio(() => {
    if (muted) tiks.mute()
    else tiks.unmute()
  })
  notify()
}

function readPreference() {
  try {
    return window.localStorage.getItem(storageKey) === 'true'
  } catch {
    return muted
  }
}

function initialize() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  muted = readPreference()
  withAudio(() => tiks.init({ theme: 'soft', volume: 0.18, muted, respectReducedMotion: true }))
  notify()
}

export function playFeedback(kind: FeedbackKind): void {
  if (typeof window === 'undefined') return
  initialize()
  if (muted) return
  withAudio(() => {
    switch (kind) {
      case 'navigate':
        tiks.click()
        break
      case 'open':
        tiks.pop()
        break
      case 'confirm':
        tiks.success()
        break
      case 'error':
        tiks.error()
        break
      case 'toggle':
        tiks.toggle(true)
        break
    }
  })
}

export function setSoundMuted(value: boolean): void {
  if (typeof window === 'undefined') return
  initialize()
  applyMuted(value)
  try {
    window.localStorage.setItem(storageKey, String(value))
  } catch {
    return
  }
}

function toggleMuted() {
  setSoundMuted(!muted)
  if (!muted) playFeedback('toggle')
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return muted
}

function getServerSnapshot() {
  return false
}

export function useInteractionFeedback() {
  const isMuted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  useEffect(() => {
    initialize()
    const syncPreference = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) applyMuted(readPreference())
    }
    window.addEventListener('storage', syncPreference)
    return () => window.removeEventListener('storage', syncPreference)
  }, [])
  return { muted: isMuted, setMuted: setSoundMuted, toggleMuted, playFeedback }
}
