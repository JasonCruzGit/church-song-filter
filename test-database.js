// Simple script to test if database connection works
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 Testing database connection...\n')
  
  try {
    await prisma.$connect()
    console.log('✅ SUCCESS! Database connected!\n')
    console.log('Next steps:')
    console.log('1. Run: npx prisma migrate dev --name init')
    console.log('2. Run: npm run db:seed')
    console.log('3. Run: npm run dev')
    console.log('4. Open: http://localhost:3000\n')
  } catch (error) {
    console.log('❌ FAILED! Could not connect to database.\n')
    console.log('Error:', error.message, '\n')
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('💡 SOLUTIONS:')
      console.log('')
      console.log('EASIEST FIX: Use Neon instead of Supabase')
      console.log('1. Go to: https://neon.tech')
      console.log('2. Sign up (free, no credit card)')
      console.log('3. Create a project')
      console.log('4. Copy the connection string')
      console.log('5. Update DATABASE_URL in .env file')
      console.log('6. Run this test again: node test-database.js')
      console.log('')
      console.log('OR try Supabase Connection Pooler:')
      console.log('- In .env, change port from 5432 to 6543')
      console.log('- Add ?pgbouncer=true at the end')
      console.log('')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

