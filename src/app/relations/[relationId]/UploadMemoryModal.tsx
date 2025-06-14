'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, Camera, Video, FileText } from 'lucide-react'
import { memoriesService, MemoryKind, getMemoryIcon, getMemoryLabel } from '@/lib/supabase/memories'
import OptimizedImage from '@/components/ui/OptimizedImage'

interface UploadMemoryModalProps {
  relationId: string
  onClose: () => void
  onUploaded: () => void
}

export default function UploadMemoryModal({ relationId, onClose, onUploaded }: UploadMemoryModalProps) {
  const [selectedKind, setSelectedKind] = useState<MemoryKind>('photo')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const memoryTypes = [
    { kind: 'photo' as const, label: 'Photo', icon: Camera, description: 'JPG, PNG, WebP ≤ 5 Mo' },
    { kind: 'video' as const, label: 'Vidéo', icon: Video, description: 'MP4 ≤ 100 Mo, ≤ 2 min' },
    { kind: 'note' as const, label: 'Note', icon: FileText, description: 'Texte libre' }
  ]

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileSelect = (file: File) => {
    const validation = memoriesService.validateFile(file, selectedKind)
    if (!validation.valid) {
      alert(validation.error)
      return
    }
    setSelectedFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Le titre est obligatoire')
      return
    }

    if (selectedKind !== 'note' && !selectedFile) {
      alert('Veuillez sélectionner un fichier')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      let fileUrl: string | undefined
      let thumbnailUrl: string | undefined

      if (selectedFile && selectedKind !== 'note') {
        setUploadProgress(25)
        
        let fileToUpload = selectedFile
        if (selectedKind === 'photo' && selectedFile.size > 2 * 1024 * 1024) {
          setUploadProgress(50)
          fileToUpload = await memoriesService.compressImage(selectedFile)
        }

        setUploadProgress(75)
        const uploadResult = await memoriesService.uploadFile(fileToUpload, relationId, selectedKind)
        fileUrl = uploadResult.fileUrl
        thumbnailUrl = uploadResult.thumbnailUrl
      }

      setUploadProgress(90)

      await memoriesService.createMemory({
        relation_id: relationId,
        kind: selectedKind,
        title: title.trim(),
        description: description.trim() || undefined,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl
      })

      setUploadProgress(100)
      onUploaded()
    } catch (error) {
      console.error('Error uploading memory:', error)
      alert('Erreur lors de l\'upload du souvenir')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/30 dark:border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Ajouter un souvenir
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Type de souvenir
            </label>
            <div className="grid grid-cols-3 gap-3">
              {memoryTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.kind}
                    type="button"
                    onClick={() => {
                      setSelectedKind(type.kind)
                      setSelectedFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedKind === type.kind
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${
                      selectedKind === type.kind 
                        ? 'text-pink-600 dark:text-pink-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {type.description}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Notre premier rendez-vous"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez ce souvenir..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
          </div>

          {selectedKind !== 'note' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fichier *
              </label>
              
              {selectedFile ? (
                <div className="relative">
                  {selectedKind === 'photo' && (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden">
                      <OptimizedImage
                        src={URL.createObjectURL(selectedFile)}
                        alt="Aperçu de l'image sélectionnée"
                        fill
                        sizes="(max-width: 768px) 100vw, 640px"
                        className="object-cover"
                        quality={85}
                      />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {selectedKind === 'video' && (
                    <div className="relative">
                      <video
                        src={URL.createObjectURL(selectedFile)}
                        className="w-full h-48 object-cover rounded-xl"
                        controls
                      />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="text-4xl mb-4">
                    {getMemoryIcon(selectedKind)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Glissez votre {getMemoryLabel(selectedKind).toLowerCase()} ici ou
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={selectedKind === 'photo' ? 'image/*' : 'video/*'}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-medium"
                  >
                    cliquez pour sélectionner
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedKind === 'photo' 
                      ? 'JPG, PNG, WebP jusqu\'à 5MB' 
                      : 'MP4, WebM jusqu\'à 100MB'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Upload en cours...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!title.trim() || (selectedKind !== 'note' && !selectedFile) || isUploading}
              className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{isUploading ? 'Upload...' : 'Ajouter le souvenir'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
