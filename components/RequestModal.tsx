'use client'

import { useState } from 'react'
import { X, Send, User, Mail, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: string
    title: string
    contact_name: string
    contact_email: string
    contact_phone: string
  }
}

export default function RequestModal({ isOpen, onClose, item }: RequestModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    message: '',
    preferredContact: 'email' as 'email' | 'phone'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter a message'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    if (!formData.preferredContact) {
      newErrors.preferredContact = 'Please select a preferred contact method'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get the user's session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session found')
      }

      // Create request record in database
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          item_id: item.id,
          requester_id: user?.id,
          requester_email: user?.email,
          requester_name: user?.user_metadata?.full_name || user?.email,
          message: formData.message,
          preferred_contact: formData.preferredContact,
          owner_email: item.contact_email,
          owner_name: item.contact_name,
          item_title: item.title
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send request')
      }

      alert('Request sent successfully! The item owner will be notified.')
      onClose()
      setFormData({ message: '', preferredContact: 'email' })
    } catch (error) {
      console.error('Error sending request:', error)
      alert(`Error sending request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Request Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>Owner: {item.contact_name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>{item.contact_email}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preferred Contact Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Contact Method <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    value="email"
                    checked={formData.preferredContact === 'email'}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value as 'email' | 'phone' }))}
                    className="mr-3 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">Email</span>
                  </div>
                </label>
                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    value="phone"
                    checked={formData.preferredContact === 'phone'}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value as 'email' | 'phone' }))}
                    className="mr-3 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 text-gray-500">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-1.18 2.19l-.7.35a16 16 0 0 0 6 6l.35-.7a2 2 0 0 1 2.19-1.18 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Phone</span>
                  </div>
                </label>
              </div>
              {errors.preferredContact && (
                <p className="text-red-500 text-sm mt-1">{errors.preferredContact}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Owner <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium resize-none"
                  placeholder="Hi! I'm interested in your item. Please let me know if it's still available and when I can pick it up..."
                  rows={4}
                />
              </div>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>

            {/* Your Contact Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Your Contact Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Name: {user?.user_metadata?.full_name || user?.email}</div>
                <div>Email: {user?.email}</div>
                {user?.user_metadata?.phone && (
                  <div>Phone: {user.user_metadata.phone}</div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 