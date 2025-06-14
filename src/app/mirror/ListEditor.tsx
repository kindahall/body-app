'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ReflectionItem } from '@/lib/supabase/mirror'
import { FormattedMessage } from 'react-intl'

interface ListEditorProps {
  sectionIndex: number
  section: ReflectionItem
  placeholder: string
  isEditing: boolean
  onAddItem: (sectionIndex: number, item: string) => void
  onRemoveItem: (sectionIndex: number, itemIndex: number) => void
}

export function ListEditor({
  sectionIndex,
  section,
  placeholder,
  isEditing,
  onAddItem,
  onRemoveItem,
}: ListEditorProps) {
  const [newItem, setNewItem] = useState('')

  const handleAdd = () => {
    if (newItem.trim() && newItem.length <= 60) {
      onAddItem(sectionIndex, newItem)
      setNewItem('')
    }
  }

  return (
    <div className="space-y-3">
      {section.items.map((item, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3 group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <span className="text-gray-800 dark:text-gray-200 flex-1">{item}</span>
          {isEditing && (
            <button
              onClick={() => onRemoveItem(sectionIndex, index)}
              className="text-red-500 hover:text-red-700 text-sm opacity-0 group-hover:opacity-100 transition-opacity ml-2"
            >
              <FormattedMessage id="mirror.editor.removeItem" />
            </button>
          )}
        </div>
      ))}
      
      {isEditing && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            maxLength={60}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim() || newItem.length > 60}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {section.items.length === 0 && !isEditing && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🤔</div>
          <p><FormattedMessage id="mirror.editor.emptySection" /></p>
        </div>
      )}
    </div>
  )
}
