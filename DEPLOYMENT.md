# Deployment Guide

## 🚀 Deploy ReuseLa to Production

### Step 1: Prepare for GitHub

1. **Initialize Git** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ReuseLa app"
   ```

2. **Create GitHub Repository**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `reusela` or `ReuseLa`
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/reusela.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Next.js project

3. **Configure Environment Variables**
   Add these in the Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Set Up Database

1. **Go to Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to SQL Editor

2. **Run Database Setup**
   - Copy the contents of `database-setup-final.sql`
   - Paste and run in Supabase SQL Editor

3. **Verify Setup**
   - Check that the ratings table was created
   - Test the functions work correctly

### Step 4: Test Your Live App

1. **Visit your Vercel URL**
2. **Test all features**:
   - User registration/login
   - Posting items
   - Browsing items
   - Requesting items
   - Managing requests
   - Dashboard functionality

### Environment Variables Reference

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for admin functions) | Supabase Dashboard > Settings > API |

### Troubleshooting

**Build Errors:**
- Check that all environment variables are set
- Ensure Supabase project is active
- Check Vercel build logs for specific errors

**Database Issues:**
- Verify SQL script ran successfully
- Check Supabase logs for errors
- Ensure RLS policies are correct

**App Not Working:**
- Check browser console for errors
- Verify Supabase connection
- Test with different browsers

### Next Steps

After successful deployment:

1. **Custom Domain** (Optional)
   - Add custom domain in Vercel dashboard
   - Configure DNS settings

2. **Monitoring**
   - Set up Vercel Analytics
   - Monitor Supabase usage

3. **Backup**
   - Set up database backups in Supabase
   - Regular code backups to GitHub

---

**Your ReuseLa app is now live and ready for users!** 🎉 