# 🚀 Deploy to GitHub & Vercel - Step by Step

## ✅ Everything is Ready!

Your code is committed and ready to deploy. Follow these steps:

---

## 📦 Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `church-song-filter` (or any name you prefer)
3. **Description**: "Church music management application"
4. **Visibility**: Choose Public or Private
5. **IMPORTANT**: Do NOT check "Add a README file" (we already have one)
6. **Click**: "Create repository"

---

## 🔗 Step 2: Connect & Push to GitHub

After creating the repository, GitHub will show you commands. **Run these in your terminal** (replace `YOUR_USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/church-song-filter.git
git branch -M main
git push -u origin main
```

**Example:**
If your GitHub username is `johnsmith`, run:
```bash
git remote add origin https://github.com/johnsmith/church-song-filter.git
git branch -M main
git push -u origin main
```

**Note**: You'll be asked for your GitHub username and password (or personal access token).

---

## 🌐 Step 3: Deploy to Vercel

### 3.1 Sign Up / Login

1. **Go to Vercel**: https://vercel.com
2. **Sign up** or **Login** (use "Continue with GitHub" for easy integration)

### 3.2 Import Your Project

1. **Click**: "Add New Project" (or "New Project")
2. **Find**: `church-song-filter` in the list
3. **Click**: "Import"

### 3.3 Configure Project

1. **Framework Preset**: Next.js (should be auto-detected)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)
6. **Click**: "Deploy" (you can set environment variables after)

### 3.4 Set Environment Variables

**IMPORTANT**: You must set these before the app works!

1. **Go to**: Your Project → **Settings** → **Environment Variables**
2. **Add these variables**:

   **Variable 1:**
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon database connection string
     ```
     postgresql://neondb_owner:npg_r6MHK3uVQhtX@ep-twilight-leaf-a40kr7jx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - **Name**: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value**: `admin123` (or your preferred password)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

3. **Click**: "Save"

### 3.5 Redeploy

1. **Go to**: **Deployments** tab
2. **Click** on the latest deployment
3. **Click**: "Redeploy"
4. **Wait**: 2-3 minutes for deployment to complete

### 3.6 Run Database Migrations

After deployment, you need to run database migrations:

**Option A: Using Vercel CLI (Recommended)**

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

4. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

5. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

**Option B: Using Neon Console**

1. Go to your Neon project dashboard
2. Open the SQL Editor
3. Run:
   ```sql
   CREATE TABLE IF NOT EXISTS "Song" (
     "id" SERIAL PRIMARY KEY,
     "title" TEXT NOT NULL,
     "artist" TEXT NOT NULL,
     "album" TEXT,
     "category" TEXT,
     "lyrics_link" TEXT,
     "status" TEXT NOT NULL DEFAULT 'Allowed',
     "date_added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS "BannedArtist" (
     "id" SERIAL PRIMARY KEY,
     "artist_name" TEXT NOT NULL UNIQUE
   );

   CREATE INDEX IF NOT EXISTS "Song_artist_idx" ON "Song"("artist");
   CREATE INDEX IF NOT EXISTS "Song_status_idx" ON "Song"("status");
   ```

---

## ✅ Step 4: Test Your Deployment

1. **Visit**: Your Vercel URL (e.g., `https://church-song-filter.vercel.app`)
2. **Test**:
   - Homepage loads
   - Admin login works (`/admin`)
   - Can add songs
   - Can search/filter songs

---

## 🎉 Success!

Your application is now:
- ✅ Live on the internet
- ✅ Accessible from anywhere
- ✅ Automatically deployed on every push to GitHub
- ✅ Fast and reliable on Vercel's CDN

---

## 🔄 Future Updates

Every time you push to GitHub:
1. Vercel automatically detects the push
2. Builds your application
3. Deploys the new version
4. Your app is updated automatically!

---

## 🆘 Troubleshooting

### Build Fails on Vercel

- **Check**: Environment variables are set correctly
- **Check**: `DATABASE_URL` is valid
- **Check**: Build logs in Vercel dashboard

### Database Connection Errors

- **Check**: `DATABASE_URL` is set in Vercel
- **Check**: Database is accessible from internet (Neon should be)
- **Check**: SSL mode is correct (`?sslmode=require`)

### Prisma Client Errors

- **Check**: `postinstall` script runs (should be automatic)
- **Check**: `esbuild` is in `devDependencies` (already added)

---

## 📝 Quick Reference

**GitHub Repository**: `https://github.com/YOUR_USERNAME/church-song-filter`

**Vercel Dashboard**: `https://vercel.com/dashboard`

**Your Live App**: `https://your-project-name.vercel.app`

---

**Ready to deploy? Follow the steps above!** 🚀

