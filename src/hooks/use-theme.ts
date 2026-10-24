import { useTheme as useThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import type { Preferences } from '@/lib/types'

export function useTheme(theme?: Preferences['theme']) {
  const { theme: currentTheme, setTheme } = useThemeProvider()
  useEffect(() => {
    if (theme && theme !== currentTheme) setTheme(theme)
  }, [theme, currentTheme, setTheme])
}
