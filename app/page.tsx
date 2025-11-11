'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import YouTubeIcon from '@/components/YouTubeIcon'

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
  bannedReason?: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Fetch all categories on mount
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
    fetchCategories()
  }, [])

  const fetchSongs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      
      // Handle special status-based categories
      if (category === 'Allowed') {
        params.append('status', 'Allowed')
      } else if (category === 'Not Allowed') {
        params.append('status', 'Not Allowed')
      } else if (category) {
        // Regular category filter
        params.append('category', category)
      }

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
    fetchSongs()
  }, [pagination.page, search, category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchSongs()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header 
        showAdminLink={true}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
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
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className="px-4 py-2.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <optgroup label="Status">
                  <option value="Allowed">✓ Allowed Songs</option>
                  <option value="Not Allowed">⚠️ Not Allowed Songs</option>
                </optgroup>
                {categories.length > 0 && (
                  <optgroup label="Song Categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </optgroup>
                )}
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

        {/* Songs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading songs...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400">No songs found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
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
                        Lyrics
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
                          {song.status === 'Not Allowed' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                ⚠️ Not Allowed
                              </span>
                              {song.bannedReason && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs">
                                  {song.bannedReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                              ✓ Allowed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col gap-1">
                            {song.lyrics_link && (
                              <a
                                href={song.lyrics_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Lyrics
                              </a>
                            )}
                            {song.youtube_link && (
                              <a
                                href={song.youtube_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity"
                                title="Watch on YouTube"
                              >
                                <YouTubeIcon className="w-5 h-5" />
                              </a>
                            )}
                            {!song.lyrics_link && !song.youtube_link && (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
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
                      {song.status === 'Not Allowed' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 whitespace-nowrap">
                          ⚠️ Not Allowed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {song.artist}
                    </p>
                    {song.status === 'Not Allowed' && song.bannedReason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-800 dark:text-red-200 font-medium">
                          Reason: {song.bannedReason}
          </p>
        </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {song.category && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {song.category}
                      </span>
                    )}
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
                    {song.status === 'Allowed' && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                        ✓ Allowed
                      </span>
                    )}
                        {song.lyrics_link && (
                          <a
                            href={song.lyrics_link}
            target="_blank"
            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Lyrics
                          </a>
                        )}
                        {song.youtube_link && (
                          <a
                            href={song.youtube_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity inline-flex items-center gap-1"
                            title="Watch on YouTube"
                          >
                            <YouTubeIcon className="w-4 h-4" />
                            <span className="text-xs">YouTube</span>
                          </a>
                        )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
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
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
