import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Item {
  id: string | number // Can be UUID (string) or bigint (number)
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
  status: 'Available' | 'Requested' | 'Taken' | 'Expired'
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
  item_id: string | number // Can be UUID (string) or bigint (number)
  requester_id: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed'
  created_at: string
  updated_at: string
}

export interface Rating {
  id: string
  item_id: string | number // Can be UUID (string) or bigint (number)
  user_id: string
  rating: number
  comment?: string
  transaction_type: 'donor' | 'requester'
  created_at: string
}

export interface PlatformStats {
  totalItems: number
  totalUsers: number
  completedItems: number
  totalRequests: number
  wasteDiverted: number
  activeItems: number
  topCategories: { category: string; count: number }[]
  topCities: { city: string; count: number }[]
}

export interface UserStats {
  itemsPosted: number
  itemsRequested: number
  itemsCompleted: number
  impactScore: number
} 