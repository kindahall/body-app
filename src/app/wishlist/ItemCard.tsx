'use client'

import React from 'react'
import { WishlistItem } from '@/lib/supabase/wishlist'
import { FormattedMessage } from 'react-intl'

interface ItemCardProps {
  item: WishlistItem
  onEdit: () => void
  onDelete: () => void
  onToggleCompleted: () => void
}

export default function ItemCard({ item, onEdit, onDelete, onToggleCompleted }: ItemCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${item.is_completed ? 'bg-gray-100' : 'bg-white'}`}>
      <h3 className="font-bold">{item.title}</h3>
      <p>{item.description}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={onEdit} className="p-2 bg-blue-500 text-white rounded">
          <FormattedMessage id="wishlist.buttons.edit" />
        </button>
        <button onClick={onDelete} className="p-2 bg-red-500 text-white rounded">
          <FormattedMessage id="wishlist.buttons.delete" />
        </button>
        <button onClick={onToggleCompleted} className="p-2 bg-green-500 text-white rounded">
          {item.is_completed ? (
            <FormattedMessage id="wishlist.buttons.undo" />
          ) : (
            <FormattedMessage id="wishlist.buttons.complete" />
          )}
        </button>
      </div>
    </div>
  )
} 