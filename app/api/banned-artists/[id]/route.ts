import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/banned-artists/[id] - Delete a banned artist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bannedArtist = await prisma.bannedArtist.findUnique({
      where: { id: parseInt(id) },
    })

    if (!bannedArtist) {
      return NextResponse.json(
        { error: 'Banned artist not found' },
        { status: 404 }
      )
    }

    await prisma.bannedArtist.delete({
      where: { id: parseInt(id) },
    })

    // Re-check all songs that might have been affected
    const songs = await prisma.song.findMany({
      where: {
        artist: {
          contains: bannedArtist.artist_name,
          mode: 'insensitive',
        },
      },
    })

    // Re-evaluate each song's status
    const bannedArtists = await prisma.bannedArtist.findMany()
    
    for (const song of songs) {
      const isBanned = bannedArtists.some(
        (b) => song.artist.toLowerCase().includes(b.artist_name.toLowerCase()) ||
               b.artist_name.toLowerCase().includes(song.artist.toLowerCase())
      )

      await prisma.song.update({
        where: { id: song.id },
        data: {
          status: isBanned ? 'Not Allowed' : 'Allowed',
        },
      })
    }

    return NextResponse.json({ message: 'Banned artist deleted successfully' })
  } catch (error) {
    console.error('Error deleting banned artist:', error)
    return NextResponse.json(
      { error: 'Failed to delete banned artist' },
      { status: 500 }
    )
  }
}

