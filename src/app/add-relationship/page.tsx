'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthHandlerMCP'
import { useRouter } from 'next/navigation'
import { Heart, ArrowLeft, Calendar, MapPin, Clock, Star } from 'lucide-react'
import { createClientComponentClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { FormattedMessage, useIntl } from 'react-intl'
import { validateData, RelationshipSchema, sanitizeString } from '@/lib/validation'

export default function AddRelationshipPage() {
  const { user } = useAuth()
  const router = useRouter()
  const intl = useIntl()
  const supabase = createClientComponentClient()
  
  const [formData, setFormData] = useState({
    type: 'Romantique',
    name: '',
    start_date: '',
    end_date: '',
    location: '',
    feelings: '',
    rating: 5,
    private_notes: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Verifier si c'est un utilisateur de test
  const isTestUser = typeof document !== 'undefined' && 
    document.cookie.includes('test-user=true')

  // Définir les types de relation avec internationalisation
  const relationshipTypes = [
    { value: 'Romantique', labelKey: 'addRelationship.types.romantic', color: 'pink' },
    { value: 'Sexuelle', labelKey: 'addRelationship.types.sexual', color: 'purple' },
    { value: 'Amitié', labelKey: 'addRelationship.types.friendship', color: 'blue' },
    { value: 'Friendzone', labelKey: 'addRelationship.types.friendzone', color: 'orange' },
    { value: 'Autre', labelKey: 'addRelationship.types.other', color: 'gray' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Début soumission formulaire', { user: user?.id, isTestUser, formData })
    
    if (!user && !isTestUser) {
      console.warn('Aucun utilisateur connecté')
      return
    }

    // Validation côté client
    if (!formData.name.trim()) {
      console.log('Validation échoué: nom manquant')
      setError(intl.formatMessage({ id: 'addRelationship.errors.nameRequired' }))
      return
    }

    console.log('Démarrage soumission relation', { name: formData.name, type: formData.type })
    setIsLoading(true)
    setError('')

    try {
      // Pour les utilisateurs de test, simuler un succès
      if (isTestUser) {
        // Simuler un délai
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Stocker la relation dans le localStorage pour les tests
        const testRelations = JSON.parse(localStorage.getItem('test-relations') || '[]')
        const newRelation = {
          id: `test-${Date.now()}`,
          user_id: 'test-user-id',
          type: formData.type,
          name: formData.name.trim(),
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          location: formData.location?.trim() || null,
          feelings: formData.feelings?.trim() || null,
          rating: formData.rating,
          private_notes: formData.private_notes?.trim() || null,
          created_at: new Date().toISOString()
        }
        testRelations.push(newRelation)
        localStorage.setItem('test-relations', JSON.stringify(testRelations))
        
        router.push('/home')
        return
      }
      
      if (!user?.id) {
        setError(intl.formatMessage({ id: 'addRelationship.errors.notAuthenticated' }))
        setIsLoading(false)
        return
      }
      
      // Préparer les données pour l'insertion
      const submissionData = {
        ...formData,
        user_id: user.id,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      }

      console.log('Insertion relation en base', submissionData)

      const { data, error: insertError } = await supabase
        .from('relationships')
        .insert(submissionData)
        .select()
        .single()

      console.log('Résultat insertion', { success: !!data, hasError: !!insertError })

      if (insertError) {
        console.error('Erreur insertion relation', insertError)
        
        if (insertError.code === '23505') {
          setError(intl.formatMessage({ id: 'addRelationship.errors.duplicateName' }))
        } else {
          setError(intl.formatMessage({ id: 'addRelationship.errors.insertError' }, { message: insertError.message || 'Erreur inconnue' }))
        }

      } else if (data) {
        console.log('Relation ajoutée', user?.id, { name: formData.name, type: formData.type })
        toast.success(intl.formatMessage({ id: 'addRelationship.success.added' }))
        router.push('/home')
      } else {
        console.error('Aucune donnée retournée après insertion')
        setError(intl.formatMessage({ id: 'addRelationship.errors.noDataReturned' }))
      }
    } catch (error: any) {
      console.error('Erreur inattendue ajout relation', error)
      setError(intl.formatMessage({ id: 'addRelationship.errors.unexpected' }, { message: error.message || 'Erreur inconnue' }))
    } finally {
      console.log('Fin soumission formulaire')
      setIsLoading(false)
    }
  }

  // Plus de vérification de quota - système de crédits maintenant utilisé

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>
                <FormattedMessage id="addRelationship.navigation.back" />
              </span>
            </button>
            <div className="flex items-center space-x-3 ml-6">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                <FormattedMessage id="addRelationship.title" />
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type de relation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FormattedMessage id="addRelationship.fields.relationshipType" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                {relationshipTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`font-medium ${
                      formData.type === type.value ? `text-${type.color}-700` : 'text-gray-700'
                    }`}>
                      <FormattedMessage id={type.labelKey} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <FormattedMessage id="addRelationship.fields.nameOrNickname" /> *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                placeholder={intl.formatMessage({ id: 'addRelationship.placeholders.enterName' })}
              />
            </div>

            {/* Date de début */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  <FormattedMessage id="addRelationship.fields.startDate" />
                </label>
                <input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  <FormattedMessage id="addRelationship.fields.endDate" />
                </label>
                <input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Lieu */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                <FormattedMessage id="addRelationship.fields.meetingPlace" />
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                placeholder={intl.formatMessage({ id: 'addRelationship.placeholders.location' })}
              />
            </div>

            {/* Note */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="h-4 w-4 inline mr-1" />
                <FormattedMessage id="addRelationship.fields.rating" />
              </label>
              <input
                id="rating"
                type="range"
                min="1"
                max="10"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>1</span>
                <span className="font-medium">{formData.rating}/10</span>
                <span>10</span>
              </div>
            </div>

            {/* Sentiments */}
            <div>
              <label htmlFor="feelings" className="block text-sm font-medium text-gray-700 mb-2">
                <FormattedMessage id="addRelationship.fields.feelings" />
              </label>
              <textarea
                id="feelings"
                value={formData.feelings}
                onChange={(e) => setFormData({ ...formData, feelings: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                placeholder={intl.formatMessage({ id: 'addRelationship.placeholders.feelings' })}
              />
            </div>

            {/* Note privée */}
            <div>
              <label htmlFor="private_notes" className="block text-sm font-medium text-gray-700 mb-2">
                <FormattedMessage id="addRelationship.fields.privateNotes" />
              </label>
              <textarea
                id="private_notes"
                value={formData.private_notes}
                onChange={(e) => setFormData({ ...formData, private_notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                placeholder={intl.formatMessage({ id: 'addRelationship.placeholders.privateNotes' })}
              />
            </div>

            {/* Boutons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                <FormattedMessage id="addRelationship.buttons.cancel" />
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <FormattedMessage id="addRelationship.buttons.adding" />
                ) : (
                  <FormattedMessage id="addRelationship.buttons.addRelationship" />
                )}
              </button>
            </div>
          </form>
          <style jsx global>{`
            input,
            textarea,
            select {
              color: black !important;
            }
          `}</style>
        </div>
      </main>
    </div>
  )
}
