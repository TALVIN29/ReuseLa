# Quick Setup Guide - Fix the Supabase Error

## 🚨 Current Issue
You're getting the error: `Error posting item: (0 , _lib_supabase__WEBPACK_IMPORTED_MODULE_3__.createClient) is not a function`

This is because the Supabase environment variables are not configured.

## ✅ Quick Fix Steps

### 1. Create Environment File
Create a file called `.env.local` in your project root with this content:

```env
# Supabase Configuration
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Get Your Supabase Credentials

**Option A: Create a new Supabase project**
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and anon key

**Option B: Use existing project**
1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon key

### 3. Update Your .env.local File
Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Database
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `database-setup.sql`
3. Click "Run" to create the database table

### 5. Create Storage Bucket
1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it: `items`
4. Check "Public bucket"
5. Click "Create bucket"

### 6. Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🧪 Test the Setup

1. Go to your app: http://localhost:3000 (or whatever port it shows)
2. Navigate to the "Post Item" page
3. Try uploading an image and filling out the form
4. Submit the form

## ✅ Success Indicators

- ✅ No more import errors in the console
- ✅ Form submits without errors
- ✅ Item appears in your Supabase database
- ✅ Image appears in your Supabase storage

## 🆘 Still Having Issues?

### Check Environment Variables
Make sure your `.env.local` file:
- ✅ Is in the project root (same folder as `package.json`)
- ✅ Has no spaces around the `=` sign
- ✅ Has the correct variable names (exactly as shown)
- ✅ Has your actual Supabase credentials

### Check Supabase Setup
Make sure in your Supabase project:
- ✅ The `items` table exists (run the SQL script)
- ✅ The `items` storage bucket exists
- ✅ Your API keys are correct

### Common Error Messages

**"Invalid API key"**
- Check that you copied the `anon` key, not the `service_role` key
- Make sure there are no extra spaces or characters

**"Bucket not found"**
- Make sure you created the storage bucket named exactly `items`
- Check that the bucket is public

**"Table not found"**
- Run the `database-setup.sql` script in your Supabase SQL editor

## 📞 Need Help?

1. Check the full setup guide: `SUPABASE_SETUP.md`
2. Look at the Supabase documentation: https://supabase.com/docs
3. Check the Supabase Discord: https://discord.supabase.com

## 🎯 Next Steps

Once this is working:
1. Customize the form fields as needed
2. Add user authentication
3. Implement item requests and messaging
4. Deploy to production

---

**Your app should now work! 🎉** 