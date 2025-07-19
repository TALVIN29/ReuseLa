'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Item } from '@/lib/supabase'
import ItemCard from '@/components/ItemCard'
import Header from '@/components/Header'
import { Search, Filter, MapPin } from 'lucide-react'

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
  }
]

export default function HomePage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  const categories = ['all', 'Books', 'Appliances', 'Furniture', 'Others']

  // Fetch items from database
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('status', 'Available')
          .order('created_at', { ascending: false })
          .limit(8) // Show only first 8 items on home page

        if (error) {
          console.error('Error fetching items:', error)
          return
        }

        setItems(data || [])
        setFilteredItems(data || [])
      } catch (error) {
        console.error('Error fetching items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()

    // Set up real-time subscription
    const channel = supabase
      .channel('home_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Item
            if (newItem.status === 'Available') {
              setItems(prev => [newItem, ...prev.slice(0, 7)]) // Keep only 8 items
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as Item
            const oldItem = payload.old as Item
            
            if (updatedItem.status === 'Available' && oldItem.status !== 'Available') {
              // Item became available again
              setItems(prev => [updatedItem, ...prev.filter(item => item.id !== updatedItem.id).slice(0, 7)])
            } else if (updatedItem.status !== 'Available' && oldItem.status === 'Available') {
              // Item is no longer available
              setItems(prev => prev.filter(item => item.id !== updatedItem.id))
            } else if (updatedItem.status === 'Available') {
              // Item was updated but still available
              setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as Item
            setItems(prev => prev.filter(item => item.id !== deletedItem.id))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Home page - Real-time subscription failed!')
        }
      })

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
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
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="p-4 pt-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 rounded-2xl text-white shadow-lg mb-6">
          <h2 className="text-3xl font-bold mb-2 drop-shadow-sm">Welcome to ReuseLa!</h2>
          <p className="text-lg font-medium">Connecting communities for a greener future.</p>
          <p className="text-sm mt-4 opacity-95 font-medium">Reusing for a Sustainable Malaysia</p>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="flex justify-around items-center text-center">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-primary-600">1,200+</span>
              <span className="text-gray-600 text-sm">items reused</span>
            </div>
            <div className="w-px h-12 bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-secondary-600">5,000+kg</span>
              <span className="text-gray-600 text-sm">weight diverted from landfill</span>
            </div>
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

        {/* Items Grid */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Available Items</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No items found matching your criteria.</p>
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
        </div>
      </main>
    </div>
  )
} 