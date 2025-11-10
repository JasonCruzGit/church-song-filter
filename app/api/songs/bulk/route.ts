import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/songs/bulk - Bulk upload songs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { songs } = body

    if (!Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json(
        { error: 'Songs array is required' },
        { status: 400 }
      )
    }

    // Get banned artists
    const bannedArtists = await prisma.bannedArtist.findMany()

    // Process each song
    const songData = songs.map((song: any) => {
      const { title, artist, album, category, lyrics_link } = song
      
      if (!title || !artist) {
        return null
      }

      // Check if artist is banned
      const isBanned = bannedArtists.some(
        (b) => artist.toLowerCase().includes(b.artist_name.toLowerCase()) ||
               b.artist_name.toLowerCase().includes(artist.toLowerCase())
      )

      return {
        title,
        artist,
        album: album || null,
        category: category || null,
        lyrics_link: lyrics_link || null,
        status: isBanned ? 'Not Allowed' : 'Allowed',
      }
    }).filter(Boolean)

    if (songData.length === 0) {
      return NextResponse.json(
        { error: 'No valid songs to import' },
        { status: 400 }
      )
    }

    // Create songs in bulk
    const result = await prisma.song.createMany({
      data: songData,
      skipDuplicates: true,
    })

    return NextResponse.json({
      message: `Successfully imported ${result.count} songs`,
      count: result.count,
    })
  } catch (error) {
    console.error('Error bulk importing songs:', error)
    return NextResponse.json(
      { error: 'Failed to bulk import songs' },
      { status: 500 }
    )
  }
}

