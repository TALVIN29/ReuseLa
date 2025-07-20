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

      // If approving a request, check if there are other approved requests for the same item
      if (newStatus === 'Approved') {
        const { data: existingApprovedRequests, error: checkError } = await supabase
          .from('requests')
          .select('id')
          .eq('item_id', requestData.item_id)
          .eq('status', 'Approved')
          .neq('id', requestId) // Exclude the current request

        if (checkError) {
          console.error('Error checking existing approved requests:', checkError)
          alert('Error updating request status')
          return
        }

        if (existingApprovedRequests && existingApprovedRequests.length > 0) {
          alert('This item already has an approved request. Please complete or reject the existing approved request first.')
          return
        }

        // Reject all other pending requests for this item
        const { error: rejectError } = await supabase
          .from('requests')
          .update({ status: 'Rejected' })
          .eq('item_id', requestData.item_id)
          .eq('status', 'Pending')
          .neq('id', requestId)

        if (rejectError) {
          console.error('Error rejecting other pending requests:', rejectError)
          // Continue anyway, don't fail the approval
        } else {
          console.log('Rejected other pending requests for this item')
        }
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
          newItemStatus = 'Requested'
        } else if (newStatus === 'Completed') {
          // When marking as completed, always set item to Taken
          newItemStatus = 'Taken'
        } else if (newStatus === 'Rejected') {
          // Check if there are any other approved requests for this item
          const { data: otherApprovedRequests, error: checkError } = await supabase
            .from('requests')
            .select('id')
            .eq('item_id', requestData.item_id)
            .eq('status', 'Approved')

          if (!checkError && otherApprovedRequests && otherApprovedRequests.length > 0) {
            // If there are other approved requests, keep item as Requested
            newItemStatus = 'Requested'
          } else {
            // If no other approved requests, set item back to Available
            newItemStatus = 'Available'
          }
        }

        // Update the item status using the database function
        console.log(`Updating item ${requestData.item_id} status from current to: ${newItemStatus}`)
        const { data: updateResult, error: itemUpdateError } = await supabase
          .rpc('update_item_status', {
            item_id: requestData.item_id,
            new_status: newItemStatus
          })

        if (itemUpdateError) {
          console.error('Error updating item status:', itemUpdateError)
          alert(`Request updated but failed to update item status: ${itemUpdateError.message}`)
          return
        } else {
          console.log(`Successfully updated item status to: ${newItemStatus}. Result:`, updateResult)
        }
      }

      // Send email notification to requester if request is approved or rejected
      if (newStatus === 'Approved' || newStatus === 'Rejected') {
        console.log(`=== REQUEST ${newStatus.toUpperCase()} - SENDING EMAIL TO REQUESTER ===`)
        try {
          // Get the full request data including requester email and item details
          const { data: fullRequestData, error: fetchFullError } = await supabase
            .from('requests')
            .select(`
              requester_email,
              requester_name,
              message,
              items (
                title,
                contact_name,
                contact_email,
                contact_phone,
                postcode,
                city
              )
            `)
            .eq('id', requestId)
            .single()

          console.log('Full request data:', fullRequestData)
          console.log('Fetch error:', fetchFullError)

          if (!fetchFullError && fullRequestData) {
            console.log(`Sending ${newStatus.toLowerCase()} email to requester...`)
            
            if (newStatus === 'Approved') {
              await sendEmailToRequester({
                requesterEmail: fullRequestData.requester_email,
                requesterName: fullRequestData.requester_name,
                itemTitle: fullRequestData.items?.[0]?.title || 'Unknown Item',
                ownerName: fullRequestData.items?.[0]?.contact_name || 'Item Owner',
                ownerEmail: fullRequestData.items?.[0]?.contact_email || '',
                ownerPhone: fullRequestData.items?.[0]?.contact_phone || '',
                location: `${fullRequestData.items?.[0]?.city || ''} ${fullRequestData.items?.[0]?.postcode || ''}`.trim(),
                originalMessage: fullRequestData.message,
                status: 'approved'
              })
            } else if (newStatus === 'Rejected') {
              await sendEmailToRequester({
                requesterEmail: fullRequestData.requester_email,
                requesterName: fullRequestData.requester_name,
                itemTitle: fullRequestData.items?.[0]?.title || 'Unknown Item',
                ownerName: fullRequestData.items?.[0]?.contact_name || 'Item Owner',
                ownerEmail: fullRequestData.items?.[0]?.contact_email || '',
                ownerPhone: fullRequestData.items?.[0]?.contact_phone || '',
                location: `${fullRequestData.items?.[0]?.city || ''} ${fullRequestData.items?.[0]?.postcode || ''}`.trim(),
                originalMessage: fullRequestData.message,
                status: 'rejected'
              })
            }
            
            console.log(`${newStatus} email sent successfully to requester`)
          } else {
            console.error('Failed to fetch full request data:', fetchFullError)
          }
        } catch (emailError) {
          console.error(`Error sending ${newStatus.toLowerCase()} email to requester:`, emailError)
          // Don't fail the request if email fails, just log it
        }
      }

      // Refresh the requests list
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ))

      // Show a message to refresh other pages
      console.log('Request status updated - user should refresh browse/home pages')
      alert(`Request ${newStatus.toLowerCase()} successfully. Please refresh the browse/home pages to see updated item status.`)
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Error updating request status')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen">
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
    <div className="min-h-screen">
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

// Function to send approval/rejection email to requester
async function sendEmailToRequester({
  requesterEmail,
  requesterName,
  itemTitle,
  ownerName,
  ownerEmail,
  ownerPhone,
  location,
  originalMessage,
  status
}: {
  requesterEmail: string
  requesterName: string
  itemTitle: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  location: string
  originalMessage: string
  status: 'approved' | 'rejected'
}) {
  console.log('=== STARTING EMAIL TO REQUESTER ===')
  console.log('Requester Email:', requesterEmail)
  console.log('Requester Name:', requesterName)
  console.log('Item Title:', itemTitle)
  console.log('Status:', status)
  
  let emailContent = ''
  let subject = ''
  
  if (status === 'approved') {
    subject = 'Your request has been approved!'
    emailContent = `
      Hi ${requesterName},

      Great news! Your request for "${itemTitle}" has been approved! 🎉

      Item Details:
      - Item: ${itemTitle}
      - Owner: ${ownerName}
      - Location: ${location || 'Contact owner for details'}

      Contact Information:
      ${ownerEmail ? `- Email: ${ownerEmail}` : ''}
      ${ownerPhone ? `- Phone: ${ownerPhone}` : ''}

      Your Original Message:
      "${originalMessage}"

      Next Steps:
      1. Contact the item owner using the information above
      2. Arrange a time and place to collect the item
      3. Meet up and collect your item
      4. The owner will mark the request as "Completed" once you've collected it

      Thank you for using ReuseLa to give items a second life! ♻️

      Best regards,
      The ReuseLa Team
    `
  } else if (status === 'rejected') {
    subject = 'Update on your request'
    emailContent = `
      Hi ${requesterName},

      We wanted to let you know that your request for "${itemTitle}" has been declined by the item owner.

      Item Details:
      - Item: ${itemTitle}
      - Owner: ${ownerName}

      Your Original Message:
      "${originalMessage}"

      Don't worry! There are plenty of other items available on ReuseLa. 
      Feel free to browse our platform for other items that might interest you.

      Thank you for using ReuseLa to give items a second life! ♻️

      Best regards,
      The ReuseLa Team
    `
  }

  // Log the email for debugging
  console.log('=== EMAIL TO REQUESTER ===')
  console.log('To:', requesterEmail)
  console.log('Subject:', subject)
  console.log('Content:', emailContent)
  console.log('==========================')

  // Send email using API route
  try {
    console.log('Calling /api/send-email...')
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: requesterEmail,
        subject: subject,
        text: emailContent,
      }),
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API response error:', errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('API response:', result)

    if (result.success) {
      console.log(`${status} email sent successfully to requester`)
      return { success: true, data: result }
    } else {
      console.error('API returned error:', result.error)
      throw new Error(result.error || 'Unknown API error')
    }
  } catch (emailError) {
    console.error(`Failed to send ${status} email to requester:`, emailError)
    throw emailError
  }
} 