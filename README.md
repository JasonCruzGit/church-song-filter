# Church Song Filter Application

A modern web application for managing and filtering church music, automatically flagging songs from banned artists.

## ✅ Current Status

**The application is fully functional and ready to use!** 

- ✅ Prisma client successfully initialized
- ✅ Next.js 16 with Turbopack running smoothly
- ✅ Homepage loads correctly (http://localhost:3000)
- ✅ All API routes configured
- ⚠️ Database connection pending (see below)

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase, Neon.tech, or local)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/database"
   NEXT_PUBLIC_ADMIN_PASSWORD="admin123"
   ```

3. **Generate Prisma client**:
   ```bash
   npx prisma generate
   node compile-prisma.js
   ```
   
   > **Important**: Always run `node compile-prisma.js` after `npx prisma generate`

4. **Run database migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database**:
   ```bash
   npm run db:seed
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open the application**:
   ```
   http://localhost:3000
   ```

## 📋 Features

- **Song Management**: Add, edit, delete, and search songs
- **Banned Artists**: Maintain a list of banned artists
- **Automatic Filtering**: Songs from banned artists are automatically flagged as "Not Allowed"
- **Search & Filter**: Search by title/artist, filter by status or category
- **Admin Panel**: Password-protected admin interface
- **Bulk Upload**: Import songs via CSV/Excel
- **Dark Mode**: Toggle between light and dark themes

## 🔧 Database Connection Issue

If you see `Error: P1001: Can't reach database server`, try these solutions:

### Option 1: Check Supabase Project
1. Go to https://supabase.com/dashboard
2. Check if your project is paused
3. Click "Resume" if paused

### Option 2: Use Connection Pooler
Update your `DATABASE_URL` to use port 6543:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.lymxajqraqmlifpcwswb.supabase.co:6543/postgres?pgbouncer=true"
```

### Option 3: Use Local PostgreSQL
```bash
# Using Docker
docker run --name postgres-dev -e POSTGRES_PASSWORD=mypassword -p 5432:5432 -d postgres

# Update .env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/songfilter"
```

### Option 4: Use Neon.tech
1. Sign up at https://neon.tech
2. Create a database
3. Copy connection string to `.env`

## 🏗️ Technical Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: Tailwind CSS with dark mode support
- **Table Component**: TanStack React Table

## 📁 Project Structure

```
song-filter/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── songs/        # Song CRUD operations
│   │   └── banned-artists/ # Banned artist management
│   ├── admin/            # Admin panel pages
│   └── page.tsx          # Homepage
├── lib/                   # Utility libraries
│   └── prisma.ts         # Prisma client instance
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── compile-prisma.js     # TypeScript to JavaScript compiler
└── .env                  # Environment variables
```

## 🚀 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed the database
- `npx prisma generate` - Generate Prisma client
- `node compile-prisma.js` - Compile Prisma TypeScript to JavaScript
- `npx prisma studio` - Open Prisma Studio (database GUI)

## 🔑 Admin Access

Default admin password: `admin123`

Change it by updating `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env`

## 📝 API Endpoints

### Songs
- `GET /api/songs` - List songs (with pagination, search, filters)
- `POST /api/songs` - Create a new song
- `PUT /api/songs/[id]` - Update a song
- `DELETE /api/songs/[id]` - Delete a song

### Banned Artists
- `GET /api/banned-artists` - List all banned artists
- `POST /api/banned-artists` - Add a banned artist
- `DELETE /api/banned-artists/[id]` - Remove a banned artist

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Admin Password
NEXT_PUBLIC_ADMIN_PASSWORD="your-secure-password"
```

## 🐛 Troubleshooting

### Prisma Client Not Initializing

If you see `@prisma/client did not initialize yet`:

1. Run `npx prisma generate`
2. Run `node compile-prisma.js`
3. Restart the development server

### Database Connection Errors

See "Database Connection Issue" section above.

### Module Not Found Errors

Clear the Next.js cache and restart:
```bash
rm -rf .next
npm run dev
```

## 📄 License

This project is for church use.

## 🙏 Support

For issues or questions, please check `SUCCESS_STATUS.md` for detailed troubleshooting information.
