'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import { TrendingUp, Users, Package, Award, Globe, Calendar, MapPin, BarChart3 } from 'lucide-react'

interface PlatformStats {
  totalItems: number
  totalUsers: number
  completedItems: number
  totalRequests: number
  wasteDiverted: number
  activeItems: number
  topCategories: { category: string; count: number }[]
  topCities: { city: string; count: number }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState<PlatformStats>({
    totalItems: 0,
    totalUsers: 0,
    completedItems: 0,
    totalRequests: 0,
    wasteDiverted: 0,
    activeItems: 0,
    topCategories: [],
    topCities: []
  })
  const [loading, setLoading] = useState(true)

  // Fetch platform statistics
  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        setLoading(true)

        // Fetch all items
        const { data: items, error: itemsError } = await supabase
          .from('items')
          .select('*')

        if (itemsError) {
          console.error('Error fetching items:', itemsError)
          return
        }

        // Fetch all requests
        const { data: requests, error: requestsError } = await supabase
          .from('requests')
          .select('*')

        if (requestsError) {
          console.error('Error fetching requests:', requestsError)
          return
        }

        // Calculate statistics
        const totalItems = items?.length || 0
        const completedItems = items?.filter(item => item.status === 'Taken').length || 0
        const activeItems = items?.filter(item => item.status === 'Available').length || 0
        const totalRequests = requests?.length || 0
        
        // Calculate waste diverted (estimated 2.5kg per item)
        const wasteDiverted = Math.round(completedItems * 2.5)

        // Calculate top categories
        const categoryCounts = items?.reduce((acc: any, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1
          return acc
        }, {}) || {}

        const topCategories = Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4)

        // Calculate top cities
        const cityCounts = items?.reduce((acc: any, item) => {
          if (item.city) {
            acc[item.city] = (acc[item.city] || 0) + 1
          }
          return acc
        }, {}) || {}

        const topCities = Object.entries(cityCounts)
          .map(([city, count]) => ({ city, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        // Estimate total users (unique user_ids)
        const uniqueUsers = new Set(items?.map(item => item.user_id)).size

        setStats({
          totalItems,
          totalUsers: uniqueUsers,
          completedItems,
          totalRequests,
          wasteDiverted,
          activeItems,
          topCategories,
          topCities
        })
      } catch (error) {
        console.error('Error fetching platform stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlatformStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="p-4 pt-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="p-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-500">Total Items</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-500">Completed</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.completedItems}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span className="text-sm text-gray-500">Waste Diverted</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.wasteDiverted}kg</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-orange-600" />
              <span className="text-sm text-gray-500">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environmental Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.completedItems}</div>
              <div className="text-sm text-gray-600">Items Successfully Reused</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.wasteDiverted}kg</div>
              <div className="text-sm text-gray-600">Waste Diverted from Landfill</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalRequests}</div>
              <div className="text-sm text-gray-600">Total Requests Made</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top Categories */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
            </div>
            <div className="space-y-3">
              {stats.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                    <span className="text-gray-700">{category.category}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(category.count / Math.max(...stats.topCategories.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{category.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Cities */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Top Cities</h3>
            </div>
            <div className="space-y-3">
              {stats.topCities.map((city, index) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-gray-700">{city.city}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(city.count / Math.max(...stats.topCities.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{city.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Platform Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.activeItems}</div>
              <div className="text-sm text-gray-600">Available Items</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.totalItems > 0 ? Math.round((stats.completedItems / stats.totalItems) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalItems > 0 ? Math.round(stats.totalRequests / stats.totalItems * 10) / 10 : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Requests/Item</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalUsers > 0 ? Math.round(stats.totalItems / stats.totalUsers * 10) / 10 : 0}
              </div>
              <div className="text-sm text-gray-600">Items/User</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Join the movement! Every item reused is a step towards a sustainable future.
          </p>
          <button
            onClick={() => router.push('/post')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Post Your First Item
          </button>
        </div>
      </main>
    </div>
  )
} 