import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/lineups - Get all worship lineups
export async function GET(request: NextRequest) {
  try {
    const lineups = await prisma.worshipLineup.findMany({
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json(lineups)
  } catch (error) {
    console.error('Error fetching lineups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lineups' },
      { status: 500 }
    )
  }
}

// POST /api/lineups - Create a new worship lineup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, date, songIds } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Lineup name is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one song is required' },
        { status: 400 }
      )
    }

    // Create lineup with songs
    const lineup = await prisma.worshipLineup.create({
      data: {
        name,
        description: description || null,
        date: date ? new Date(date) : null,
        songs: {
          create: songIds.map((songId: number, index: number) => ({
            song_id: songId,
            order: index,
          })),
        },
      },
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(lineup, { status: 201 })
  } catch (error) {
    console.error('Error creating lineup:', error)
    return NextResponse.json(
      { error: 'Failed to create lineup' },
      { status: 500 }
    )
  }
}

