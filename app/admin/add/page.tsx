'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'

interface Song {
  id: number
  title: string
  artist: string
  album: string | null
  category: string | null
  lyrics_link: string | null
  status: string
}

function AddSongContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const songId = searchParams.get('id')

  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    category: '',
    lyrics_link: '',
  })

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated')
    if (auth !== 'true') {
      router.push('/admin')
      return
    }
    setAuthenticated(true)

    if (songId) {
      fetchSong()
    }
  }, [songId, router])

  const fetchSong = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/songs/${songId}`)
      if (response.ok) {
        const song: Song = await response.json()
        setFormData({
          title: song.title,
          artist: song.artist,
          album: song.album || '',
          category: song.category || '',
          lyrics_link: song.lyrics_link || '',
        })
      }
    } catch (error) {
      console.error('Error fetching song:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = songId ? `/api/songs/${songId}` : '/api/songs'
      const method = songId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          artist: formData.artist,
          album: formData.album || null,
          category: formData.category || null,
          lyrics_link: formData.lyrics_link || null,
        }),
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save song')
      }
    } catch (error) {
      console.error('Error saving song:', error)
      alert('Failed to save song')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete song')
      }
    } catch (error) {
      console.error('Error deleting song:', error)
      alert('Failed to delete song')
    }
  }

  if (!authenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                src="/logo.jpg" 
                alt="Living Word Worship Team Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {songId ? 'Edit Song' : 'Add New Song'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {songId ? 'Update song details' : 'Add a new song to the database'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Dashboard
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Artist <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The system will automatically check if this artist is banned
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Album
              </label>
              <input
                type="text"
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Worship, Praise, Communion"
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lyrics Link
              </label>
              <input
                type="url"
                value={formData.lyrics_link}
                onChange={(e) => setFormData({ ...formData, lyrics_link: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              {songId && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-2.5 text-base sm:text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full sm:w-auto"
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-base sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {saving ? 'Saving...' : songId ? 'Update Song' : 'Add Song'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Song"
        message="Are you sure you want to delete this song? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}

export default function AddSong() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AddSongContent />
    </Suspense>
  )
}

