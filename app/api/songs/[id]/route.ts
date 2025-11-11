import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/songs/[id] - Get a single song
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const song = await prisma.song.findUnique({
      where: { id: parseInt(id) },
    })

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error fetching song:', error)
    return NextResponse.json(
      { error: 'Failed to fetch song' },
      { status: 500 }
    )
  }
}

// PUT /api/songs/[id] - Update a song
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, artist, album, category, lyrics_link, musical_key, tempo_bpm, time_signature } = body

    if (!title || !artist) {
      return NextResponse.json(
        { error: 'Title and artist are required' },
        { status: 400 }
      )
    }

    // Check if artist is banned
    const bannedArtists = await prisma.bannedArtist.findMany()
    const isBanned = bannedArtists.some(
      (b: { artist_name: string }) => artist.toLowerCase().includes(b.artist_name.toLowerCase()) ||
             b.artist_name.toLowerCase().includes(artist.toLowerCase())
    )

    const song = await prisma.song.update({
      where: { id: parseInt(id) },
      data: {
        title,
        artist,
        album: album || null,
        category: category || null,
        lyrics_link: lyrics_link || null,
        musical_key: musical_key || null,
        tempo_bpm: tempo_bpm ? parseInt(tempo_bpm.toString()) : null,
        time_signature: time_signature || null,
        status: isBanned ? 'Not Allowed' : 'Allowed',
      },
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error updating song:', error)
    return NextResponse.json(
      { error: 'Failed to update song' },
      { status: 500 }
    )
  }
}

// DELETE /api/songs/[id] - Delete a song
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.song.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Song deleted successfully' })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    )
  }
}

