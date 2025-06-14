'use client'

import { useState, useRef } from 'react'
import { X, Upload, Tag, Calendar, AlertCircle, Image as ImageIcon } from 'lucide-react'
import {
  WishlistItem,
  WishlistCategory,
  PriorityLevel,
  WishlistService,
} from '@/lib/supabase/wishlist'
import {
  getCategoryIcon,
  getCategoryLabel,
  getPriorityColor,
  getPriorityLabel,
} from '@/lib/supabase/wishlist.helpers'
import { toast } from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'

interface AddEditModalProps {
  item?: WishlistItem
  onClose: () => void
  onSave: (data: Omit<WishlistItem, 'id' | 'user_id' | 'created_at' | 'completed_at'>) => void
}

export default function AddEditModal({ item, onClose, onSave }: AddEditModalProps) {
  const intl = useIntl()
  
  const [formData, setFormData] = useState({
    category: (item?.category || 'experience') as WishlistCategory,
    title: item?.title || '',
    description: item?.description || '',
    priority: (item?.priority || 'medium') as PriorityLevel,
    target_date: item?.target_date || '',
    tags: item?.tags || [],
    is_completed: item?.is_completed || false,
    image_url: item?.image_url || ''
  })
  
  const [newTag, setNewTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const categories: Array<{ value: WishlistCategory; labelKey: string; icon: string; descriptionKey: string }> = [
    { value: 'experience', labelKey: 'wishlist.categories.experience', icon: '🌟', descriptionKey: 'wishlist.categories.experienceDesc' },
    { value: 'person', labelKey: 'wishlist.categories.person', icon: '👤', descriptionKey: 'wishlist.categories.personDesc' },
    { value: 'place', labelKey: 'wishlist.categories.place', icon: '📍', descriptionKey: 'wishlist.categories.placeDesc' },
    { value: 'goal', labelKey: 'wishlist.categories.goal', icon: '🎯', descriptionKey: 'wishlist.categories.goalDesc' }
  ]

  const priorities: Array<{ value: PriorityLevel; labelKey: string; descriptionKey: string }> = [
    { value: 'high', labelKey: 'wishlist.priority.high', descriptionKey: 'wishlist.priority.highDesc' },
    { value: 'medium', labelKey: 'wishlist.priority.medium', descriptionKey: 'wishlist.priority.mediumDesc' },
    { value: 'low', labelKey: 'wishlist.priority.low', descriptionKey: 'wishlist.priority.lowDesc' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert(intl.formatMessage({ id: 'wishlist.modal.titleRequired' }))
      return
    }

    setIsSaving(true)
    try {
      onSave(formData)

      if (formData.image_url) {
        const imageFile = new File([formData.image_url], 'image.png', { type: 'image/png' })
        try {
          const imageUrl = await WishlistService.uploadImage(imageFile)
          setFormData(prev => ({ ...prev, image_url: imageUrl }))
        } catch (error: any) {
          console.error('Error uploading image:', error.message || error)
          setFormError(intl.formatMessage({ id: 'wishlist.modal.imageUploadError' }))
          setIsSaving(false)
          return
        }
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error.message || error)
      setFormError(intl.formatMessage({ id: 'wishlist.modal.unexpectedError' }))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return
    
    // Vérifier le type et la taille
    if (!file.type.startsWith('image/')) {
      alert(intl.formatMessage({ id: 'wishlist.modal.imageTypeError' }))
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert(intl.formatMessage({ id: 'wishlist.modal.imageSizeError' }))
      return
    }

    setIsUploading(true)
    try {
      // Pour l'instant, créer une URL locale
      // En production, utiliser wishlistService.uploadImage(file)
      const imageUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, image_url: imageUrl }))
    } catch (error: any) {
      console.error('Error uploading image:', error.message || error)
      toast.error(intl.formatMessage({ id: 'wishlist.modal.imageUploadFailure' }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/30 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {item ? (
              <FormattedMessage id="wishlist.modal.editTitle" />
            ) : (
              <FormattedMessage id="wishlist.modal.createTitle" />
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <FormattedMessage id="wishlist.modal.category" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.category === category.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      <FormattedMessage id={category.labelKey} />
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <FormattedMessage id={category.descriptionKey} />
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FormattedMessage id="wishlist.modal.titleLabel" />
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={intl.formatMessage({ id: 'wishlist.modal.titlePlaceholder' })}
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FormattedMessage id="wishlist.modal.description" />
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={intl.formatMessage({ id: 'wishlist.modal.descriptionPlaceholder' })}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <FormattedMessage id="wishlist.modal.priority" />
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                  className={`p-3 rounded-xl border transition-all text-center ${
                    formData.priority === priority.value
                      ? getPriorityColor(priority.value).replace('text-', 'border-').replace('500', '400') + ' ' + getPriorityColor(priority.value).replace('text-', 'bg-').replace('500', '50') + ' dark:' + getPriorityColor(priority.value).replace('text-', 'bg-').replace('500', '900/30')
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">
                      <FormattedMessage id={priority.labelKey} />
                    </span>
                  </div>
                  <p className="text-xs opacity-75">
                    <FormattedMessage id={priority.descriptionKey} />
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Date cible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FormattedMessage id="wishlist.modal.targetDate" />
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FormattedMessage id="wishlist.modal.tagsLabel" />
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            {formData.tags.length < 10 && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={intl.formatMessage({ id: 'wishlist.modal.tagPlaceholder' })}
                  maxLength={20}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FormattedMessage id="wishlist.modal.addTag" />
                </button>
              </div>
            )}
          </div>

          {/* Upload d'image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FormattedMessage id="wishlist.modal.imageLabel" />
            </label>
            
            {formData.image_url ? (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl"
                  width={400} 
                  height={300}
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <FormattedMessage id="wishlist.modal.dragImage" />
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium disabled:opacity-50"
                >
                  {isUploading ? (
                    <FormattedMessage id="wishlist.modal.uploading" />
                  ) : (
                    <FormattedMessage id="wishlist.modal.clickToSelect" />
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  <FormattedMessage id="wishlist.modal.imageFormats" />
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <FormattedMessage id="wishlist.modal.cancel" />
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isSaving}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>
                {item ? (
                  <FormattedMessage id="wishlist.modal.update" />
                ) : (
                  <FormattedMessage id="wishlist.modal.create" />
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
