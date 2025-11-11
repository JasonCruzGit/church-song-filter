import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/lineups/[id] - Get a single lineup (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lineup = await prisma.worshipLineup.findUnique({
      where: { id: parseInt(id) },
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

    if (!lineup) {
      return NextResponse.json({ error: 'Lineup not found' }, { status: 404 })
    }

    return NextResponse.json(lineup)
  } catch (error) {
    console.error('Error fetching lineup:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lineup' },
      { status: 500 }
    )
  }
}

// PUT /api/lineups/[id] - Update a lineup (public access)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, date, songIds } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Lineup name is required' },
        { status: 400 }
      )
    }

    // Delete existing songs
    await prisma.lineupSong.deleteMany({
      where: { lineup_id: parseInt(id) },
    })

    // Update lineup and add new songs
    const lineup = await prisma.worshipLineup.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || null,
        date: date ? new Date(date) : null,
        songs: {
          create: (songIds || []).map((songId: number, index: number) => ({
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

    return NextResponse.json(lineup)
  } catch (error) {
    console.error('Error updating lineup:', error)
    return NextResponse.json(
      { error: 'Failed to update lineup' },
      { status: 500 }
    )
  }
}

// DELETE /api/lineups/[id] - Delete a lineup (public access)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.worshipLineup.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Lineup deleted successfully' })
  } catch (error) {
    console.error('Error deleting lineup:', error)
    return NextResponse.json(
      { error: 'Failed to delete lineup' },
      { status: 500 }
    )
  }
}

