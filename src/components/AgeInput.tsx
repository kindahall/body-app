'use client'

import { useState } from 'react'
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

interface AgeInputProps {
  currentAge?: number | null
  onAgeUpdate: (age: number) => Promise<void>
  isLoading?: boolean
  isTestUser?: boolean
}

export default function AgeInput({ currentAge, onAgeUpdate, isLoading = false, isTestUser = false }: AgeInputProps) {
  const [age, setAge] = useState<number | null>(currentAge || null)
  const [error, setError] = useState<string | null>(null)
  const intl = useIntl()

  const handleSubmit = async () => {
    if (!age || age < 18 || age > 99) {
      setError(intl.formatMessage({ id: 'ageInput.errorInvalid' }))
      return
    }

    setError(null)
    try {
      await onAgeUpdate(age)
    } catch (err: any) {
      setError(err.message || intl.formatMessage({ id: 'ageInput.errorUpdate' }))
    }
  }

  if (isTestUser) {
    return (
      <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
        <label className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-yellow-600" />
          </div>
          <span><FormattedMessage id="ageInput.label" /></span>
        </label>
        <div className="w-full px-6 py-4 border border-gray-200/50 rounded-xl bg-gray-50/80 text-gray-700 font-medium backdrop-blur-sm">
          <FormattedMessage id="ageInput.testMode" />
        </div>
        <p className="text-sm text-yellow-600 mt-3 flex items-center space-x-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full block"></span>
          <span><FormattedMessage id="ageInput.testModeDescription" /></span>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
      <label className="flex items-center space-x-3 text-lg font-semibold text-gray-800 mb-4">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <Calendar className="h-5 w-5 text-yellow-600" />
        </div>
        <span><FormattedMessage id="ageInput.required" /> <span className="text-red-500">*</span></span>
      </label>
      
      <div className="flex gap-3">
        <input
          type="number"
          min="18"
          max="99"
          value={age || ''}
          onChange={(e) => {
            const value = e.target.value
            setAge(value ? parseInt(value) : null)
            setError(null)
          }}
          placeholder={intl.formatMessage({ id: 'ageInput.placeholder' })}
          className="flex-1 px-6 py-4 border border-gray-200/50 rounded-xl bg-white/80 text-gray-700 font-medium backdrop-blur-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
        <button
          onClick={handleSubmit}
          disabled={!age || age < 18 || age > 99 || isLoading}
          className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : currentAge ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          <span>{isLoading ? <FormattedMessage id="ageInput.saving" /> : <FormattedMessage id="ageInput.save" />}</span>
        </button>
      </div>
      
      <div className="mt-3 space-y-2">
        <p className="text-sm text-gray-500 flex items-center space-x-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full block"></span>
          <span><FormattedMessage id="ageInput.explanation" /></span>
        </p>
        
        {error && (
          <p className="text-sm text-red-500 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </p>
        )}
        
        {age && (age < 18 || age > 99) && (
          <p className="text-sm text-red-500 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span><FormattedMessage id="ageInput.errorRange" /></span>
          </p>
        )}
        
        {currentAge && (
          <p className="text-sm text-green-600 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span><FormattedMessage id="ageInput.currentAge" values={{ age: currentAge }} /></span>
          </p>
        )}
      </div>
    </div>
  )
}