'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'

export default function QuickAdd() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [artist, setArtist] = useState('')
  const [category, setCategory] = useState('')
  const [songList, setSongList] = useState('')
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated')
    if (auth !== 'true') {
      router.push('/admin')
      return
    }
    setAuthenticated(true)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!artist.trim() || !songList.trim()) {
      setResult({ success: false, message: 'Artist and song list are required' })
      return
    }

    setUploading(true)
    setResult(null)

    try {
      // Parse song list - one song per line
      const songs = songList
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(title => ({
          title: title.trim(),
          artist: artist.trim(),
          category: category.trim() || null,
          album: null,
          lyrics_link: null,
        }))

      if (songs.length === 0) {
        setResult({ success: false, message: 'No valid songs found' })
        setUploading(false)
        return
      }

      // Upload songs
      const response = await fetch('/api/songs/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songs }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: `Successfully added ${data.count} songs from ${artist}`,
          count: data.count,
        })
        // Clear form
        setSongList('')
        setArtist('')
        setCategory('')
      } else {
        const error = await response.json()
        setResult({ success: false, message: error.error || 'Failed to add songs' })
      }
    } catch (error) {
      console.error('Error adding songs:', error)
      setResult({ success: false, message: 'Error adding songs' })
    } finally {
      setUploading(false)
    }
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="Living Word Worship Team Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Quick Add Songs
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add multiple songs from the same artist at once
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Artist Name *
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Sovereign Grace Music"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                All songs will be added with this artist name
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category (Optional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Worship, Praise, Hymn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Song Titles (One per line) *
              </label>
              <textarea
                value={songList}
                onChange={(e) => setSongList(e.target.value)}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter song titles, one per line:&#10;&#10;Come Thou Fount&#10;Amazing Grace&#10;How Great Thou Art&#10;..."
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter one song title per line. Empty lines will be ignored.
              </p>
            </div>

            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {result.message}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Adding Songs...' : 'Add All Songs'}
              </button>
              <Link
                href="/admin"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              💡 Example:
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p><strong>Artist:</strong> Sovereign Grace Music</p>
              <p><strong>Category:</strong> Worship</p>
              <p><strong>Songs:</strong></p>
              <pre className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs">
{`Come Thou Fount
Amazing Grace
How Great Thou Art
In Christ Alone
Before The Throne`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

