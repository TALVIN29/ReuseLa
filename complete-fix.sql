-- Complete fix for items table - add ALL missing columns
-- Run this in your Supabase SQL Editor

-- Add ALL missing columns that the app expects
ALTER TABLE items ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS postcode TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';
ALTER TABLE items ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Set default values for any NULL values
UPDATE items SET title = 'Untitled Item' WHERE title IS NULL;
UPDATE items SET description = 'No description provided' WHERE description IS NULL;
UPDATE items SET category = 'Others' WHERE category IS NULL;
UPDATE items SET condition = 'Good' WHERE condition IS NULL;
UPDATE items SET postcode = '00000' WHERE postcode IS NULL;
UPDATE items SET status = 'Available' WHERE status IS NULL;
UPDATE items SET contact_name = 'Anonymous' WHERE contact_name IS NULL;
UPDATE items SET contact_phone = 'N/A' WHERE contact_phone IS NULL;
UPDATE items SET contact_email = 'anonymous@example.com' WHERE contact_email IS NULL;
UPDATE items SET user_id = 'anonymous' WHERE user_id IS NULL; 

---

### 1. Enable RLS (if not already enabled)
```sql
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
```

---

### 2. Allow users to view their own requests
```sql
CREATE POLICY "Users can view their own requests" ON requests
  FOR SELECT USING (auth.uid() = requester_id);
```

---

### 3. Allow users to create requests
```sql
CREATE POLICY "Users can create requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
```

---

### 4. Allow users to update their own requests
```sql
CREATE POLICY "Users can update their own requests" ON requests
  FOR UPDATE USING (auth.uid() = requester_id);
```

---

### 5. Allow item owners to view requests for their items
```sql
CREATE POLICY "Item owners can view requests for their items" ON requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = requests.item_id 
      AND items.user_id = auth.uid()
    )
  );
```

---

### 6. Allow item owners to update requests for their items
```sql
CREATE POLICY "Item owners can update requests for their items" ON requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = requests.item_id 
      AND items.user_id = auth.uid()
    )
  );
```

---

**Instructions:**
- Copy and run each statement one at a time in the SQL editor.
- Wait for each to succeed before running the next.

If you get any errors, let me know the exact message and I’ll help you fix it! 