'use client'

import Link from 'next/link'
import { FormattedMessage, useIntl } from 'react-intl'
import LanguageSelector from '@/components/LanguageSelector'
import { 
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  Globe,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  Check,
  X,
  Download,
  Trash2,
  Settings,
  Info,
  Clock,
  MapPin,
  FileText,
  Key
} from 'lucide-react'

export default function PrivacyPage() {
  const intl = useIntl()

  const dataTypes = [
    {
      category: intl.formatMessage({ id: 'privacyPage.dataTypes.identification.category' }),
      icon: Users,
      data: intl.formatMessage({ id: 'privacyPage.dataTypes.identification.data' }).split('|'),
      purpose: intl.formatMessage({ id: 'privacyPage.dataTypes.identification.purpose' }),
      retention: intl.formatMessage({ id: 'privacyPage.dataTypes.identification.retention' }),
      dataCollectedTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.identification.dataCollected' }),
      finalityTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.identification.finality' }),
      retentionTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.identification.retentionTitle' })
    },
    {
      category: intl.formatMessage({ id: 'privacyPage.dataTypes.content.category' }),
      icon: FileText,
      data: intl.formatMessage({ id: 'privacyPage.dataTypes.content.data' }).split('|'),
      purpose: intl.formatMessage({ id: 'privacyPage.dataTypes.content.purpose' }),
      retention: intl.formatMessage({ id: 'privacyPage.dataTypes.content.retention' }),
      dataCollectedTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.content.dataCollected' }),
      finalityTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.content.finality' }),
      retentionTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.content.retentionTitle' })
    },
    {
      category: intl.formatMessage({ id: 'privacyPage.dataTypes.usage.category' }),
      icon: Eye,
      data: intl.formatMessage({ id: 'privacyPage.dataTypes.usage.data' }).split('|'),
      purpose: intl.formatMessage({ id: 'privacyPage.dataTypes.usage.purpose' }),
      retention: intl.formatMessage({ id: 'privacyPage.dataTypes.usage.retention' }),
      dataCollectedTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.usage.dataCollected' }),
      finalityTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.usage.finality' }),
      retentionTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.usage.retentionTitle' })
    },
    {
      category: intl.formatMessage({ id: 'privacyPage.dataTypes.technical.category' }),
      icon: Settings,
      data: intl.formatMessage({ id: 'privacyPage.dataTypes.technical.data' }).split('|'),
      purpose: intl.formatMessage({ id: 'privacyPage.dataTypes.technical.purpose' }),
      retention: intl.formatMessage({ id: 'privacyPage.dataTypes.technical.retention' }),
      dataCollectedTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.technical.dataCollected' }),
      finalityTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.technical.finality' }),
      retentionTitle: intl.formatMessage({ id: 'privacyPage.dataTypes.technical.retentionTitle' })
    }
  ]

  const userRights = [
    {
      right: intl.formatMessage({ id: 'privacyPage.userRights.access.right' }),
      description: intl.formatMessage({ id: 'privacyPage.userRights.access.description' }),
      icon: Download,
      howTo: intl.formatMessage({ id: 'privacyPage.userRights.access.howTo' })
    },
    {
      right: intl.formatMessage({ id: 'privacyPage.userRights.rectification.right' }),
      description: intl.formatMessage({ id: 'privacyPage.userRights.rectification.description' }),
      icon: Settings,
      howTo: intl.formatMessage({ id: 'privacyPage.userRights.rectification.howTo' })
    },
    {
      right: intl.formatMessage({ id: 'privacyPage.userRights.erasure.right' }),
      description: intl.formatMessage({ id: 'privacyPage.userRights.erasure.description' }),
      icon: Trash2,
      howTo: intl.formatMessage({ id: 'privacyPage.userRights.erasure.howTo' })
    },
    {
      right: intl.formatMessage({ id: 'privacyPage.userRights.portability.right' }),
      description: intl.formatMessage({ id: 'privacyPage.userRights.portability.description' }),
      icon: FileText,
      howTo: intl.formatMessage({ id: 'privacyPage.userRights.portability.howTo' })
    },
    {
      right: intl.formatMessage({ id: 'privacyPage.userRights.objection.right' }),
      description: intl.formatMessage({ id: 'privacyPage.userRights.objection.description' }),
      icon: X,
      howTo: intl.formatMessage({ id: 'privacyPage.userRights.objection.howTo' })
    },
    {
      right: intl.formatMessage({ id: 'privacyPage.userRights.limitation.right' }),
      description: intl.formatMessage({ id: 'privacyPage.userRights.limitation.description' }),
      icon: Shield,
      howTo: intl.formatMessage({ id: 'privacyPage.userRights.limitation.howTo' })
    }
  ]

  const securityMeasures = [
    {
      measure: intl.formatMessage({ id: 'privacyPage.security.encryption.measure' }),
      description: intl.formatMessage({ id: 'privacyPage.security.encryption.description' }),
      icon: Lock
    },
    {
      measure: intl.formatMessage({ id: 'privacyPage.security.anonymization.measure' }),
      description: intl.formatMessage({ id: 'privacyPage.security.anonymization.description' }),
      icon: Eye
    },
    {
      measure: intl.formatMessage({ id: 'privacyPage.security.access.measure' }),
      description: intl.formatMessage({ id: 'privacyPage.security.access.description' }),
      icon: Key
    },
    {
      measure: intl.formatMessage({ id: 'privacyPage.security.monitoring.measure' }),
      description: intl.formatMessage({ id: 'privacyPage.security.monitoring.description' }),
      icon: Shield
    },
    {
      measure: intl.formatMessage({ id: 'privacyPage.security.backups.measure' }),
      description: intl.formatMessage({ id: 'privacyPage.security.backups.description' }),
      icon: Database
    },
    {
      measure: intl.formatMessage({ id: 'privacyPage.security.audits.measure' }),
      description: intl.formatMessage({ id: 'privacyPage.security.audits.description' }),
      icon: Check
    }
  ]

  const cookieTypes = [
    {
      type: intl.formatMessage({ id: 'privacyPage.cookies.essential.type' }),
      purpose: intl.formatMessage({ id: 'privacyPage.cookies.essential.purpose' }),
      required: true,
      examples: intl.formatMessage({ id: 'privacyPage.cookies.essential.examples' }).split('|')
    },
    {
      type: intl.formatMessage({ id: 'privacyPage.cookies.analytics.type' }),
      purpose: intl.formatMessage({ id: 'privacyPage.cookies.analytics.purpose' }),
      required: false,
      examples: intl.formatMessage({ id: 'privacyPage.cookies.analytics.examples' }).split('|')
    },
    {
      type: intl.formatMessage({ id: 'privacyPage.cookies.personalization.type' }),
      purpose: intl.formatMessage({ id: 'privacyPage.cookies.personalization.purpose' }),
      required: false,
      examples: intl.formatMessage({ id: 'privacyPage.cookies.personalization.examples' }).split('|')
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FormattedMessage id="privacyPage.header.backToHome" />
            </Link>
            <LanguageSelector />
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              <FormattedMessage id="privacyPage.header.title" />
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              <FormattedMessage id="privacyPage.header.subtitle" />
            </p>
            <div className="mt-6 text-sm text-blue-200">
              <p><FormattedMessage id="privacyPage.header.lastUpdate" /></p>
            </div>
          </div>
        </div>
      </header>

      {/* Introduction */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 mb-12">
            <div className="flex items-start space-x-4">
              <Info className="h-8 w-8 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  <FormattedMessage id="privacyPage.introduction.engagement.title" />
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <FormattedMessage id="privacyPage.introduction.engagement.description" />
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="privacyPage.introduction.engagement.commitment" />
                </p>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              <FormattedMessage id="privacyPage.introduction.dataCollection.title" />
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              <FormattedMessage id="privacyPage.introduction.dataCollection.description" />
            </p>
          </div>
        </div>
      </section>

      {/* Types de données */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {dataTypes.map((type, index) => {
              const Icon = type.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {type.category}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {type.dataCollectedTitle}
                      </h4>
                      <ul className="space-y-1">
                        {type.data.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {type.finalityTitle}
                          </span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{type.purpose}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {type.retentionTitle}
                          </span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{type.retention}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Utilisation des données */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            <FormattedMessage id="privacyPage.utilization.title" />
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <Check className="h-8 w-8 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                <FormattedMessage id="privacyPage.utilization.whatWeDo" />
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• <FormattedMessage id="privacyPage.utilization.provideServices" /></li>
                <li>• <FormattedMessage id="privacyPage.utilization.generatePersonalizedIA" /></li>
                <li>• <FormattedMessage id="privacyPage.utilization.ensureAccountSecurity" /></li>
                <li>• <FormattedMessage id="privacyPage.utilization.improveFeatures" /></li>
                <li>• <FormattedMessage id="privacyPage.utilization.contactForSupport" /></li>
              </ul>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <X className="h-8 w-8 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                <FormattedMessage id="privacyPage.utilization.whatWeNeverDo" />
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><FormattedMessage id="privacyPage.utilization.sellData" /></li>
                <li><FormattedMessage id="privacyPage.utilization.shareConfessions" /></li>
                <li><FormattedMessage id="privacyPage.utilization.useDataForAdvertising" /></li>
                <li><FormattedMessage id="privacyPage.utilization.accessDataWithoutReason" /></li>
                <li><FormattedMessage id="privacyPage.utilization.keepDataIndefinitely" /></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="privacyPage.security.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="privacyPage.security.description" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityMeasures.map((measure, index) => {
              const Icon = measure.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg text-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {measure.measure}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {measure.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Droits des utilisateurs */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="privacyPage.userRights.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="privacyPage.userRights.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRights.map((right, index) => {
              const Icon = right.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                      <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {right.right}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {right.description}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <FormattedMessage id="privacyPage.userRights.howToLabel" />:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {right.howTo}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Cookies */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            <FormattedMessage id="privacyPage.cookies.title" />
          </h2>
          
          <div className="space-y-6">
            {cookieTypes.map((cookie, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {cookie.type}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cookie.required 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    <FormattedMessage id={cookie.required ? 'privacyPage.cookies.required' : 'privacyPage.cookies.optional'} />
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {cookie.purpose}
                </p>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    <FormattedMessage id="privacyPage.cookies.examples" /> :
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cookie.examples.map((example, idx) => (
                      <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transferts et rétention */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                <FormattedMessage id="privacyPage.dataTransfers.title" />
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <MapPin className="h-8 w-8 text-blue-500 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <FormattedMessage id="privacyPage.dataTransfers.description" />
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="privacyPage.dataTransfers.noThirdCountry" />
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                <FormattedMessage id="privacyPage.dataRetention.title" />
              </h2>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <Clock className="h-8 w-8 text-green-500 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <FormattedMessage id="privacyPage.dataRetention.description" />
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <FormattedMessage id="privacyPage.dataRetention.accountDeletion" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact et modifications */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                <FormattedMessage id="privacyPage.policyChanges.title" />
              </h2>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-orange-500 mt-1" />
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    <FormattedMessage id="privacyPage.policyChanges.description" />
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <FormattedMessage id="privacyPage.policyChanges.notification" />
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                <FormattedMessage id="privacyPage.contact.title" />
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      <FormattedMessage id="privacyPage.contact.dpo.title" />
                    </p>
                    <a href={`mailto:${intl.formatMessage({ id: 'privacyPage.contact.dpo.email' })}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      <FormattedMessage id="privacyPage.contact.dpo.email" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      <FormattedMessage id="privacyPage.contact.general.title" />
                    </p>
                    <a href={`mailto:${intl.formatMessage({ id: 'privacyPage.contact.general.email' })}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      <FormattedMessage id="privacyPage.contact.general.email" />
                    </a>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <FormattedMessage id="privacyPage.contact.cnil" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            <FormattedMessage id="privacyPage.finalSection.title" />
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            <FormattedMessage id="privacyPage.finalSection.description" />
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth" 
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FormattedMessage id="privacyPage.finalSection.createAccount" />
            </Link>
            <Link
              href="/securite"
              className="text-gray-300 hover:text-white transition-colors underline"
            >
              <FormattedMessage id="privacyPage.finalSection.learnMore" />
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-400">
            <p><FormattedMessage id="privacyPage.finalSection.features" /></p>
          </div>
        </div>
      </section>
    </div>
  )
} 