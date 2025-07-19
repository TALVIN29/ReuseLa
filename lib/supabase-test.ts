import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('items')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('Supabase connection successful!')
    return true
  } catch (error) {
    console.error('Supabase test failed:', error)
    return false
  }
} 