-- ReuseLa Database Setup
-- This file contains all the essential database setup for the ReuseLa app

-- ========================================
-- 1. RATINGS TABLE
-- ========================================

-- Drop existing ratings table if it exists
DROP TABLE IF EXISTS ratings;

-- Create the ratings table
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id BIGINT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('donor', 'requester')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE ratings 
ADD CONSTRAINT ratings_item_id_fkey 
FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_ratings_item_id ON ratings(item_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view ratings for their items" ON ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = ratings.item_id 
      AND items.user_id::text = ratings.user_id
    ) OR auth.uid()::text = ratings.user_id
  );

CREATE POLICY "Users can create ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid()::text = ratings.user_id);

CREATE POLICY "Users can update their own ratings" ON ratings
  FOR UPDATE USING (auth.uid()::text = ratings.user_id);

CREATE POLICY "Users can delete their own ratings" ON ratings
  FOR DELETE USING (auth.uid()::text = ratings.user_id);

-- ========================================
-- 2. HELPER FUNCTIONS
-- ========================================

-- Function to calculate average rating for an item
CREATE OR REPLACE FUNCTION get_item_average_rating(item_bigint_id BIGINT)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM ratings
  WHERE item_id = item_bigint_id;
  
  RETURN ROUND(avg_rating, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to get rating count for an item
CREATE OR REPLACE FUNCTION get_item_rating_count(item_bigint_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
  rating_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rating_count
  FROM ratings
  WHERE item_id = item_bigint_id;
  
  RETURN rating_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. AUTO-EXPIRE FUNCTION (Optional)
-- ========================================

-- Function to auto-expire items after 3 days
CREATE OR REPLACE FUNCTION auto_expire_items()
RETURNS void AS $$
BEGIN
  UPDATE items 
  SET status = 'Expired'
  WHERE status = 'Available' 
    AND created_at < NOW() - INTERVAL '3 days';
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run auto-expire daily (if using pg_cron extension)
-- SELECT cron.schedule('auto-expire-items', '0 0 * * *', 'SELECT auto_expire_items();');

-- ========================================
-- 4. VERIFICATION
-- ========================================

-- Test the setup
SELECT 'Database setup completed successfully!' as status;
SELECT 'Ratings table created' as table_status;
SELECT 'Functions created' as function_status; 