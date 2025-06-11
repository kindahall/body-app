'use client'

import Link from 'next/link'
import { 
  Shield, 
  Lock, 
  Heart, 
  BookOpen, 
  Eye, 
  Star, 
  Brain,
  MessageCircle,
  Camera,
  Video,
  FileText,
  Zap,
  Clock,
  Users,
  Globe,
  ChevronRight,
  Check,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  BarChart3,
  Target,
  Moon,
  Sun,
  Smartphone,
  Download,
  Share2,
  Mail
} from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'
import LanguageSelector from '@/components/LanguageSelector'

export default function FeaturesPage() {
  const intl = useIntl()

  const coreFeatures = [
    {
      icon: MessageCircle,
      titleKey: "featuresPage.coreFeatures.confessions.title",
      descriptionKey: "featuresPage.coreFeatures.confessions.description",
      detailsKey: "featuresPage.coreFeatures.confessions.details",
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: BookOpen,
      titleKey: "featuresPage.coreFeatures.journal.title",
      descriptionKey: "featuresPage.coreFeatures.journal.description",
      detailsKey: "featuresPage.coreFeatures.journal.details",
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: Eye,
      titleKey: "featuresPage.coreFeatures.mirror.title",
      descriptionKey: "featuresPage.coreFeatures.mirror.description",
      detailsKey: "featuresPage.coreFeatures.mirror.details",
      gradient: "from-sky-500 to-cyan-600",
      bgColor: "bg-sky-50 dark:bg-sky-900/20"
    },
    {
      icon: Star,
      titleKey: "featuresPage.coreFeatures.wishlist.title",
      descriptionKey: "featuresPage.coreFeatures.wishlist.description",
      detailsKey: "featuresPage.coreFeatures.wishlist.details",
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    }
  ]

  const advancedFeatures = [
    {
      icon: Brain,
      titleKey: "featuresPage.advancedFeatures.ai.title",
      descriptionKey: "featuresPage.advancedFeatures.ai.description",
      featuresKey: "featuresPage.advancedFeatures.ai.features"
    },
    {
      icon: TrendingUp,
      titleKey: "featuresPage.advancedFeatures.analytics.title",
      descriptionKey: "featuresPage.advancedFeatures.analytics.description",
      featuresKey: "featuresPage.advancedFeatures.analytics.features"
    },
    {
      icon: Shield,
      titleKey: "featuresPage.advancedFeatures.security.title",
      descriptionKey: "featuresPage.advancedFeatures.security.description",
      featuresKey: "featuresPage.advancedFeatures.security.features"
    },
    {
      icon: Zap,
      titleKey: "featuresPage.advancedFeatures.credits.title",
      descriptionKey: "featuresPage.advancedFeatures.credits.description",
      featuresKey: "featuresPage.advancedFeatures.credits.features"
    },
    {
      icon: Share2,
      titleKey: "featuresPage.advancedFeatures.sharing.title",
      descriptionKey: "featuresPage.advancedFeatures.sharing.description",
      featuresKey: "featuresPage.advancedFeatures.sharing.features"
    },
    {
      icon: Target,
      titleKey: "featuresPage.advancedFeatures.goals.title",
      descriptionKey: "featuresPage.advancedFeatures.goals.description",
      featuresKey: "featuresPage.advancedFeatures.goals.features"
    }
  ]

  const technicalFeatures = [
    {
      icon: Smartphone,
      titleKey: "featuresPage.technicalFeatures.responsive.title",
      descriptionKey: "featuresPage.technicalFeatures.responsive.description"
    },
    {
      icon: Moon,
      titleKey: "featuresPage.technicalFeatures.darkMode.title",
      descriptionKey: "featuresPage.technicalFeatures.darkMode.description"
    },
    {
      icon: Globe,
      titleKey: "featuresPage.technicalFeatures.multilingual.title",
      descriptionKey: "featuresPage.technicalFeatures.multilingual.description"
    },
    {
      icon: Download,
      titleKey: "featuresPage.technicalFeatures.offline.title",
      descriptionKey: "featuresPage.technicalFeatures.offline.description"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FormattedMessage id="featuresPage.header.backToHome" />
            </Link>
            <LanguageSelector />
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              <FormattedMessage id="featuresPage.header.title" />
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              <FormattedMessage id="featuresPage.header.subtitle" />
            </p>
          </div>
        </div>
      </header>

      {/* Fonctionnalités principales */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="featuresPage.coreFeatures.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="featuresPage.coreFeatures.subtitle" />
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon
              const details = intl.formatMessage({ id: feature.detailsKey }).split('|')
              
              return (
                <div key={index} className="group">
                  <div className={`${feature.bgColor} rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300`}>
                    <div className="flex items-start space-x-6">
                      <div className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                          <FormattedMessage id={feature.titleKey} />
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          <FormattedMessage id={feature.descriptionKey} />
                        </p>
                        
                        <ul className="space-y-3">
                          {details.map((detail, idx) => (
                            <li key={idx} className="flex items-start space-x-3">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {detail.trim()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Fonctionnalités avancées */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="featuresPage.advancedFeatures.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="featuresPage.advancedFeatures.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon
              const features = intl.formatMessage({ id: feature.featuresKey }).split('|')
              
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-lg w-fit mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    <FormattedMessage id={feature.titleKey} />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    <FormattedMessage id={feature.descriptionKey} />
                  </p>
                  
                  <ul className="space-y-2">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feat.trim()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Fonctionnalités techniques */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="featuresPage.technicalFeatures.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="featuresPage.technicalFeatures.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    <FormattedMessage id={feature.titleKey} />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    <FormattedMessage id={feature.descriptionKey} />
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section de prochaines fonctionnalités */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            <FormattedMessage id="featuresPage.upcoming.title" />
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            <FormattedMessage id="featuresPage.upcoming.subtitle" />
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <Smartphone className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                <FormattedMessage id="featuresPage.upcoming.mobileApps.title" />
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <FormattedMessage id="featuresPage.upcoming.mobileApps.description" />
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                <FormattedMessage id="featuresPage.upcoming.communities.title" />
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <FormattedMessage id="featuresPage.upcoming.communities.description" />
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <Mail className="h-6 w-6 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <FormattedMessage id="featuresPage.upcoming.suggestions.title" />
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              <FormattedMessage id="featuresPage.upcoming.suggestions.description" />
            </p>
            <Link 
              href="mailto:feedback@bodycount.app"
              className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              <FormattedMessage id="featuresPage.upcoming.suggestions.sendSuggestion" />
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            <FormattedMessage id="featuresPage.cta.title" />
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            <FormattedMessage id="featuresPage.cta.subtitle" />
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth" 
              className="inline-block bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FormattedMessage id="featuresPage.cta.startFree" />
            </Link>
            <div className="flex items-center space-x-2 text-gray-400">
              <Check className="h-5 w-5 text-green-400" />
              <span><FormattedMessage id="featuresPage.cta.noCardRequired" /></span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}