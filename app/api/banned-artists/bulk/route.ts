import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/banned-artists/bulk - Bulk add banned artists
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artists } = body

    if (!Array.isArray(artists) || artists.length === 0) {
      return NextResponse.json(
        { error: 'Artists array is required' },
        { status: 400 }
      )
    }

    let addedCount = 0
    let skippedCount = 0

    // Process each artist
    for (const artistName of artists) {
      if (!artistName || !artistName.trim()) {
        skippedCount++
        continue
      }

      const trimmedName = artistName.trim()

      try {
        // Try to create the banned artist
        await prisma.bannedArtist.create({
          data: { artist_name: trimmedName },
        })

        // Update all songs with this artist to "Not Allowed"
        await prisma.song.updateMany({
          where: {
            artist: {
              contains: trimmedName,
              mode: 'insensitive',
            },
          },
          data: {
            status: 'Not Allowed',
          },
        })

        addedCount++
      } catch (error: any) {
        // Skip if artist already exists (unique constraint)
        if (error.code === 'P2002') {
          skippedCount++
        } else {
          console.error(`Error adding banned artist "${trimmedName}":`, error)
          skippedCount++
        }
      }
    }

    return NextResponse.json({
      message: `Successfully added ${addedCount} banned artist(s)${skippedCount > 0 ? `, skipped ${skippedCount} duplicate(s)` : ''}`,
      count: addedCount,
      skipped: skippedCount,
    })
  } catch (error) {
    console.error('Error bulk adding banned artists:', error)
    return NextResponse.json(
      { error: 'Failed to bulk add banned artists' },
      { status: 500 }
    )
  }
}

