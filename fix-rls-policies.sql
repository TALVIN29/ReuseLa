-- Fix Row Level Security (RLS) policies for items table
-- Run this in your Supabase SQL Editor

-- First, let's see if RLS is enabled and what policies exist
-- You can check this in the Supabase dashboard under Authentication > Policies

-- Option 1: Disable RLS temporarily (for development)
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- Option 2: Create policies to allow all operations (for development)
-- Uncomment the lines below if you want to keep RLS enabled but allow all operations

-- Allow anyone to insert items (for development)
-- CREATE POLICY "Allow anyone to insert items" ON items
--   FOR INSERT WITH CHECK (true);

-- Allow anyone to select items
-- CREATE POLICY "Allow anyone to select items" ON items
--   FOR SELECT USING (true);

-- Allow anyone to update items
-- CREATE POLICY "Allow anyone to update items" ON items
--   FOR UPDATE USING (true);

-- Allow anyone to delete items
-- CREATE POLICY "Allow anyone to delete items" ON items
--   FOR DELETE USING (true);

-- Note: For production, you should create more restrictive policies
-- that only allow users to manage their own items 