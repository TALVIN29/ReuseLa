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
  const [currentSlide, setCurrentSlide] = useState(0)

  const categories = ['all', 'Books', 'Appliances', 'Furniture', 'Others']

  // Slideshow data
  const slides = [
    {
      title: "Welcome to ReuseLa!",
      subtitle: "Connecting communities for a greener future.",
      description: "Reusing for a Sustainable Malaysia",
      gradient: "from-primary-600 via-secondary-600 to-accent-600",
      icon: "🌱"
    },
    {
      title: "Give Items a Second Life",
      subtitle: "Donate what you don't need, find what you do.",
      description: "Join thousands of users reducing waste",
      gradient: "from-success-600 via-primary-600 to-secondary-600",
      icon: "♻️"
    },
    {
      title: "Build Sustainable Communities",
      subtitle: "Connect with neighbors, share resources.",
      description: "Together we can make a difference",
      gradient: "from-accent-600 via-success-600 to-primary-600",
      icon: "🤝"
    },
    {
      title: "Track Your Impact",
      subtitle: "See how much waste you've diverted from landfills.",
      description: "Every item counts towards a greener future",
      gradient: "from-secondary-600 via-accent-600 to-success-600",
      icon: "📊"
    }
  ]

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [slides.length])

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
            
            console.log(`Home page received UPDATE: Item ${updatedItem.id} status changed from ${oldItem.status} to ${updatedItem.status}`)
            
            if (updatedItem.status === 'Available' && oldItem.status !== 'Available') {
              // Item became available again
              console.log(`Adding item ${updatedItem.id} back to home list`)
              setItems(prev => [updatedItem, ...prev.filter(item => item.id !== updatedItem.id).slice(0, 7)])
            } else if (updatedItem.status !== 'Available' && oldItem.status === 'Available') {
              // Item is no longer available
              console.log(`Removing item ${updatedItem.id} from home list (status: ${updatedItem.status})`)
              setItems(prev => prev.filter(item => item.id !== updatedItem.id))
            } else if (updatedItem.status === 'Available') {
              // Item was updated but still available
              console.log(`Updating item ${updatedItem.id} in home list`)
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

  // Add multiple refresh triggers for better user experience
  useEffect(() => {
    const handleFocus = () => {
      console.log('Home page focused - refreshing items...')
      // Re-fetch items when user returns to the page
      const fetchItems = async () => {
        try {
          const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('status', 'Available')
            .order('created_at', { ascending: false })
            .limit(8)

          if (error) {
            console.error('Error fetching items:', error)
            return
          }

          setItems(data || [])
          setFilteredItems(data || [])
        } catch (error) {
          console.error('Error fetching items:', error)
        }
      }
      fetchItems()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Home page became visible - refreshing items...')
        // Re-fetch items when page becomes visible
        const fetchItems = async () => {
          try {
            const { data, error } = await supabase
              .from('items')
              .select('*')
              .eq('status', 'Available')
              .order('created_at', { ascending: false })
              .limit(8)

            if (error) {
              console.error('Error fetching items:', error)
              return
            }

            setItems(data || [])
            setFilteredItems(data || [])
          } catch (error) {
            console.error('Error fetching items:', error)
          }
        }
        fetchItems()
      }
    }

    // Listen for focus and visibility changes
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

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
        {/* Welcome Banner Slideshow */}
        <div className={`bg-gradient-to-br ${slides[currentSlide].gradient} p-8 rounded-2xl text-white shadow-xl mb-6 animate-fade-in-up animate-gradient-shift relative overflow-hidden min-h-[300px]`}>
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 left-4 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-8 right-8 w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-8 left-8 w-2 h-2 bg-white/25 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute bottom-4 right-4 w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative z-10">
            {/* Slide content */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-3 drop-shadow-lg text-white animate-fade-in-down">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-xl font-semibold mb-2 text-white animate-fade-in-up">
                  {slides[currentSlide].subtitle}
                </p>
                <p className="text-base font-medium text-white/90 animate-fade-in-up">
                  {slides[currentSlide].description}
                </p>
              </div>
              
              {/* Slide icon */}
              <div className="text-8xl animate-bounce animate-glow ml-4">
                {slides[currentSlide].icon}
              </div>
            </div>
            
            {/* Bar slider - Hidden by default, show on hover */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex space-x-1 bg-white/20 backdrop-blur-sm rounded-full p-1">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide 
                        ? 'bg-white/90 w-8 h-2' 
                        : 'bg-white/40 w-2 h-2 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Center bottom navigation indicators - Hidden by default, show on hover */}
            <div className="absolute -bottom-36 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-300">
              <div className="flex space-x-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 ${
                      index === currentSlide 
                        ? 'scale-110' 
                        : 'hover:scale-105'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}></div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-pulse animate-float" style={{animationDelay: '0.2s'}}></div>
              <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/50 rounded-full animate-pulse animate-float" style={{animationDelay: '0.8s'}}></div>
              <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/70 rounded-full animate-pulse animate-float" style={{animationDelay: '1.2s'}}></div>
              <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse animate-float" style={{animationDelay: '1.6s'}}></div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl shadow-lg mb-6 animate-fade-in-up border-l-4 border-primary-600 dark:border-primary-400 transition-colors duration-300" style={{animationDelay: '0.1s'}}>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 rounded-full mr-3 shadow-sm"></div>
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 p-6 rounded-xl border-2 border-primary-400 dark:border-primary-600 animate-pulse-slow shadow-md transition-colors duration-300">
              <div className="text-center">
                <span className="text-5xl font-bold text-primary-800 dark:text-primary-200">1,200+</span>
                <div className="text-primary-900 dark:text-primary-100 font-semibold mt-2">Items Reused</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900 dark:to-secondary-800 p-6 rounded-xl border-2 border-secondary-400 dark:border-secondary-600 animate-pulse-slow shadow-md transition-colors duration-300" style={{animationDelay: '0.5s'}}>
              <div className="text-center">
                <span className="text-5xl font-bold text-secondary-800 dark:text-secondary-200">5,000+kg</span>
                <div className="text-secondary-900 dark:text-secondary-100 font-semibold mt-2">Waste Diverted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md mb-6 animate-fade-in-up transition-colors duration-300" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4 z-10" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {showFilters && (
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium transition-colors duration-300"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="text"
                    placeholder="e.g., Subang, Penang"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 font-medium transition-colors duration-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items Grid */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Available Items</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <p>No items found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
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