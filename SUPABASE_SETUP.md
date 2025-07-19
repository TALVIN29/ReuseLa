# Supabase Setup for ReuseLa

This guide will help you set up Supabase for the ReuseLa community reuse and donation matching app.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `reusela` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. In your local project, create a `.env.local` file (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 4: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database-setup.sql` from this project
3. Paste it into the SQL editor
4. Click "Run" to execute the script

This will create:
- The `items` table with all necessary columns
- Indexes for better performance
- Row Level Security (RLS) policies
- Storage policies for image uploads
- Sample data for testing

## Step 5: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Enter the following details:
   - **Name**: `items`
   - **Public bucket**: ✅ Check this (for now)
   - **File size limit**: 5MB (or your preferred limit)
   - **Allowed MIME types**: `image/*`
4. Click "Create bucket"

## Step 6: Configure Storage Policies

The storage policies are already included in the SQL script, but you can verify them:

1. Go to **Storage** > **Policies**
2. You should see policies for the `items` bucket:
   - Public read access
   - Authenticated user uploads
   - User-specific file management

## Step 7: Test the Setup

1. Start your development server: `npm run dev`
2. Go to the **Post Item** page
3. Try uploading an image and filling out the form
4. Submit the form to test the database connection

## Step 8: Enable Authentication (Optional)

For a production app, you'll want to enable user authentication:

1. Go to **Authentication** > **Settings**
2. Configure your preferred authentication providers:
   - Email/Password
   - Google OAuth
   - Facebook OAuth
   - etc.

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that your environment variables are correct
   - Make sure you're using the `anon` key, not the `service_role` key

2. **"Bucket not found" error**
   - Make sure you created the `items` bucket in Storage
   - Check that the bucket name matches exactly

3. **"Permission denied" error**
   - Check that the RLS policies are set up correctly
   - Verify that the storage policies are in place

4. **Image upload fails**
   - Check the file size (should be under 5MB)
   - Verify the file type is an image
   - Check that the storage bucket is public

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Security Notes

1. **Environment Variables**: Never commit your `.env.local` file to version control
2. **Service Role Key**: Keep this secret and only use it on the server side
3. **RLS Policies**: Review and customize the Row Level Security policies for your needs
4. **Storage**: Consider making the storage bucket private and implementing proper access controls

## Next Steps

1. **Customize the schema**: Modify the database schema to match your specific requirements
2. **Add more features**: Implement user authentication, item requests, messaging, etc.
3. **Deploy**: Deploy your app to Vercel, Netlify, or your preferred platform
4. **Monitor**: Set up monitoring and analytics for your app

## Production Checklist

- [ ] Set up proper authentication
- [ ] Configure custom domains
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Set up backups
- [ ] Configure email notifications
- [ ] Test all features thoroughly
- [ ] Set up CI/CD pipeline 