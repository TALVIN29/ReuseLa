'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import { User, Mail, LogOut, Shield, Heart, TrendingUp, Award } from 'lucide-react'

interface UserStats {
  itemsPosted: number
  itemsRequested: number
  itemsCompleted: number
  impactScore: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [userStats, setUserStats] = useState<UserStats>({
    itemsPosted: 0,
    itemsRequested: 0,
    itemsCompleted: 0,
    impactScore: 0
  })
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Fetch user statistics
  useEffect(() => {
    if (!user) return

    const fetchUserStats = async () => {
      try {
        setLoading(true)
        
        // Fetch items posted by user
        const { data: postedItems, error: postedError } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', user.id)

        if (postedError) {
          console.error('Error fetching posted items:', postedError)
        }

        // Fetch requests made by user
        const { data: requestedItems, error: requestedError } = await supabase
          .from('requests')
          .select('*')
          .eq('requester_id', user.id)

        if (requestedError) {
          console.error('Error fetching requested items:', requestedError)
        }

        // Calculate statistics
        const itemsPosted = postedItems?.length || 0
        const itemsRequested = requestedItems?.length || 0
        const itemsCompleted = postedItems?.filter(item => item.status === 'Taken').length || 0
        
        // Calculate impact score (items completed * 10 points each)
        const impactScore = itemsCompleted * 10

        setUserStats({
          itemsPosted,
          itemsRequested,
          itemsCompleted,
          impactScore
        })
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="p-4 pt-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="p-4 pt-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.user_metadata?.full_name || 'User'}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Mail className="w-4 h-4 mr-3 text-primary-600" />
              <span>{user.email}</span>
            </div>
            {user.user_metadata?.phone && (
              <div className="flex items-center text-gray-600">
                <span className="mr-3">📱</span>
                <span>{user.user_metadata.phone}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <Shield className="w-4 h-4 mr-3 text-green-600" />
              <span>Account verified</span>
            </div>
          </div>
        </div>

        {/* Impact Score */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Impact Score</h3>
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{userStats.impactScore}</div>
            <div className="text-sm text-gray-600">Points earned from completed donations</div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userStats.itemsPosted}</div>
              <div className="text-sm text-gray-600">Items Posted</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userStats.itemsRequested}</div>
              <div className="text-sm text-gray-600">Items Requested</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userStats.itemsCompleted}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {userStats.itemsCompleted > 0 ? Math.round(userStats.itemsCompleted * 2.5) : 0}kg
              </div>
              <div className="text-sm text-gray-600">Waste Diverted</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/post')}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
          >
            <Heart className="w-5 h-5 mr-2" />
            Post New Item
          </button>
          
          <button
            onClick={() => router.push('/requests')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            View My Requests
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>

        {/* Account Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  )
} 