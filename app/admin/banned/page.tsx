'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'

interface BannedArtist {
  id: number
  artist_name: string
}

export default function BannedArtists() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [bannedArtists, setBannedArtists] = useState<BannedArtist[]>([])
  const [loading, setLoading] = useState(false)
  const [newArtist, setNewArtist] = useState('')
  const [adding, setAdding] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [artistToDelete, setArtistToDelete] = useState<BannedArtist | null>(null)

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated')
    if (auth !== 'true') {
      router.push('/admin')
      return
    }
    setAuthenticated(true)
    fetchBannedArtists()
  }, [router])

  const fetchBannedArtists = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/banned-artists')
      if (response.ok) {
        const data: BannedArtist[] = await response.json()
        setBannedArtists(data)
      }
    } catch (error) {
      console.error('Error fetching banned artists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newArtist.trim()) return

    setAdding(true)
    try {
      const response = await fetch('/api/banned-artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artist_name: newArtist.trim() }),
      })

      if (response.ok) {
        setNewArtist('')
        fetchBannedArtists()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add banned artist')
      }
    } catch (error) {
      console.error('Error adding banned artist:', error)
      alert('Failed to add banned artist')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async () => {
    if (!artistToDelete) return

    try {
      const response = await fetch(`/api/banned-artists/${artistToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchBannedArtists()
        setArtistToDelete(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete banned artist')
      }
    } catch (error) {
      console.error('Error deleting banned artist:', error)
      alert('Failed to delete banned artist')
    }
  }

  const openDeleteModal = (artist: BannedArtist) => {
    setArtistToDelete(artist)
    setShowDeleteModal(true)
  }

  if (!authenticated) {
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Banned Artists
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add or remove banned artists from the list
              </p>
            </div>
            <div className="flex items-center gap-4">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Banned Artist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Add Banned Artist
          </h2>
          <form onSubmit={handleAdd} className="flex gap-4">
            <input
              type="text"
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
              placeholder="e.g., Hillsong Worship, Bethel Music"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Songs from banned artists will automatically be marked as "Not Allowed"
          </p>
        </div>

        {/* Banned Artists List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Banned Artists ({bannedArtists.length})
            </h2>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : bannedArtists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No banned artists yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Artist Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {bannedArtists.map((artist) => (
                    <tr key={artist.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {artist.artist_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <button
                          onClick={() => openDeleteModal(artist)}
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setArtistToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Remove Banned Artist"
        message={`Are you sure you want to remove "${artistToDelete?.artist_name}" from the banned list? Songs from this artist will be re-evaluated.`}
        confirmText="Remove"
      />
    </div>
  )
}

