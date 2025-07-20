'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Item } from '@/lib/supabase'
import Header from '@/components/Header'
import { ArrowLeft, MapPin, Tag, CheckCircle, MessageCircle, Phone } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import RequestModal from '@/components/RequestModal'

// Mock data for development
const mockItems: Item[] = [
  {
    id: '1',
    title: 'Children\'s Story Books',
    description: 'A collection of classic children\'s story books in good condition. Perfect for young readers and families. Includes popular titles like "The Very Hungry Caterpillar", "Where the Wild Things Are", and "Goodnight Moon". All books are gently used but still in excellent reading condition.',
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
    description: 'Used refrigerator, still in good working condition. Minor dents on the side but fully functional. Perfect for students or small families. Energy efficient and comes with adjustable shelves. Pickup only due to size.',
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
    description: 'Simple wooden study desk with a comfortable chair. Ideal for students. The desk has a spacious surface area and includes a small drawer for storage. The chair is ergonomic and adjustable. Both pieces are in good condition.',
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
    description: 'Various kitchen utensils, including spatulas, ladles, and knives. All items are clean and in good working condition. Perfect for someone setting up their first kitchen or looking to expand their cooking tools.',
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

export default function ItemDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) {
          console.error('Error fetching item:', error)
          setItem(null)
          return
        }

        setItem(data)
      } catch (error) {
        console.error('Error fetching item:', error)
        setItem(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchItem()
    }
  }, [params.id])

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New': return 'bg-green-100 text-green-800'
      case 'Good': return 'bg-blue-100 text-blue-800'
      case 'Fair': return 'bg-yellow-100 text-yellow-800'
      case 'Damaged': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRequestItem = () => {
    if (!user) {
      alert('Please login or register to request this item.')
      router.push('/login')
      return
    }
    
    setShowRequestModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="p-4 pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="p-4 pt-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h2>
            <p className="text-gray-600 mb-6">The item you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.back()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="p-4 pt-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Browse
        </button>

        {/* Item Details */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Image Section */}
          <div className="relative h-64 w-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📦</div>
                <div className="text-lg font-medium text-gray-600">{item.category}</div>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(item.condition)}`}>
                {item.condition}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
            <p className="text-gray-700 mb-6 leading-relaxed">{item.description}</p>

            {/* Item Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <Tag className="w-5 h-5 mr-3 text-primary-600" />
                <span className="font-medium">Category:</span>
                <span className="ml-2">{item.category}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
                <span className="font-medium">Condition:</span>
                <span className="ml-2">{item.condition}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-red-600" />
                <span className="font-medium">Location:</span>
                <span className="ml-2">{item.postcode} {item.city}</span>
              </div>
            </div>

            {/* Contact Information */}
            {(item.contact_name || item.contact_phone || item.contact_email) && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {item.contact_name && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{item.contact_name}</span>
                    </div>
                  )}
                  {item.contact_phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-primary-600" />
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{item.contact_phone}</span>
                    </div>
                  )}
                  {item.contact_email && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{item.contact_email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRequestItem}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Request This Item
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Posted on {new Date(item.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Item ID: {item.id}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Request Modal */}
      {item && (
        <RequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          item={{
            id: item.id,
            title: item.title,
            contact_name: item.contact_name,
            contact_email: item.contact_email,
            contact_phone: item.contact_phone
          }}
        />
      )}
    </div>
  )
} 