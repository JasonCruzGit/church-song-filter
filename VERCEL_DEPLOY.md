# Deploy to Vercel - Step by Step

## ✅ Prerequisites

- ✅ Code pushed to GitHub
- ✅ Vercel account (sign up at https://vercel.com)

## 🚀 Deploy to Vercel

### Step 1: Sign Up / Login to Vercel

1. **Go to**: https://vercel.com
2. **Sign up** or **Login** (use GitHub account for easy integration)
3. **Authorize** Vercel to access your GitHub repositories

### Step 2: Import Your Project

1. **Click** "Add New Project" (or "New Project")
2. **Find your repository**: `church-song-filter` (or whatever you named it)
3. **Click** "Import"

### Step 3: Configure Project

Vercel will auto-detect Next.js, but verify these settings:

- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

**Click "Deploy"** (you can configure environment variables after)

### Step 4: Set Environment Variables

**IMPORTANT**: After first deployment, set environment variables:

1. **Go to**: Your Project → **Settings** → **Environment Variables**
2. **Add these variables**:

   **Variable 1:**
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon database connection string
   - **Environment**: Production, Preview, Development (check all)
   - **Click** "Save"

   **Variable 2:**
   - **Name**: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value**: Your admin password (e.g., `admin123`)
   - **Environment**: Production, Preview, Development (check all)
   - **Click** "Save"

### Step 5: Redeploy

1. **Go to**: **Deployments** tab
2. **Click** on the latest deployment
3. **Click** "Redeploy" (three dots menu)
4. **Wait** for deployment to complete (2-3 minutes)

### Step 6: Run Database Migrations

After deployment, run migrations:

**Option 1: Via Vercel CLI**
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migrations
npx prisma migrate deploy
```

**Option 2: Via Terminal (with DATABASE_URL set)**
```bash
# Set your database URL
export DATABASE_URL="your-neon-connection-string"

# Run migrations
npx prisma migrate deploy
```

### Step 7: Test Your Deployment

1. **Visit your Vercel URL**: `https://your-project.vercel.app`
2. **Test the application**:
   - Homepage loads ✅
   - Admin panel works (password: your `NEXT_PUBLIC_ADMIN_PASSWORD`) ✅
   - Can add songs ✅
   - Can search and filter ✅

---

## 🎉 Success!

Your application is now live on the internet! 🚀

**Your Vercel URL**: `https://your-project.vercel.app`

---

## 🔧 Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Common issues**:
   - Missing `DATABASE_URL` environment variable
   - Prisma client not generated
   - Database connection issues

### Database Connection Issues

1. **Verify** `DATABASE_URL` is set in Vercel environment variables
2. **Check** your Neon database is accessible
3. **Test** connection string locally first

### Prisma Errors

1. **Make sure** `postinstall` script runs:
   ```json
   "postinstall": "prisma generate && node compile-prisma.js"
   ```
2. **Redeploy** after changes

---

## 📝 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables set (`DATABASE_URL`, `NEXT_PUBLIC_ADMIN_PASSWORD`)
- [ ] Deployment successful
- [ ] Database migrations run
- [ ] Application tested on Vercel URL

---

## 🎊 You're Done!

Your church song filter application is now:
- ✅ Live on the internet
- ✅ Accessible from anywhere
- ✅ Automatically deployed on every push to GitHub
- ✅ Fast and reliable on Vercel's CDN

**Congratulations!** 🎉

