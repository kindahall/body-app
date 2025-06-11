'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useIntl } from 'react-intl'

interface FAQItem {
  question: string
  answer: string
}

export default function FAQAccordion() {
  const intl = useIntl()
  const [openItems, setOpenItems] = useState<number[]>([])

  // Get FAQ items from translations
  const faqItems: FAQItem[] = [
    {
      question: intl.formatMessage({ id: 'faq.items.0.question' }),
      answer: intl.formatMessage({ id: 'faq.items.0.answer' })
    },
    {
      question: intl.formatMessage({ id: 'faq.items.1.question' }),
      answer: intl.formatMessage({ id: 'faq.items.1.answer' })
    },
    {
      question: intl.formatMessage({ id: 'faq.items.2.question' }),
      answer: intl.formatMessage({ id: 'faq.items.2.answer' })
    },
    {
      question: intl.formatMessage({ id: 'faq.items.3.question' }),
      answer: intl.formatMessage({ id: 'faq.items.3.answer' })
    }
  ]

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="space-y-4">
      {faqItems.map((faq: FAQItem, index: number) => {
        const isOpen = openItems.includes(index)
        
        return (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-expanded={isOpen}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                {faq.question}
              </h3>
              <ChevronDown 
                className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-8 pb-6">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}