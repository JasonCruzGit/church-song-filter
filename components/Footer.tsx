'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-t border-gray-700/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Living Word Worship Team Logo" 
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
              />
              <div>
                <h3 className="text-lg font-bold text-white">Living Word Worship Team</h3>
                <p className="text-sm text-gray-400">Worship Music Library</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Manage and organize your worship music library with ease. Filter songs, create lineups, and ensure your music aligns with your values.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/lineups" 
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Worship Lineups
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin" 
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center sm:text-left">
              © {currentYear} Living Word Worship Team. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Made with</span>
              <svg className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-gray-500">for worship teams</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

