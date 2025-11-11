'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'

interface Song {
  id: number
  title: string
  artist: string
  status: string
}

function NewLineupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lineupId = searchParams.get('id')

  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
  })
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([])
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])

  useEffect(() => {
    // Lineups are now public - no authentication required
    setAuthenticated(true)
    fetchSongs()

    if (lineupId) {
      fetchLineup()
    }
  }, [lineupId, router])

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs?limit=1000')
      const data = await response.json()
      setAvailableSongs(data.songs || [])
      setFilteredSongs(data.songs || [])
    } catch (error) {
      console.error('Error fetching songs:', error)
    }
  }

  const fetchLineup = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/lineups/${lineupId}`)
      if (response.ok) {
        const lineup = await response.json()
        setFormData({
          name: lineup.name,
          description: lineup.description || '',
          date: lineup.date ? new Date(lineup.date).toISOString().split('T')[0] : '',
        })
        setSelectedSongs(lineup.songs.map((ls: any) => ls.song))
      }
    } catch (error) {
      console.error('Error fetching lineup:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery) {
      const filtered = availableSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSongs(filtered)
    } else {
      setFilteredSongs(availableSongs)
    }
  }, [searchQuery, availableSongs])

  const addSong = (song: Song) => {
    if (!selectedSongs.find((s) => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song])
    }
  }

  const removeSong = (songId: number) => {
    setSelectedSongs(selectedSongs.filter((s) => s.id !== songId))
  }

  const moveSong = (index: number, direction: 'up' | 'down') => {
    const newSongs = [...selectedSongs]
    if (direction === 'up' && index > 0) {
      [newSongs[index - 1], newSongs[index]] = [newSongs[index], newSongs[index - 1]]
    } else if (direction === 'down' && index < newSongs.length - 1) {
      [newSongs[index], newSongs[index + 1]] = [newSongs[index + 1], newSongs[index]]
    }
    setSelectedSongs(newSongs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || selectedSongs.length === 0) {
      alert('Please provide a name and select at least one song')
      return
    }

    setSaving(true)
    try {
      const url = lineupId ? `/api/lineups/${lineupId}` : '/api/lineups'
      const method = lineupId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          date: formData.date || null,
          songIds: selectedSongs.map((s) => s.id),
        }),
      })

      if (response.ok) {
        router.push('/admin/lineups')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save lineup')
      }
    } catch (error) {
      console.error('Error saving lineup:', error)
      alert('Failed to save lineup')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
                  {lineupId ? 'Edit Worship Lineup' : 'Create Worship Lineup'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select songs and arrange them in order
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/admin/lineups"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Lineups
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lineup Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lineup Details
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sunday Morning - January 15, 2024"
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Optional description or notes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date (Optional)
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Selected Songs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Selected Songs ({selectedSongs.length})
            </h2>
            {selectedSongs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No songs selected. Search and add songs below.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                        {index + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {song.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveSong(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSong(index, 'down')}
                        disabled={index === selectedSongs.length - 1}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSong(song.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Songs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Songs
            </h2>
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
            />
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredSongs.map((song) => {
                const isSelected = selectedSongs.some((s) => s.id === song.id)
                return (
                  <div
                    key={song.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {song.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => (isSelected ? removeSong(song.id) : addSong(song))}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isSelected ? 'Remove' : 'Add'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/lineups"
              className="px-6 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.name || selectedSongs.length === 0}
              className="px-6 py-2.5 text-base sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : lineupId ? 'Update Lineup' : 'Create Lineup'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default function NewLineup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <NewLineupContent />
    </Suspense>
  )
}

