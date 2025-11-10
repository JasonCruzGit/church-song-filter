# Deploy to GitHub and Vercel 🚀

## Step 1: Push to GitHub

### Option A: Create New Repository on GitHub

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `church-song-filter` (or any name you like)
3. **Description**: "Church music management application with banned artist filtering"
4. **Visibility**: Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

### Option B: Use GitHub CLI (if installed)

```bash
gh repo create church-song-filter --public --source=. --remote=origin --push
```

### After Creating Repository

Run these commands (GitHub will show you these after creating the repo):

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/church-song-filter.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** (use GitHub account for easy integration)
3. Click **"Add New Project"**
4. **Import your GitHub repository**:
   - Find `church-song-filter` in the list
   - Click **"Import"**
5. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
6. **Environment Variables**:
   - Click **"Environment Variables"**
   - Add these variables:
     ```
     DATABASE_URL = your-neon-database-connection-string
     NEXT_PUBLIC_ADMIN_PASSWORD = your-secure-password
     ```
   - **Important**: Get your Neon database connection string from https://console.neon.tech
7. **Deploy**:
   - Click **"Deploy"**
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? church-song-filter
# - Directory? ./
# - Override settings? No
```

---

## Step 3: Set Up Database on Vercel

### After Deployment

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Add Environment Variables**:
   - `DATABASE_URL`: Your Neon database connection string
   - `NEXT_PUBLIC_ADMIN_PASSWORD`: Your admin password
3. **Redeploy**:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - This will apply the environment variables

### Run Database Migrations on Vercel

After deployment, you need to run migrations:

**Option 1: Via Vercel CLI**
```bash
# Set environment variable locally
export DATABASE_URL="your-neon-connection-string"

# Run migrations
npx prisma migrate deploy
```

**Option 2: Via Vercel Dashboard**
1. Go to your project → **Settings** → **Environment Variables**
2. Make sure `DATABASE_URL` is set
3. Go to **Deployments** → Click on latest deployment
4. In the build logs, you can see if migrations ran

**Option 3: Add to Build Command**
Update `package.json`:
```json
"scripts": {
  "build": "prisma generate && node compile-prisma.js && prisma migrate deploy && next build",
  "postinstall": "prisma generate && node compile-prisma.js"
}
```

---

## Step 4: Verify Deployment

1. **Visit your Vercel URL**: `https://your-project.vercel.app`
2. **Test the application**:
   - Homepage loads
   - Admin panel works (password: your `NEXT_PUBLIC_ADMIN_PASSWORD`)
   - Can add songs
   - Can search and filter

---

## 🔧 Important Notes for Vercel

### Build Settings

Vercel will automatically:
- ✅ Detect Next.js
- ✅ Run `npm install`
- ✅ Run `npm run build`
- ✅ Deploy your app

### Environment Variables

**NEVER commit `.env` files!** Always set them in Vercel dashboard:
- Go to **Settings** → **Environment Variables**
- Add `DATABASE_URL` and `NEXT_PUBLIC_ADMIN_PASSWORD`
- Redeploy after adding variables

### Prisma on Vercel

Vercel needs to:
1. Generate Prisma client during build
2. Run migrations (if needed)

Add to `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate && node compile-prisma.js",
  "build": "prisma generate && node compile-prisma.js && next build"
}
```

---

## 🎉 After Deployment

Your application will be live at:
```
https://your-project.vercel.app
```

### Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS setup instructions

---

## 📝 Quick Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables set in Vercel
- [ ] Database migrations run
- [ ] Application tested on Vercel URL

---

## 🆘 Troubleshooting

### Build Fails on Vercel

1. **Check build logs** in Vercel dashboard
2. **Common issues**:
   - Missing environment variables
   - Prisma client not generated
   - Database connection issues

### Database Connection Issues

1. **Check `DATABASE_URL`** in Vercel environment variables
2. **Verify Neon database** is accessible
3. **Check connection string** format

### Prisma Errors

1. **Add to `package.json`**:
   ```json
   "postinstall": "prisma generate && node compile-prisma.js"
   ```
2. **Redeploy** after changes

---

## 🎊 You're Done!

Once deployed, your church song filter application will be:
- ✅ Live on the internet
- ✅ Accessible from anywhere
- ✅ Automatically deployed on every push to GitHub
- ✅ Fast and reliable on Vercel's CDN

**Congratulations!** 🎉

