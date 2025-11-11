'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'

interface LineupSong {
  id: number
  order: number
  song: {
    id: number
    title: string
    artist: string
  }
}

interface WorshipLineup {
  id: number
  name: string
  description: string | null
  date: string | null
  created_at: string
  songs: LineupSong[]
}

export default function LineupsPage() {
  const router = useRouter()
  const [lineups, setLineups] = useState<WorshipLineup[]>([])
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [lineupToDelete, setLineupToDelete] = useState<WorshipLineup | null>(null)

  useEffect(() => {
    fetchLineups()
  }, [])

  const fetchLineups = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/lineups')
      if (response.ok) {
        const data = await response.json()
        setLineups(data)
      }
    } catch (error) {
      console.error('Error fetching lineups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!lineupToDelete) return

    try {
      const response = await fetch(`/api/lineups/${lineupToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchLineups()
        setLineupToDelete(null)
        setShowDeleteModal(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete lineup')
      }
    } catch (error) {
      console.error('Error deleting lineup:', error)
      alert('Failed to delete lineup')
    }
  }

  const openDeleteModal = (lineup: WorshipLineup) => {
    setLineupToDelete(lineup)
    setShowDeleteModal(true)
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
                  Worship Lineups
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create and manage worship service lineups
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/lineups/new"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + New Lineup
              </Link>
              <Link
                href="/"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Home
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading lineups...</p>
          </div>
        ) : lineups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No lineups created yet</p>
            <Link
              href="/lineups/new"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Your First Lineup
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lineups.map((lineup) => (
              <div
                key={lineup.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {lineup.name}
                  </h3>
                  {lineup.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {lineup.description}
                    </p>
                  )}
                  {lineup.date && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Date: {new Date(lineup.date).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {lineup.songs.length} song{lineup.songs.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lineup.songs.map((lineupSong, index) => (
                    <div
                      key={lineupSong.id}
                      className="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        {index + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {lineupSong.song.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {lineupSong.song.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/lineups/${lineup.id}`}
                    className="flex-1 text-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/lineups/new?id=${lineup.id}`}
                    className="flex-1 text-center px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteModal(lineup)}
                    className="px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setLineupToDelete(null)
        }}
        onConfirm={handleDelete}
        title="Delete Lineup"
        message={`Are you sure you want to delete "${lineupToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  )
}

