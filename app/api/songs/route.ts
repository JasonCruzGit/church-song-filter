import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/songs - Get all songs with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    const [songs, total, bannedArtists] = await Promise.all([
      prisma.song.findMany({
        where,
        orderBy: { date_added: 'desc' },
        skip,
        take: limit,
      }),
      prisma.song.count({ where }),
      prisma.bannedArtist.findMany(),
    ])

    // Enrich songs with banned artist reason if applicable
    const enrichedSongs = songs.map((song) => {
      if (song.status === 'Not Allowed') {
        // Find matching banned artist
        const bannedArtist = bannedArtists.find((b) =>
          song.artist.toLowerCase().includes(b.artist_name.toLowerCase()) ||
          b.artist_name.toLowerCase().includes(song.artist.toLowerCase())
        )
        return {
          ...song,
          bannedReason: bannedArtist?.reason || null,
        }
      }
      return song
    })

    return NextResponse.json({
      songs: enrichedSongs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching songs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    )
  }
}

// POST /api/songs - Create a new song
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, artist, album, category, lyrics_link } = body

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

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        album: album || null,
        category: category || null,
        lyrics_link: lyrics_link || null,
        status: isBanned ? 'Not Allowed' : 'Allowed',
      },
    })

    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    console.error('Error creating song:', error)
    return NextResponse.json(
      { error: 'Failed to create song' },
      { status: 500 }
    )
  }
}

