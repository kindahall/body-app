import { describe, it, expect } from 'vitest'
import { getPriorityLabel } from './wishlist.helpers'

describe('Wishlist Helpers', () => {
  describe('getPriorityLabel', () => {
    it('should return "Faible" for priority "low"', () => {
      expect(getPriorityLabel('low')).toBe('Faible')
    })

    it('should return "Moyenne" for priority "medium"', () => {
      expect(getPriorityLabel('medium')).toBe('Moyenne')
    })

    it('should return "Élevée" for priority "high"', () => {
      expect(getPriorityLabel('high')).toBe('Élevée')
    })

    it('should return "Inconnue" for an unknown priority', () => {
      // @ts-expect-error - Testing an invalid value on purpose
      expect(getPriorityLabel('unknown')).toBe('Inconnue')
    })
  })
}) 