'use client'

import Link from 'next/link'
import { FormattedMessage, useIntl } from 'react-intl'
import LanguageSelector from '@/components/LanguageSelector'
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  ArrowLeft,
  Check,
  AlertTriangle,
  Database,
  UserCheck,
  Clock,
  Trash2,
  Download,
  Settings,
  Bell,
  Fingerprint,
  ShieldCheck,
  Mail,
  Info
} from 'lucide-react'

export default function SecurityPage() {
  const intl = useIntl()

  const securityFeatures = [
    {
      icon: Lock,
      title: intl.formatMessage({ id: 'securityPage.features.encryption.title' }),
      description: intl.formatMessage({ id: 'securityPage.features.encryption.description' }),
      details: intl.formatMessage({ id: 'securityPage.features.encryption.details' }).split('|'),
      color: "bg-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: Eye,
      title: intl.formatMessage({ id: 'securityPage.features.anonymity.title' }),
      description: intl.formatMessage({ id: 'securityPage.features.anonymity.description' }),
      details: intl.formatMessage({ id: 'securityPage.features.anonymity.details' }).split('|'),
      color: "bg-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: Server,
      title: intl.formatMessage({ id: 'securityPage.features.infrastructure.title' }),
      description: intl.formatMessage({ id: 'securityPage.features.infrastructure.description' }),
      details: intl.formatMessage({ id: 'securityPage.features.infrastructure.details' }).split('|'),
      color: "bg-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: UserCheck,
      title: intl.formatMessage({ id: 'securityPage.features.authentication.title' }),
      description: intl.formatMessage({ id: 'securityPage.features.authentication.description' }),
      details: intl.formatMessage({ id: 'securityPage.features.authentication.details' }).split('|'),
      color: "bg-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ]

  const privacyPrinciples = [
    {
      title: intl.formatMessage({ id: 'securityPage.privacy.principles.minimal.title' }),
      description: intl.formatMessage({ id: 'securityPage.privacy.principles.minimal.description' }),
      icon: Database
    },
    {
      title: intl.formatMessage({ id: 'securityPage.privacy.principles.transparency.title' }),
      description: intl.formatMessage({ id: 'securityPage.privacy.principles.transparency.description' }),
      icon: Eye
    },
    {
      title: intl.formatMessage({ id: 'securityPage.privacy.principles.control.title' }),
      description: intl.formatMessage({ id: 'securityPage.privacy.principles.control.description' }),
      icon: Settings
    },
    {
      title: intl.formatMessage({ id: 'securityPage.privacy.principles.noSale.title' }),
      description: intl.formatMessage({ id: 'securityPage.privacy.principles.noSale.description' }),
      icon: ShieldCheck
    }
  ]

  const complianceStandards = [
    {
      title: intl.formatMessage({ id: 'securityPage.compliance.standards.gdpr.title' }),
      description: intl.formatMessage({ id: 'securityPage.compliance.standards.gdpr.description' }),
      details: intl.formatMessage({ id: 'securityPage.compliance.standards.gdpr.details' }).split('|')
    },
    {
      title: intl.formatMessage({ id: 'securityPage.compliance.standards.iso.title' }),
      description: intl.formatMessage({ id: 'securityPage.compliance.standards.iso.description' }),
      details: intl.formatMessage({ id: 'securityPage.compliance.standards.iso.details' }).split('|')
    },
    {
      title: intl.formatMessage({ id: 'securityPage.compliance.standards.soc.title' }),
      description: intl.formatMessage({ id: 'securityPage.compliance.standards.soc.description' }),
      details: intl.formatMessage({ id: 'securityPage.compliance.standards.soc.details' }).split('|')
    }
  ]

  const dataRights = [
    {
      right: intl.formatMessage({ id: 'securityPage.dataRights.rights.access.right' }),
      description: intl.formatMessage({ id: 'securityPage.dataRights.rights.access.description' }),
      action: intl.formatMessage({ id: 'securityPage.dataRights.rights.access.action' }),
      icon: Download
    },
    {
      right: intl.formatMessage({ id: 'securityPage.dataRights.rights.rectification.right' }),
      description: intl.formatMessage({ id: 'securityPage.dataRights.rights.rectification.description' }),
      action: intl.formatMessage({ id: 'securityPage.dataRights.rights.rectification.action' }),
      icon: Settings
    },
    {
      right: intl.formatMessage({ id: 'securityPage.dataRights.rights.erasure.right' }),
      description: intl.formatMessage({ id: 'securityPage.dataRights.rights.erasure.description' }),
      action: intl.formatMessage({ id: 'securityPage.dataRights.rights.erasure.action' }),
      icon: Trash2
    },
    {
      right: intl.formatMessage({ id: 'securityPage.dataRights.rights.objection.right' }),
      description: intl.formatMessage({ id: 'securityPage.dataRights.rights.objection.description' }),
      action: intl.formatMessage({ id: 'securityPage.dataRights.rights.objection.action' }),
      icon: Bell
    }
  ]

  const securityTips = [
    {
      tip: intl.formatMessage({ id: 'securityPage.tips.items.password.tip' }),
      description: intl.formatMessage({ id: 'securityPage.tips.items.password.description' })
    },
    {
      tip: intl.formatMessage({ id: 'securityPage.tips.items.2fa.tip' }),
      description: intl.formatMessage({ id: 'securityPage.tips.items.2fa.description' })
    },
    {
      tip: intl.formatMessage({ id: 'securityPage.tips.items.sessions.tip' }),
      description: intl.formatMessage({ id: 'securityPage.tips.items.sessions.description' })
    },
    {
      tip: intl.formatMessage({ id: 'securityPage.tips.items.credentials.tip' }),
      description: intl.formatMessage({ id: 'securityPage.tips.items.credentials.description' })
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FormattedMessage id="securityPage.header.backToHome" />
            </Link>
            <LanguageSelector />
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              <FormattedMessage id="securityPage.header.title" />
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              <FormattedMessage id="securityPage.header.subtitle" />
            </p>
          </div>
        </div>
      </header>

      {/* Mesures de sécurité principales */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Protection Multi-Niveaux
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Votre sécurité assurée à chaque étape
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group">
                  <div className={`${feature.bgColor} rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300`}>
                    <div className="flex items-start space-x-6">
                      <div className={`${feature.color} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          {feature.description}
                        </p>
                        
                        <ul className="space-y-3">
                          {feature.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start space-x-3">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {detail}
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

      {/* Principes de confidentialité */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="securityPage.privacy.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="securityPage.privacy.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {privacyPrinciples.map((principle, index) => {
              const Icon = principle.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {principle.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Conformité et certifications */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="securityPage.compliance.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="securityPage.compliance.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-lg w-fit mb-4">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {standard.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {standard.description}
                </p>
                <ul className="space-y-2">
                  {standard.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vos droits */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="securityPage.dataRights.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="securityPage.dataRights.subtitle" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataRights.map((right, index) => {
              const Icon = right.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-full w-fit mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {right.right}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {right.description}
                  </p>
                  <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {right.action}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Conseils de sécurité */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="securityPage.tips.title" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              <FormattedMessage id="securityPage.tips.subtitle" />
            </p>
          </div>

          <div className="space-y-6">
            {securityTips.map((tip, index) => (
              <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                    <Fingerprint className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {tip.tip}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incident de sécurité */}
      <section className="py-20 px-4 bg-red-50 dark:bg-red-900/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full w-fit mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="securityPage.contact.title" />
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              <FormattedMessage id="securityPage.contact.description" />
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-red-200 dark:border-red-800 shadow-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Email de Sécurité
                  </h3>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${intl.formatMessage({ id: 'securityPage.contact.email' })}`} className="hover:text-red-600 dark:hover:text-red-400">
                      <FormattedMessage id="securityPage.contact.email" />
                    </a>
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Réponse Garantie
                  </h3>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span><FormattedMessage id="securityPage.contact.response" /></span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Programme de Bug Bounty
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Nous récompensons la découverte responsable de vulnérabilités. 
                      Contactez-nous pour plus d&apos;informations sur notre programme.
                    </p>
                  </div>
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
            <FormattedMessage id="securityPage.finalSection.title" />
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            <FormattedMessage id="securityPage.finalSection.description" />
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth" 
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FormattedMessage id="securityPage.finalSection.createAccount" />
            </Link>
            <Link
              href="/confidentialite"
              className="text-gray-300 hover:text-white transition-colors underline"
            >
              <FormattedMessage id="securityPage.finalSection.readPrivacyPolicy" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}