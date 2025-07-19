'use client'

import { Item } from '@/lib/supabase'
import { MapPin, Tag, Calendar } from 'lucide-react'
import Image from 'next/image'

interface ItemCardProps {
  item: Item
  onViewDetails: (item: Item) => void
}

export default function ItemCard({ item, onViewDetails }: ItemCardProps) {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'bg-green-100 text-green-800'
      case 'Good':
        return 'bg-blue-100 text-blue-800'
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800'
      case 'Damaged':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div className="relative h-48 w-full">
        <div className="relative h-48 w-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover object-center"
            />
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm font-medium text-gray-600">{item.category}</div>
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
            {item.condition}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-500 text-xs">
            <Tag className="w-3 h-3 mr-1" />
            <span>{item.category}</span>
          </div>
          
          <div className="flex items-center text-gray-500 text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{item.postcode} {item.city && `(${item.city})`}</span>
          </div>
          
          <div className="flex items-center text-gray-500 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(item.created_at)}</span>
          </div>
        </div>
        
        <button
          onClick={() => onViewDetails(item)}
          className="mt-auto w-full bg-primary-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
        >
          View Details
        </button>
      </div>
    </div>
  )
} 