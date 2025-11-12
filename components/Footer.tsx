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
              
             
            </div>
          
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
  
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
               
                </Link>
              </li>
              <li>
                <Link 
                  href="/lineups" 
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
              
                </Link>
              </li>
              <li>
              
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
            
          </div>
        </div>
      </div>
    </footer>
  )
}

