import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Item {
  id: string
  title: string
  description: string
  category: 'Books' | 'Appliances' | 'Furniture' | 'Others'
  condition: 'New' | 'Good' | 'Fair' | 'Damaged'
  postcode: string
  city: string
  image_url: string
  contact_name: string
  contact_phone: string
  contact_email: string
  user_id: string
  status: 'Available' | 'Requested' | 'Taken'
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email?: string
  phone?: string
  created_at: string
}

export interface Request {
  id: string
  item_id: string
  requester_id: string
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed'
  created_at: string
  updated_at: string
} 