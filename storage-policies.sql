-- Simple Storage Policies for ReuseLa
-- Run this in your Supabase SQL Editor after creating the 'items' bucket

-- Allow public read access to all files in the items bucket
CREATE POLICY "Allow public read access to items bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'items');

-- Allow anyone to upload files to the items bucket (for now)
-- In production, you might want to restrict this to authenticated users
CREATE POLICY "Allow uploads to items bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'items');

-- Allow users to update their own files
CREATE POLICY "Allow users to update files in items bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'items');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete files in items bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'items'); 

-- Add missing columns to the items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available',
ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'anonymous';

-- Add constraints for category and condition
ALTER TABLE items 
ADD CONSTRAINT check_category CHECK (category IN ('Books', 'Appliances', 'Furniture', 'Others')),
ADD CONSTRAINT check_condition CHECK (condition IN ('New', 'Good', 'Fair', 'Damaged')),
ADD CONSTRAINT check_status CHECK (status IN ('Available', 'Requested', 'Taken'));

-- Update existing rows to have default values
UPDATE items SET 
  category = 'Others' WHERE category IS NULL,
  condition = 'Good' WHERE condition IS NULL,
  status = 'Available' WHERE status IS NULL,
  user_id = 'anonymous' WHERE user_id IS NULL; 

-- Check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'items'
ORDER BY ordinal_position; 