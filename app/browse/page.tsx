'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Item } from '@/lib/supabase'
import ItemCard from '@/components/ItemCard'
import Header from '@/components/Header'
import { Search, Filter, MapPin, RefreshCw } from 'lucide-react'

// Mock data for development
const mockItems: Item[] = [
  {
    id: '1',
    title: 'Children\'s Story Books',
    description: 'A collection of classic children\'s story books in good condition.',
    condition: 'Good',
    postcode: '47300',
    city: 'Subang Jaya',
    category: 'Books',
    image_url: '',
    user_id: 'user1',
    status: 'Available',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Working Refrigerator',
    description: 'Used refrigerator, still in good working condition. Minor dents.',
    condition: 'Fair',
    postcode: '50000',
    city: 'Kuala Lumpur',
    category: 'Appliances',
    image_url: '',
    user_id: 'user2',
    status: 'Available',
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    title: 'Study Desk with Chair',
    description: 'Simple wooden study desk with a comfortable chair. Ideal for students.',
    condition: 'Good',
    postcode: '46050',
    city: 'Petaling Jaya',
    category: 'Furniture',
    image_url: '',
    user_id: 'user3',
    status: 'Available',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    title: 'Assorted Kitchen Utensils',
    description: 'Various kitchen utensils, including spatulas, ladles, and knives.',
    condition: 'Good',
    postcode: '47810',
    city: 'Petaling Jaya',
    category: 'Others',
    image_url: '',
    user_id: 'user4',
    status: 'Available',
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z'
  },
  {
    id: '5',
    title: 'Old Textbooks (SPM)',
    description: 'SPM textbooks for various subjects, slightly worn but usable.',
    condition: 'Fair',
    postcode: '10000',
    city: 'Penang',
    category: 'Books',
    image_url: '',
    user_id: 'user5',
    status: 'Available',
    created_at: '2024-01-11T11:45:00Z',
    updated_at: '2024-01-11T11:45:00Z'
  },
  {
    id: '6',
    title: 'Microwave Oven',
    description: 'Compact microwave oven, fully functional.',
    condition: 'Good',
    postcode: '13700',
    city: 'Butterworth',
    category: 'Appliances',
    image_url: '',
    user_id: 'user6',
    status: 'Available',
    created_at: '2024-01-10T16:20:00Z',
    updated_at: '2024-01-10T16:20:00Z'
  }
]

export default function BrowsePage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const categories = ['all', 'Books', 'Appliances', 'Furniture', 'Others']

  // Fetch items from database
  const fetchItems = async () => {
    try {
      setLoading(true)
      console.log('Fetching items with status "Available"...')
      
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'Available')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching items:', error)
        return
      }

      console.log('Fetched items:', data)
      console.log('Items with status "Available":', data?.filter(item => item.status === 'Available'))
      console.log('Items with other statuses:', data?.filter(item => item.status !== 'Available'))

      setItems(data || [])
      setFilteredItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchItems()
    setRefreshing(false)
  }

  // Enhanced refresh function that also logs the current items
  const enhancedRefresh = async () => {
    console.log('Enhanced refresh triggered...')
    setRefreshing(true)
    
    // First, let's check the actual status of item 7 in the database
    console.log('Checking item 7 status in database...')
    const { data: item7Data, error: item7Error } = await supabase
      .from('items')
      .select('*')
      .eq('id', '7')
      .single()
    
    if (item7Error) {
      console.error('Error fetching item 7:', item7Error)
    } else {
      console.log('Item 7 current status in database:', item7Data)
    }
    
    await fetchItems()
    console.log('Current items after refresh:', items)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchItems()

    console.log('Setting up browse page real-time subscription...')
    // Set up real-time subscription with comprehensive event listening
    const channel = supabase
      .channel('browse_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        (payload) => {
          console.log('Browse page received real-time event:', payload.eventType, payload)
          
          // Test: Log all events to see if real-time is working at all
          console.log('Full payload:', JSON.stringify(payload, null, 2))
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Item
            console.log('INSERT event for item:', newItem)
            if (newItem.status === 'Available') {
              setItems(prev => [newItem, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as Item
            const oldItem = payload.old as Item
            
            console.log(`Browse page received UPDATE: Item ${updatedItem.id} status changed from ${oldItem.status} to ${updatedItem.status}`)
            
            if (updatedItem.status === 'Available' && oldItem.status !== 'Available') {
              // Item became available again
              console.log(`Adding item ${updatedItem.id} back to browse list`)
              setItems(prev => [updatedItem, ...prev.filter(item => item.id !== updatedItem.id)])
            } else if (updatedItem.status !== 'Available' && oldItem.status === 'Available') {
              // Item is no longer available
              console.log(`Removing item ${updatedItem.id} from browse list (status: ${updatedItem.status})`)
              setItems(prev => prev.filter(item => item.id !== updatedItem.id))
            } else if (updatedItem.status === 'Available') {
              // Item was updated but still available
              console.log(`Updating item ${updatedItem.id} in browse list`)
              setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as Item
            console.log('DELETE event for item:', deletedItem)
            setItems(prev => prev.filter(item => item.id !== deletedItem.id))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Browse page - Real-time subscription active!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Browse page - Real-time subscription failed!')
        } else {
          console.log(`Browse page - Subscription status: ${status}`)
        }
      })

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up browse page real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [])

  // Add multiple refresh triggers for better user experience
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused - refreshing items...')
      fetchItems()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible - refreshing items...')
        fetchItems()
      }
    }

    // Listen for focus and visibility changes
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Also refresh when the component mounts
    console.log('Browse page mounted - initial refresh')
    fetchItems()

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Filter items based on search, category, and location
  useEffect(() => {
    let filtered = items

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (selectedLocation) {
      filtered = filtered.filter(item =>
        item.city?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        item.postcode?.includes(selectedLocation)
      )
    }

    setFilteredItems(filtered)
  }, [items, searchTerm, selectedCategory, selectedLocation])

  const handleViewDetails = (item: Item) => {
    // Navigate to item details page
    router.push(`/item/${item.id}`)
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="p-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Browse Available Items</h1>
          <div className="flex space-x-2">
            <button
              onClick={enhancedRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {showFilters && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 font-medium"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="text-gray-900 bg-white">
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
                  <input
                    type="text"
                    placeholder="e.g., Subang, Penang"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Loading items...</h3>
              <p className="text-gray-600">Please wait while we fetch the latest items.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <div className="bg-white p-8 rounded-2xl shadow-md">
                  <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items found</h3>
                  <p>Try adjusting your search criteria or filters.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
} 