'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import { Package, Clock, CheckCircle, XCircle, User, Mail, MessageSquare } from 'lucide-react'

interface Request {
  id: string
  item_id: string
  requester_id: string
  requester_email: string
  requester_name: string
  message: string
  preferred_contact: string
  status: string
  created_at: string
  item?: {
    title: string
    image_url?: string
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending':
      return <Clock className="w-5 h-5 text-yellow-500" />
    case 'Approved':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'Completed':
      return <CheckCircle className="w-5 h-5 text-blue-500" />
    case 'Rejected':
      return <XCircle className="w-5 h-5 text-red-500" />
    default:
      return <Clock className="w-5 h-5 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Approved':
      return 'bg-green-100 text-green-800'
    case 'Completed':
      return 'bg-blue-100 text-blue-800'
    case 'Rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function RequestsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'posted' | 'requested'>('posted')
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Fetch requests based on active tab
  useEffect(() => {
    if (!user) return

    const fetchRequests = async () => {
      setLoading(true)
      try {
        if (activeTab === 'requested') {
          // Fetch requests made by the user
          const { data, error } = await supabase
            .from('requests')
            .select(`
              *,
              item:items(title, image_url)
            `)
            .eq('requester_id', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching requests:', error)
            return
          }

          setRequests(data || [])
        } else {
          // Fetch requests for items posted by the user
          const { data, error } = await supabase
            .from('requests')
            .select(`
              *,
              item:items(title, image_url)
            `)
            .eq('items.user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching posted requests:', error)
            return
          }

          setRequests(data || [])
        }
      } catch (error) {
        console.error('Error fetching requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [user, activeTab])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      // First, get the request to find the item_id
      const { data: requestData, error: fetchError } = await supabase
        .from('requests')
        .select('item_id')
        .eq('id', requestId)
        .single()

      if (fetchError) {
        console.error('Error fetching request:', fetchError)
        alert('Error updating request status')
        return
      }

      // Update the request status
      const { error: updateError } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (updateError) {
        console.error('Error updating request:', updateError)
        alert('Error updating request status')
        return
      }

      // Update item status based on request status
      if (requestData.item_id) {
        let newItemStatus = 'Available' // Default

        if (newStatus === 'Approved') {
          newItemStatus = 'Reserved'
        } else if (newStatus === 'Completed') {
          // When marking as completed, always set item to Collected
          newItemStatus = 'Collected'
        } else if (newStatus === 'Rejected') {
          // Check if there are any other approved or completed requests for this item
          const { data: otherActiveRequests } = await supabase
            .from('requests')
            .select('id, status')
            .eq('item_id', requestData.item_id)
            .in('status', ['Approved', 'Completed'])
            .neq('id', requestId)

          // If no other approved/completed requests, set item back to Available
          if (!otherActiveRequests || otherActiveRequests.length === 0) {
            newItemStatus = 'Available'
          } else {
            // If there are other approved requests, keep as Reserved
            // If there are completed requests, set as Collected
            const hasCompleted = otherActiveRequests.some(req => req.status === 'Completed')
            newItemStatus = hasCompleted ? 'Collected' : 'Reserved'
          }
        }

        // Update the item status
        const { error: itemUpdateError } = await supabase
          .from('items')
          .update({ status: newItemStatus })
          .eq('id', requestData.item_id)

        if (itemUpdateError) {
          console.error('Error updating item status:', itemUpdateError)
          alert(`Request updated but failed to update item status: ${itemUpdateError.message}`)
          return
        }
      }

      // Refresh the requests list
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ))

      alert(`Request ${newStatus.toLowerCase()} successfully`)
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Error updating request status')
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Requests & Posted Items</h1>

        {/* Tab Navigation */}
        <div className="bg-white p-1 rounded-2xl shadow-md mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posted')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                activeTab === 'posted'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Posted Items
            </button>
            <button
              onClick={() => setActiveTab('requested')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                activeTab === 'requested'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Requests
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        )}

        {/* Content */}
        {!loading && requests.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === 'posted' ? 'No Requests for Your Items' : 'No Requests Made'}
              </h3>
              <p className="mb-4">
                {activeTab === 'posted' 
                  ? "No one has requested your items yet." 
                  : "You haven't made any requests yet."
                }
              </p>
              {activeTab === 'posted' && (
                <button 
                  onClick={() => router.push('/post')}
                  className="bg-primary-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Post Your First Item
                </button>
              )}
              {activeTab === 'requested' && (
                <button 
                  onClick={() => router.push('/browse')}
                  className="bg-primary-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Browse Items
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="bg-white p-4 rounded-2xl shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {request.item?.title || 'Unknown Item'}
                      </h3>
                      <p className="text-sm text-gray-600">{formatDate(request.created_at)}</p>
                      
                      {/* Show requester info for posted items */}
                      {activeTab === 'posted' && (
                        <div className="text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span>{request.requester_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            <span>{request.requester_email}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                {/* Message preview */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    <span>Message:</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{request.message}</p>
                </div>
                
                {/* Action buttons based on status */}
                {request.status === 'Pending' && activeTab === 'posted' && (
                  <div className="flex space-x-2 mt-3">
                    <button 
                      onClick={() => handleStatusUpdate(request.id, 'Approved')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                    >
                      Approve Request
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
                
                {request.status === 'Approved' && activeTab === 'posted' && (
                  <div className="mt-3">
                    <button 
                      onClick={() => handleStatusUpdate(request.id, 'Completed')}
                      className="w-full bg-primary-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Mark as Collected
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 