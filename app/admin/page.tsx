'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  youtube_link: string | null
  musical_key: string | null
  tempo_bpm: number | null
  time_signature: string | null
  status: string
  date_added: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [songToDelete, setSongToDelete] = useState<Song | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [stats, setStats] = useState({
    total: 0,
    allowed: 0,
    notAllowed: 0,
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/songs?limit=1000')
        const data = await response.json()
        const uniqueCategories = Array.from(
          new Set(data.songs?.map((s: Song) => s.category).filter(Boolean) || [])
        ) as string[]
        setCategories(uniqueCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    if (authenticated) {
      fetchCategories()
    }
  }, [authenticated])

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/songs?limit=1000')
      const data = await response.json()
      const allSongs = data.songs || []
      const total = allSongs.length
      const allowed = allSongs.filter((s: Song) => s.status === 'Allowed').length
      const notAllowed = total - allowed
      setStats({ total, allowed, notAllowed })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchSongs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (categoryFilter) params.append('category', categoryFilter)

      const response = await fetch(`/api/songs?${params}`)
      const data = await response.json()
      setSongs(data.songs || [])
      setPagination(data.pagination || pagination)
    } catch (error) {
      console.error('Error fetching songs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated')
    if (auth === 'true') {
      setAuthenticated(true)
      fetchStats()
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchSongs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, pagination.page, search, statusFilter, categoryFilter])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check - in production, use proper authentication
    if (password === 'admin123' || password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('admin_authenticated', 'true')
      setAuthenticated(true)
      setError('')
      fetchStats()
    } else {
      setError('Incorrect password')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setAuthenticated(false)
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchSongs()
  }

  const handleDelete = async () => {
    if (!songToDelete) return

    try {
      const response = await fetch(`/api/songs/${songToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSongs()
        fetchStats()
        setSongToDelete(null)
        setShowDeleteModal(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete song')
      }
    } catch (error) {
      console.error('Error deleting song:', error)
      alert('Failed to delete song')
    }
  }

  const openDeleteModal = (song: Song) => {
    setSongToDelete(song)
    setShowDeleteModal(true)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Login
            </h1>
            <ThemeToggle />
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
          <Link
            href="/"
            className="block mt-4 text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Home
          </Link>
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
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Living Word Worship Team - Worship Music Library
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
              <Link
                href="/"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Home
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Songs
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
              Allowed Songs
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {stats.allowed}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
              Not Allowed Songs
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {stats.notAllowed}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            <Link
              href="/admin/add"
              className="px-4 sm:px-6 py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Add New Song
            </Link>
            <Link
              href="/admin/quick-add"
              className="px-4 sm:px-6 py-3 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              Quick Add (Same Artist)
            </Link>
            <Link
              href="/admin/bulk"
              className="px-4 sm:px-6 py-3 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              Bulk Upload (CSV/Excel)
            </Link>
            <Link
              href="/admin/banned"
              className="px-4 sm:px-6 py-3 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
            >
              Manage Banned Artists
            </Link>
            <Link
              href="/admin/banned/quick-add"
              className="px-4 sm:px-6 py-3 text-sm sm:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center"
            >
              Quick Add Banned Songs
            </Link>
            <Link
              href="/admin/lineups"
              className="px-4 sm:px-6 py-3 text-sm sm:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
            >
              Worship Lineups
            </Link>
          </div>
        </div>

        {/* All Songs with Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              All Songs ({pagination.total})
            </h2>
            
            {/* Search and Filter */}
            <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Search by title or artist..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                  className="px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="Allowed">✓ Allowed</option>
                  <option value="Not Allowed">⚠️ Not Allowed</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }}
                  className="px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-base sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading songs...</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No songs found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Key / BPM / Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {songs.map((song) => (
                      <tr 
                        key={song.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          song.status === 'Not Allowed' ? 'bg-red-50 dark:bg-red-900/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {song.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {song.artist}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {song.category || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col gap-1">
                            {song.musical_key && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                Key: {song.musical_key}
                              </span>
                            )}
                            {song.tempo_bpm && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                {song.tempo_bpm} BPM
                              </span>
                            )}
                            {song.time_signature && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                                {song.time_signature}
                              </span>
                            )}
                            {!song.musical_key && !song.tempo_bpm && !song.time_signature && (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              song.status === 'Allowed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            }`}
                          >
                            {song.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/admin/add?id=${song.id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => openDeleteModal(song)}
                              className="text-red-600 dark:text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2 ${
                      song.status === 'Not Allowed' ? 'border-l-4 border-red-500' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {song.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            song.status === 'Allowed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                          }`}
                        >
                          {song.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {song.artist}
                      </p>
                      {song.category && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Category: {song.category}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {song.musical_key && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                          Key: {song.musical_key}
                        </span>
                      )}
                      {song.tempo_bpm && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                          {song.tempo_bpm} BPM
                        </span>
                      )}
                      {song.time_signature && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                          {song.time_signature}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href={`/admin/add?id=${song.id}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => openDeleteModal(song)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                      }
                      disabled={pagination.page === 1}
                      className="px-6 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto min-w-[120px]"
                    >
                      Previous
                    </button>
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center">
                      Page {pagination.page} of {pagination.totalPages}
                      <span className="hidden sm:inline"> ({pagination.total} total)</span>
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="px-6 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto min-w-[120px]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSongToDelete(null)
          }}
          onConfirm={handleDelete}
          title="Delete Song"
          message={`Are you sure you want to delete "${songToDelete?.title}" by ${songToDelete?.artist}? This action cannot be undone.`}
          confirmText="Delete"
        />
      </main>
    </div>
  )
}

