'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'

export default function QuickAddBannedArtists() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [artist, setArtist] = useState('')
  const [songTitles, setSongTitles] = useState('')
  const [reason, setReason] = useState('')
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number; skipped?: number } | null>(null)

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
    
    if (!artist.trim()) {
      setResult({ success: false, message: 'Artist is required' })
      return
    }

    if (!songTitles.trim()) {
      setResult({ success: false, message: 'Song titles are required' })
      return
    }

    setUploading(true)
    setResult(null)

    try {
      // Parse song titles - one per line
      const songs = songTitles
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      if (songs.length === 0) {
        setResult({ success: false, message: 'No valid song titles found' })
        setUploading(false)
        return
      }

      // Add the artist to banned artists list first
      const artistResponse = await fetch('/api/banned-artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          artist_name: artist.trim(),
          reason: reason.trim() || null,
        }),
      })

      if (!artistResponse.ok) {
        const error = await artistResponse.json()
        // If artist already exists, that's okay - continue
        if (!error.error?.includes('already exists')) {
          setResult({ success: false, message: error.error || 'Failed to add banned artist' })
          setUploading(false)
          return
        }
      }

      // Upload songs with this artist
      const songsToAdd = songs.map(title => ({
        title: title.trim(),
        artist: artist.trim(),
        status: 'Not Allowed',
      }))

      const songsResponse = await fetch('/api/songs/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songs: songsToAdd }),
      })

      if (songsResponse.ok) {
        const data = await songsResponse.json()
        setResult({
          success: true,
          message: `Successfully added ${data.count} banned song(s) from ${artist.trim()}`,
          count: data.count,
        })
        // Clear form
        setArtist('')
        setSongTitles('')
        setReason('')
      } else {
        const error = await songsResponse.json()
        setResult({ success: false, message: error.error || 'Failed to add banned songs' })
      }
    } catch (error) {
      console.error('Error adding banned songs:', error)
      setResult({ success: false, message: 'Error adding banned songs' })
    } finally {
      setUploading(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Living Word Worship Team Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Quick Add Banned Songs
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add multiple banned songs from the same artist at once
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/admin/banned"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Banned Artists
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Artist <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Hillsong Worship, Bethel Music"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The artist will be added to the banned artists list if not already present.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Song Titles (One per line) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={songTitles}
                onChange={(e) => setSongTitles(e.target.value)}
                rows={12}
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                placeholder="Enter song titles, one per line:&#10;&#10;What a Beautiful Name&#10;Oceans&#10;Cornerstone&#10;..."
                required
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Enter one song title per line. Empty lines will be ignored.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason Why It Is Not Allowed (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="e.g., Theological concerns, Association with problematic movements, etc."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This reason will be applied to the artist and all songs listed above.
              </p>
            </div>

            {result && (
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                <p
                  className={`text-sm ${
                    result.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}
                >
                  {result.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2.5 text-base sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {uploading ? 'Adding Songs...' : 'Add All Songs'}
              </button>
              <Link
                href="/admin/banned"
                className="px-6 py-2.5 text-base sm:text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center w-full sm:w-auto"
              >
                Cancel
              </Link>
            </div>
          </form>

          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
              ⚠️ Example:
            </h3>
            <div className="text-sm text-red-800 dark:text-red-300 space-y-1">
              <p><strong>Artist:</strong> Hillsong Worship</p>
              <p className="mt-2"><strong>Song Titles:</strong></p>
              <pre className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs">
{`What a Beautiful Name
Oceans
Cornerstone
Mighty to Save
From the Inside Out`}
              </pre>
              <p className="mt-2"><strong>Reason:</strong> Theological concerns, Association with problematic movements</p>
              <p className="mt-2 text-xs">
                The artist will be added to the banned list and all songs will be marked as "Not Allowed"
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

