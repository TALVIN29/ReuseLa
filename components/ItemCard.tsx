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
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'Good':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'Fair':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'Damaged':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
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
    <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 hover-lift animate-scale-in border-2 border-gray-300 dark:border-gray-600">
      <div className="relative h-48 w-full">
        <div className="relative h-48 w-full bg-gradient-to-br from-primary-200 via-secondary-200 to-accent-200 dark:from-primary-800 dark:via-secondary-800 dark:to-accent-800 flex items-center justify-center">
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
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.category}</div>
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
            <Tag className="w-3 h-3 mr-1" />
            <span>{item.category}</span>
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{item.postcode} {item.city && `(${item.city})`}</span>
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(item.created_at)}</span>
          </div>
        </div>
        
        <button
          onClick={() => onViewDetails(item)}
          className="mt-auto w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl text-sm font-bold hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 hover-scale shadow-lg"
        >
          View Details
        </button>
      </div>
    </div>
  )
} 