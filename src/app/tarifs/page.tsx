'use client'

import Link from 'next/link'
import { 
  Shield, 
  Check, 
  ArrowLeft,
  Zap,
  Star,
  Crown,
  Sparkles,
  Clock,
  CreditCard,
  Gift,
  Users,
  Brain,
  TrendingUp,
  HelpCircle,
  Euro,
  Calendar,
  Infinity,
  Plus,
  Minus
} from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import LanguageSelector from '@/components/LanguageSelector'

export default function PricingPage() {
  const [selectedPack, setSelectedPack] = useState<'petit' | 'moyen' | 'grand'>('moyen')
  const intl = useIntl()

  const creditPacks = [
    {
      id: 'petit',
      nameKey: 'pricingPage.creditPacks.small.name',
      price: 4.99,
      credits: 50,
      analyses: 5,
      descriptionKey: 'pricingPage.creditPacks.small.description',
      icon: Zap,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      popular: false,
      featuresKey: 'pricingPage.creditPacks.small.features'
    },
    {
      id: 'moyen',
      nameKey: 'pricingPage.creditPacks.medium.name',
      price: 11.99,
      credits: 150,
      analyses: 15,
      descriptionKey: 'pricingPage.creditPacks.medium.description',
      icon: Crown,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-300 dark:border-purple-600',
      popular: true,
      featuresKey: 'pricingPage.creditPacks.medium.features'
    },
    {
      id: 'grand',
      nameKey: 'pricingPage.creditPacks.large.name',
      price: 29.99,
      credits: 500,
      analyses: 50,
      descriptionKey: 'pricingPage.creditPacks.large.description',
      icon: Sparkles,
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      borderColor: 'border-yellow-300 dark:border-yellow-700',
      popular: false,
      featuresKey: 'pricingPage.creditPacks.large.features'
    }
  ]

  const freeFeatures = [
    {
      icon: Gift,
      titleKey: 'pricingPage.howItWorks.freeFeatures.freeCredits.title',
      descriptionKey: 'pricingPage.howItWorks.freeFeatures.freeCredits.description'
    },
    {
      icon: Calendar,
      titleKey: 'pricingPage.howItWorks.freeFeatures.dailyBonus.title',
      descriptionKey: 'pricingPage.howItWorks.freeFeatures.dailyBonus.description'
    },
    {
      icon: Infinity,
      titleKey: 'pricingPage.howItWorks.freeFeatures.noExpiration.title',
      descriptionKey: 'pricingPage.howItWorks.freeFeatures.noExpiration.description'
    }
  ]

  const usageExamples = [
    {
      scenarioKey: 'pricingPage.usageExamples.occasional.scenario',
      descriptionKey: 'pricingPage.usageExamples.occasional.description',
      recommendationKey: 'pricingPage.usageExamples.occasional.recommendation',
      durationKey: 'pricingPage.usageExamples.occasional.duration'
    },
    {
      scenarioKey: 'pricingPage.usageExamples.regular.scenario',
      descriptionKey: 'pricingPage.usageExamples.regular.description',
      recommendationKey: 'pricingPage.usageExamples.regular.recommendation',
      durationKey: 'pricingPage.usageExamples.regular.duration'
    },
    {
      scenarioKey: 'pricingPage.usageExamples.intensive.scenario',
      descriptionKey: 'pricingPage.usageExamples.intensive.description',
      recommendationKey: 'pricingPage.usageExamples.intensive.recommendation',
      durationKey: 'pricingPage.usageExamples.intensive.duration'
    }
  ]

  const faqs = [
    {
      questionKey: 'pricingPage.faq.items.howCreditsWork.question',
      answerKey: 'pricingPage.faq.items.howCreditsWork.answer'
    },
    {
      questionKey: 'pricingPage.faq.items.noCreditsLeft.question',
      answerKey: 'pricingPage.faq.items.noCreditsLeft.answer'
    },
    {
      questionKey: 'pricingPage.faq.items.refund.question',
      answerKey: 'pricingPage.faq.items.refund.answer'
    },
    {
      questionKey: 'pricingPage.faq.items.hiddenFees.question',
      answerKey: 'pricingPage.faq.items.hiddenFees.answer'
    },
    {
      questionKey: 'pricingPage.faq.items.shareCredits.question',
      answerKey: 'pricingPage.faq.items.shareCredits.answer'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FormattedMessage id="pricingPage.header.backToHome" />
            </Link>
            <LanguageSelector />
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              <FormattedMessage id="pricingPage.header.title" />
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              <FormattedMessage id="pricingPage.header.subtitle" />
            </p>
          </div>
        </div>
      </header>

      {/* Comment ça marche */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="pricingPage.howItWorks.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="pricingPage.howItWorks.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {freeFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                  <div className="bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-full w-fit mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    <FormattedMessage id={feature.titleKey} />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    <FormattedMessage id={feature.descriptionKey} />
                  </p>
                </div>
              )
            })}
          </div>

          {/* Coût par analyse */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center border border-blue-200 dark:border-blue-800">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              <FormattedMessage id="pricingPage.howItWorks.creditsExplanation.title" />
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              <FormattedMessage id="pricingPage.howItWorks.creditsExplanation.description" />
            </p>
          </div>
        </div>
      </section>

      {/* Packs de crédits */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="pricingPage.creditPacks.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="pricingPage.creditPacks.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {creditPacks.map((pack) => {
              const Icon = pack.icon
              const isSelected = selectedPack === pack.id
              const features = intl.formatMessage({ id: pack.featuresKey }).split('|')
              
              return (
                <div 
                  key={pack.id}
                  className={`relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg transition-all duration-300 cursor-pointer ${
                    pack.popular 
                      ? 'ring-2 ring-purple-500 scale-105' 
                      : isSelected 
                        ? 'ring-2 ring-blue-500' 
                        : 'hover:shadow-xl hover:scale-102'
                  }`}
                  onClick={() => setSelectedPack(pack.id as any)}
                >
                  {pack.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      <FormattedMessage id="pricingPage.creditPacks.mostPopular" />
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className={`bg-gradient-to-br ${pack.gradient} p-4 rounded-full w-fit mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      <FormattedMessage id={pack.nameKey} />
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      <FormattedMessage id={pack.descriptionKey} />
                    </p>
                    
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {pack.price}€
                      </div>
                      <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                        {pack.credits} crédits
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        = {pack.analyses} <FormattedMessage id="pricingPage.creditPacks.small.analyses" />
                      </div>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature.trim()}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href="/auth" 
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                      pack.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FormattedMessage id="pricingPage.creditPacks.buyPack" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Exemples d'utilisation */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="pricingPage.usageExamples.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="pricingPage.usageExamples.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {usageExamples.map((example, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <FormattedMessage id={example.scenarioKey} />
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  <FormattedMessage id={example.descriptionKey} />
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <FormattedMessage id="pricingPage.usageExamples.recommendation" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">
                    <FormattedMessage id={example.recommendationKey} />
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    <FormattedMessage id={example.durationKey} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="pricingPage.faq.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="pricingPage.faq.subtitle" />
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <HelpCircle className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      <FormattedMessage id={faq.questionKey} />
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <FormattedMessage id={faq.answerKey} />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sécurité des paiements */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="pricingPage.security.title" />
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <FormattedMessage id="pricingPage.security.description" />
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span><FormattedMessage id="pricingPage.security.features.cards" /></span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span><FormattedMessage id="pricingPage.security.features.ssl" /></span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4" />
                <span><FormattedMessage id="pricingPage.security.features.pci" /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            <FormattedMessage id="pricingPage.cta.title" />
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            <FormattedMessage id="pricingPage.cta.subtitle" />
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth" 
              className="inline-block bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FormattedMessage id="pricingPage.cta.createAccount" />
            </Link>
            <div className="flex items-center space-x-2 text-gray-400">
              <Check className="h-5 w-5 text-green-400" />
              <span><FormattedMessage id="pricingPage.cta.noCardRequired" /></span>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-400">
            <FormattedMessage id="pricingPage.cta.bonus" />
          </div>
        </div>
      </section>
    </div>
  )
}