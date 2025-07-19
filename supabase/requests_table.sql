-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  requester_email TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  message TEXT NOT NULL,
  preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('email', 'phone')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_requests_item_id ON requests(item_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester_id ON requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);

-- Enable Row Level Security
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view requests they made
CREATE POLICY "Users can view their own requests" ON requests
  FOR SELECT USING (auth.uid() = requester_id);

-- Users can create requests
CREATE POLICY "Users can create requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Users can update their own requests
CREATE POLICY "Users can update their own requests" ON requests
  FOR UPDATE USING (auth.uid() = requester_id);

-- Item owners can view requests for their items
CREATE POLICY "Item owners can view requests for their items" ON requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = requests.item_id 
      AND items.user_id = auth.uid()
    )
  );

-- Item owners can update requests for their items
CREATE POLICY "Item owners can update requests for their items" ON requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = requests.item_id 
      AND items.user_id = auth.uid()
    )
  ); 