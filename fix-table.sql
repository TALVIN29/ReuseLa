-- Fix existing items table by adding missing columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to the items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';

-- Add constraints to the new columns
ALTER TABLE items 
ALTER COLUMN category SET NOT NULL,
ALTER COLUMN condition SET NOT NULL,
ALTER COLUMN contact_name SET NOT NULL,
ALTER COLUMN contact_phone SET NOT NULL,
ALTER COLUMN contact_email SET NOT NULL;

-- Add check constraints for category and condition
ALTER TABLE items 
ADD CONSTRAINT IF NOT EXISTS check_category 
CHECK (category IN ('Books', 'Appliances', 'Furniture', 'Others'));

ALTER TABLE items 
ADD CONSTRAINT IF NOT EXISTS check_condition 
CHECK (condition IN ('New', 'Good', 'Fair', 'Damaged'));

ALTER TABLE items 
ADD CONSTRAINT IF NOT EXISTS check_status 
CHECK (status IN ('Available', 'Requested', 'Taken'));

-- Update any existing NULL values with defaults
UPDATE items SET category = 'Others' WHERE category IS NULL;
UPDATE items SET condition = 'Good' WHERE condition IS NULL;
UPDATE items SET status = 'Available' WHERE status IS NULL;
UPDATE items SET contact_name = 'Anonymous' WHERE contact_name IS NULL;
UPDATE items SET contact_phone = 'N/A' WHERE contact_phone IS NULL;
UPDATE items SET contact_email = 'anonymous@example.com' WHERE contact_email IS NULL; 