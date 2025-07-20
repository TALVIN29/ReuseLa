'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import { Upload, MapPin, AlertCircle, Phone, Mail, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function PostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    postcode: '',
    weight: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    image: null as File | null
  })
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      alert('Please login or register to post items.')
      router.push('/login')
    }
  }, [user, router])

  const categories = ['Books', 'Appliances', 'Furniture', 'Others']
  const conditions = ['New', 'Good', 'Fair', 'Damaged']

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCityFromPostcode = (postcode: string) => {
    if (!postcode || postcode.length !== 5 || isNaN(Number(postcode))) {
      return ''
    }
    
    const pcNum = parseInt(postcode, 10)
    
    if (pcNum >= 10000 && pcNum <= 14999) {
      if (pcNum >= 13000 && pcNum <= 13999) return 'Butterworth'
      return 'Penang'
    } else if (pcNum >= 40000 && pcNum <= 48999) {
      if (pcNum >= 47500 && pcNum <= 47699) return 'Subang Jaya'
      if (pcNum >= 46000 && pcNum <= 46999) return 'Petaling Jaya'
      return 'Selangor'
    } else if (pcNum >= 50000 && pcNum <= 60000) {
      return 'Kuala Lumpur'
    }
    return ''
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required'
    }

    if (!formData.postcode) {
      newErrors.postcode = 'Postcode is required'
    } else if (formData.postcode.length !== 5 || isNaN(Number(formData.postcode))) {
      newErrors.postcode = 'Please enter a valid 5-digit postcode'
    } else if (!getCityFromPostcode(formData.postcode)) {
      newErrors.postcode = 'Location not found for this postcode'
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required'
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required'
    } else if (!/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/.test(formData.contactPhone.replace(/[-\s]/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid Malaysian phone number'
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
    }

    if (!formData.weight.trim()) {
      newErrors.weight = 'Weight is required'
    } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight (greater than 0)'
    }

    if (!formData.image) {
      newErrors.image = 'Please upload a photo'
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
      // 1. Upload image to Supabase Storage
      let imageUrl = ''
      if (formData.image) {
        try {
          const fileExt = formData.image.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `item-images/${fileName}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('items')
            .upload(filePath, formData.image)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            if (uploadError.message.includes('Bucket not found')) {
              throw new Error('Storage bucket not found. Please create an "items" bucket in your Supabase dashboard.')
            }
            throw new Error(`Image upload failed: ${uploadError.message}`)
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('items')
            .getPublicUrl(filePath)
          
          imageUrl = urlData.publicUrl
        } catch (uploadError) {
          console.error('Image upload error:', uploadError)
          // For now, continue without image upload
          alert('Warning: Image upload failed. The item will be posted without an image. Please check your Supabase storage setup.')
          imageUrl = '' // Continue without image
        }
      }

      // 2. Create item record in database
      const city = getCityFromPostcode(formData.postcode)
      
      const { data: itemData, error: insertError } = await supabase
        .from('items')
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            condition: formData.condition,
            postcode: formData.postcode,
            city: city,
            weight: Number(formData.weight),
            image_url: imageUrl,
            contact_name: formData.contactName.trim(),
            contact_phone: formData.contactPhone.trim(),
            contact_email: formData.contactEmail.trim(),
            status: 'Available',
            user_id: user?.id || 'anonymous'
          }
        ])
        .select()

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`)
      }

      alert('Item posted successfully!')
      router.push('/')
    } catch (error) {
      console.error('Error posting item:', error)
      alert(`Error posting item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="p-4 pt-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Post Your Item for Reuse</h1>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
          {/* Photo Upload */}
          <div className="bg-gradient-to-br from-white to-primary-100 p-6 rounded-2xl shadow-lg border-2 border-primary-400">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Upload Photo <span className="text-red-500">*</span>
            </label>
            
            <div className="flex flex-col items-center">
              {!imagePreview ? (
                <label className="cursor-pointer bg-blue-100 text-blue-700 py-8 px-6 rounded-xl font-semibold hover:bg-blue-200 transition-all duration-200 hover-scale flex items-center justify-center w-full border-2 border-dashed border-blue-300 min-h-[200px]">
                  <div className="text-center flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 mb-3" />
                    <div className="text-lg font-semibold mb-1">Choose Photo</div>
                    <div className="text-sm text-blue-600">Click to upload an image of your item</div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="w-full">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-80 object-contain rounded-xl border-2 border-gray-200 shadow-lg"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: null }))
                          setImagePreview('')
                        }}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                        title="Remove photo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <label className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-md cursor-pointer" title="Change photo">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-600">✅ Photo uploaded successfully! You can change or remove it using the buttons above.</p>
                  </div>
                </div>
              )}
              
              {errors.image && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.image}
                </p>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="bg-gradient-to-br from-white to-secondary-100 p-6 rounded-2xl shadow-lg border-2 border-secondary-400 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Item Details</h3>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium"
                placeholder="e.g., Children's Story Books"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium resize-y"
                placeholder="Describe the item's condition, what's included, etc."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 font-medium"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 font-medium"
              >
                <option value="">Select Condition</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
              {errors.condition && (
                <p className="text-red-500 text-sm mt-1">{errors.condition}</p>
              )}
            </div>

            {/* Postcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postcode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                  maxLength={5}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="e.g., 47300"
                />
              </div>
              {formData.postcode.length === 5 && getCityFromPostcode(formData.postcode) && (
                <p className="text-green-600 text-sm mt-1">
                  Location: {getCityFromPostcode(formData.postcode)}
                </p>
              )}
              {errors.postcode && (
                <p className="text-red-500 text-sm mt-1">{errors.postcode}</p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium"
                placeholder="e.g., 2.5"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-white to-accent-100 p-6 rounded-2xl shadow-lg border-2 border-accent-400 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            
            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="Your full name"
                />
              </div>
              {errors.contactName && (
                <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="e.g., 012-345-6789"
                />
              </div>
              {errors.contactPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="your@email.com"
                />
              </div>
              {errors.contactEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-success-600 to-primary-600 text-white py-4 rounded-xl text-lg font-bold shadow-xl hover:from-success-700 hover:to-primary-700 transition-all duration-200 hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting Item...' : 'Post Item'}
          </button>
        </form>
      </main>
    </div>
  )
} 