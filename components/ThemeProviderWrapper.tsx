'use client'

import { ThemeProvider } from 'next-themes'
import { ThemeScript } from './ThemeScript'

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      storageKey="worship-theme"
      disableTransitionOnChange={false}
    >
      <ThemeScript />
      {children}
    </ThemeProvider>
  )
}

