import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed banned artists
  const bannedArtists = [
    'Hillsong Worship',
    'Bethel Music',
    'Elevation Worship',
    'Hillsong United',
    'Bethel Music Worship',
  ]

  console.log('Seeding banned artists...')
  for (const artistName of bannedArtists) {
    try {
      await prisma.bannedArtist.upsert({
        where: { artist_name: artistName },
        update: {},
        create: { artist_name: artistName },
      })
      console.log(`✓ Added banned artist: ${artistName}`)
    } catch (error) {
      console.error(`Error adding ${artistName}:`, error)
    }
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

