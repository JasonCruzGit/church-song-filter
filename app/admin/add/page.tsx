'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'

interface Song {
  id: number
  title: string
  artist: string
  album: string | null
  category: string | null
  lyrics_link: string | null
  youtube_link: string | null
  musical_key: string | null
  tempo_bpm: number | null
  time_signature: string | null
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
    youtube_link: '',
    musical_key: '',
    tempo_bpm: '',
    time_signature: '',
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
          youtube_link: song.youtube_link || '',
          musical_key: song.musical_key || '',
          tempo_bpm: song.tempo_bpm?.toString() || '',
          time_signature: song.time_signature || '',
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
          youtube_link: formData.youtube_link || null,
          musical_key: formData.musical_key || null,
          tempo_bpm: formData.tempo_bpm ? parseInt(formData.tempo_bpm) : null,
          time_signature: formData.time_signature || null,
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
      <Header 
        title={songId ? 'Edit Song' : 'Add New Song'}
        subtitle={songId ? 'Update song details' : 'Add a new song to the database'}
        showHomeLink={true}
        actionButton={{
          label: "← Back to Dashboard",
          href: "/admin",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          )
        }}
      />

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                YouTube Link
              </label>
              <input
                type="url"
                value={formData.youtube_link}
                onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Musical Key
                </label>
                <input
                  type="text"
                  value={formData.musical_key}
                  onChange={(e) => setFormData({ ...formData, musical_key: e.target.value })}
                  placeholder="e.g., C, D, E, F#, Gb"
                  className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tempo (BPM)
                </label>
                <input
                  type="number"
                  value={formData.tempo_bpm}
                  onChange={(e) => setFormData({ ...formData, tempo_bpm: e.target.value })}
                  placeholder="e.g., 120"
                  min="1"
                  max="300"
                  className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Signature
                </label>
                <input
                  type="text"
                  value={formData.time_signature}
                  onChange={(e) => setFormData({ ...formData, time_signature: e.target.value })}
                  placeholder="e.g., 4/4, 3/4, 6/8"
                  className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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

