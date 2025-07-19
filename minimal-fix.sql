-- Minimal fix for items table - just add missing columns
-- Run this in your Supabase SQL Editor

-- Add missing columns
ALTER TABLE items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';

-- Set default values for any NULL values
UPDATE items SET category = 'Others' WHERE category IS NULL;
UPDATE items SET condition = 'Good' WHERE condition IS NULL;
UPDATE items SET status = 'Available' WHERE status IS NULL;
UPDATE items SET contact_name = 'Anonymous' WHERE contact_name IS NULL;
UPDATE items SET contact_phone = 'N/A' WHERE contact_phone IS NULL;
UPDATE items SET contact_email = 'anonymous@example.com' WHERE contact_email IS NULL; 