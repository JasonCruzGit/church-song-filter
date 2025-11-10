'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export default function BulkUpload() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)

  useEffect(() => {
    const auth = localStorage.getItem('admin_authenticated')
    if (auth !== 'true') {
      router.push('/admin')
      return
    }
    setAuthenticated(true)
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)
    setPreview([])

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()

    if (fileExtension === 'csv') {
      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          setPreview(results.data.slice(0, 5) as any[])
        },
        error: (error) => {
          console.error('Error parsing CSV:', error)
          alert('Error parsing CSV file')
        },
      })
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        setPreview(jsonData.slice(0, 5) as any[])
      }
      reader.readAsArrayBuffer(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      let songs: any[] = []

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            songs = results.data as any[]
            await uploadSongs(songs)
          },
          error: (error) => {
            console.error('Error parsing CSV:', error)
            setResult({ success: false, message: 'Error parsing CSV file' })
            setUploading(false)
          },
        })
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          songs = XLSX.utils.sheet_to_json(firstSheet) as any[]
          await uploadSongs(songs)
        }
        reader.readAsArrayBuffer(file)
      } else {
        setResult({ success: false, message: 'Unsupported file format' })
        setUploading(false)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setResult({ success: false, message: 'Error uploading file' })
      setUploading(false)
    }
  }

  const uploadSongs = async (songs: any[]) => {
    try {
      // Normalize the data - handle different column names
      const normalizedSongs = songs.map((song: any) => ({
        title: song.title || song.Title || song['Song Title'] || '',
        artist: song.artist || song.Artist || song['Artist Name'] || '',
        album: song.album || song.Album || song['Album Name'] || null,
        category: song.category || song.Category || song['Song Category'] || null,
        lyrics_link: song.lyrics_link || song['lyrics link'] || song['Lyrics Link'] || song.url || song.URL || null,
      })).filter((song: any) => song.title && song.artist)

      if (normalizedSongs.length === 0) {
        setResult({ success: false, message: 'No valid songs found in file' })
        setUploading(false)
        return
      }

      const response = await fetch('/api/songs/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songs: normalizedSongs }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: `Successfully imported ${data.count} songs`,
          count: data.count,
        })
        setFile(null)
        setPreview([])
      } else {
        const error = await response.json()
        setResult({ success: false, message: error.error || 'Failed to upload songs' })
      }
    } catch (error) {
      console.error('Error uploading songs:', error)
      setResult({ success: false, message: 'Error uploading songs' })
    } finally {
      setUploading(false)
    }
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
                Bulk Upload Songs
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Upload multiple songs from CSV or Excel file
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              File Format Instructions
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Supported formats: CSV (.csv) or Excel (.xlsx, .xls)</li>
              <li>Required columns: title (or Title, Song Title), artist (or Artist, Artist Name)</li>
              <li>Optional columns: album, category, lyrics_link (or url)</li>
              <li>The system will automatically check if artists are banned</li>
            </ul>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select File
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview (first 5 rows)
              </h3>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {Object.keys(preview[0] || {}).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value: any, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400"
                          >
                            {String(value || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
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

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Songs'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

