-- Fix for conflicting update_item_status functions
-- This script drops both versions and creates a single consistent version

-- Drop both versions of the function if they exist
DROP FUNCTION IF EXISTS public.update_item_status(item_id bigint, new_status text);
DROP FUNCTION IF EXISTS public.update_item_status(item_id text, new_status text);

-- Create a single version that accepts text parameters
CREATE OR REPLACE FUNCTION public.update_item_status(item_id text, new_status text)
RETURNS void AS $$
BEGIN
  UPDATE items 
  SET status = new_status::text
  WHERE id::text = item_id;
  
  -- Raise an exception if no rows were updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item with ID % not found', item_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_item_status(text, text) TO authenticated;

-- Test the function (optional - uncomment to test)
-- SELECT update_item_status('1', 'Available'); 