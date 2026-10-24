import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import type { AppData, Status } from './types'

export type SubsBootstrap = { today: string } & (
  | { kind: 'locked'; status: Status; data: null; revision: null; error: '' }
  | { kind: 'ready'; status: Status; data: AppData; revision: string; error: '' }
  | { kind: 'error'; status: null; data: null; revision: null; error: string }
)

const BootstrapContext = createContext<SubsBootstrap | undefined>(undefined)

export function SubsBootstrapProvider({ children, value }: { children: ReactNode; value: SubsBootstrap }) {
  return <BootstrapContext.Provider value={value}>{children}</BootstrapContext.Provider>
}

export function useSubsBootstrap() {
  return useContext(BootstrapContext)
}

export function useCollectionDate() {
  const bootstrap = useSubsBootstrap()
  const [today, setToday] = useState(() => {
    if (!bootstrap) return new Date()
    const [year, month, day] = bootstrap.today.split('-').map(Number)
    return new Date(year, month - 1, day, 12)
  })
  useEffect(() => {
    let timer: number | undefined
    const refresh = () => {
      const now = new Date()
      setToday((previous) => {
        if (
          previous.getFullYear() === now.getFullYear() &&
          previous.getMonth() === now.getMonth() &&
          previous.getDate() === now.getDate()
        )
          return previous
        return now
      })
      window.clearTimeout(timer)
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      timer = window.setTimeout(refresh, midnight.getTime() - now.getTime())
    }
    const visible = () => {
      if (!document.hidden) refresh()
    }
    refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', visible)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [])
  return today
}
