import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/banned-artists - Get all banned artists
export async function GET() {
  try {
    const bannedArtists = await prisma.bannedArtist.findMany({
      orderBy: { artist_name: 'asc' },
    })
    return NextResponse.json(bannedArtists)
  } catch (error) {
    console.error('Error fetching banned artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banned artists' },
      { status: 500 }
    )
  }
}

// POST /api/banned-artists - Add a banned artist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artist_name } = body

    if (!artist_name) {
      return NextResponse.json(
        { error: 'Artist name is required' },
        { status: 400 }
      )
    }

    const bannedArtist = await prisma.bannedArtist.create({
      data: { artist_name },
    })

    // Update all songs with this artist to "Not Allowed"
    await prisma.song.updateMany({
      where: {
        artist: {
          contains: artist_name,
          mode: 'insensitive',
        },
      },
      data: {
        status: 'Not Allowed',
      },
    })

    return NextResponse.json(bannedArtist, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Artist already in banned list' },
        { status: 409 }
      )
    }
    console.error('Error creating banned artist:', error)
    return NextResponse.json(
      { error: 'Failed to create banned artist' },
      { status: 500 }
    )
  }
}

