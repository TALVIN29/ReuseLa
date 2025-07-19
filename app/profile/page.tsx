'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import { User, Mail, LogOut, Shield, Heart } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [userItems, setUserItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

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

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Items Posted</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Items Requested</div>
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