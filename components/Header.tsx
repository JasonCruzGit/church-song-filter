'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  title?: string
  subtitle?: string
  showAdminLink?: boolean
  showHomeLink?: boolean
  showLogout?: boolean
  onLogout?: () => void
  actionButton?: {
    label: string
    href: string
    icon?: React.ReactNode
  }
}

export default function Header({
  title = 'Living Word Worship Team',
  subtitle = 'Worship Music Library',
  showAdminLink = false,
  showHomeLink = false,
  showLogout = false,
  onLogout,
  actionButton,
}: HeaderProps) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 shadow-lg border-b border-blue-500/20 dark:border-gray-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
          {/* Logo and Title Section */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-full p-2 border-2 border-white/30 dark:border-white/20 group-hover:border-white/50 transition-all duration-300">
              <img 
                src="/logo.png" 
                alt="Living Word Worship Team Logo" 
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover ring-2 ring-white/20"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 dark:text-blue-200 mt-0.5 font-medium">
                {subtitle}
              </p>
            </div>
          </Link>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Action Button */}
            {actionButton && (
              <Link
                href={actionButton.href}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm border border-white/20"
              >
                {actionButton.icon}
                <span className="hidden sm:inline">{actionButton.label}</span>
                <span className="sm:hidden">{actionButton.label.split(' ')[0]}</span>
              </Link>
            )}

            {/* Admin Link */}
            {showAdminLink && !isAdminPage && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white hover:text-blue-100 dark:hover:text-blue-200 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Home Link */}
            {showHomeLink && pathname !== '/' && (
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white hover:text-blue-100 dark:hover:text-blue-200 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </Link>
            )}

            {/* Logout Button */}
            {showLogout && onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white hover:text-red-200 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-red-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            {/* Theme Toggle */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm"></div>
              <div className="relative">
                <ThemeToggle variant="header" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

