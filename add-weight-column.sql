-- Add weight column to items table
-- This script adds a weight field to track the actual weight of items

-- Add weight column to items table
ALTER TABLE items 
ADD COLUMN weight DECIMAL(6,2) CHECK (weight > 0);

-- Add comment to explain the weight field
COMMENT ON COLUMN items.weight IS 'Weight of the item in kilograms (kg)';

-- Create index for weight-based queries
CREATE INDEX idx_items_weight ON items(weight);

-- Update the PlatformStats interface to use actual weight instead of estimates
-- This will be handled in the TypeScript code 