'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  variant?: 'header' | 'default'
}

export default function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className={`p-2 rounded-lg ${variant === 'header' ? 'border border-white/20' : 'border border-gray-300 dark:border-gray-600'}`}>
        <div className="w-5 h-5" />
      </button>
    )
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Sync theme changes to document element
  useEffect(() => {
    if (resolvedTheme) {
      if (resolvedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [resolvedTheme])

  // Use resolvedTheme to get the actual theme (light/dark) even when theme is 'system'
  const isDark = resolvedTheme === 'dark'

  const headerClasses = "p-2.5 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 border border-white/20 hover:border-white/30 text-white transition-all duration-200 backdrop-blur-sm shadow-md hover:shadow-lg"
  const defaultClasses = "p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"

  return (
    <button
      onClick={toggleTheme}
      className={variant === 'header' ? headerClasses : defaultClasses}
      aria-label="Toggle theme"
    >
      {!isDark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  )
}

