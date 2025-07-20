'use client'

import { useState } from 'react'
import { Star, X, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemTitle: string
  transactionType: 'donor' | 'requester'
}

export default function RatingModal({ isOpen, onClose, itemId, itemTitle, transactionType }: RatingModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      // Insert rating into database
      const { error } = await supabase
        .from('ratings')
        .insert([
          {
            item_id: itemId,
            user_id: user?.id,
            rating: rating,
            comment: comment.trim(),
            transaction_type: transactionType,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        throw error
      }

      alert('Thank you for your feedback!')
      onClose()
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Error submitting rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return 'Select Rating'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Rate Your Experience</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Item Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-1">{itemTitle}</h3>
          <p className="text-sm text-gray-600">
            {transactionType === 'donor' ? 'You donated this item' : 'You received this item'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate this experience? <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredStar || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {getRatingText(rating)}
            </p>
          </div>

          {/* Quick Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Feedback
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setComment(prev => prev + 'Great communication, smooth transaction. ')}
                className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <ThumbsUp className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm">Smooth</span>
              </button>
              <button
                type="button"
                onClick={() => setComment(prev => prev + 'Item was as described. ')}
                className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <ThumbsUp className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm">As Described</span>
              </button>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium resize-none"
                placeholder="Share your experience with this transaction..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 