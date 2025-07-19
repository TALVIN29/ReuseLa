-- ReuseLa Database Setup
-- Run this in your Supabase SQL editor

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Books', 'Appliances', 'Furniture', 'Others')),
  condition TEXT NOT NULL CHECK (condition IN ('New', 'Good', 'Fair', 'Damaged')),
  postcode TEXT NOT NULL,
  city TEXT,
  image_url TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Requested', 'Taken')),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_postcode ON items(postcode);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON items
  FOR SELECT USING (true);

-- Create policy for authenticated users to insert their own items
CREATE POLICY "Allow authenticated users to insert items" ON items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for users to update their own items
CREATE POLICY "Allow users to update their own items" ON items
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create policy for users to delete their own items
CREATE POLICY "Allow users to delete their own items" ON items
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for item images
-- Note: This needs to be done manually in the Supabase dashboard
-- Go to Storage > Create bucket > Name: 'items' > Public bucket: true

-- Storage policies (run after creating the bucket)
-- Allow public read access to all files in the items bucket
CREATE POLICY IF NOT EXISTS "Allow public read access to items bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'items');

-- Allow anyone to upload files to the items bucket (for now)
-- In production, you might want to restrict this to authenticated users
CREATE POLICY IF NOT EXISTS "Allow uploads to items bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'items');

-- Allow users to update their own files
CREATE POLICY IF NOT EXISTS "Allow users to update files in items bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'items');

-- Allow users to delete their own files
CREATE POLICY IF NOT EXISTS "Allow users to delete files in items bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'items');

-- Insert sample data (optional)
INSERT INTO items (title, description, category, condition, postcode, city, contact_name, contact_phone, contact_email, user_id) VALUES
('Children''s Story Books', 'Collection of 20 children''s books in good condition. Perfect for ages 3-8.', 'Books', 'Good', '47300', 'Petaling Jaya', 'Sarah Lim', '012-3456789', 'sarah@example.com', 'sample-user-1'),
('Coffee Table', 'Wooden coffee table, slightly used but in good condition. Dimensions: 120cm x 60cm.', 'Furniture', 'Good', '47300', 'Petaling Jaya', 'Ahmad Hassan', '012-9876543', 'ahmad@example.com', 'sample-user-2'),
('Blender', 'Kitchen blender, works perfectly. Great for smoothies and food processing.', 'Appliances', 'Good', '47300', 'Petaling Jaya', 'Lisa Wong', '012-1112223', 'lisa@example.com', 'sample-user-3')
ON CONFLICT DO NOTHING; 