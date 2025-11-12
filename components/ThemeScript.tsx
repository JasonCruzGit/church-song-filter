'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function ThemeScript() {
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    const html = document.documentElement
    const currentTheme = resolvedTheme || theme || 'light'
    
    if (currentTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [theme, resolvedTheme])

  return null
}

